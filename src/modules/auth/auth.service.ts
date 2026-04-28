import type { NextFunction, Request, Response } from "express";
import successResponse from "../../common/utils/response.success";
import { AppError } from "../../common/utils/globalErrorHandler";
import { Compare, Hash } from "../../common/utils/security/hash.security";
import { encrypt } from "../../common/utils/security/encrypt.security";
import { signUpType, signInType, verifyEmailType, forgetPasswordType, resetPasswordType } from "./auth.dto";
import UserRepo from "../../DB/repo/user.repo";
import { generateOTP, sendEmail } from "../../common/utils/email/send.email";
import { emailTemplate } from "../../common/utils/email/email.template";
import RedisService from "../../common/services/redis.service";
import { eventEmitter } from "../../common/utils/email/email.events";
import { emailEnum } from "../../common/enum/email.enum";
import { ProviderEnum } from "../../common/enum/user.enum";
import { randomUUID } from "node:crypto";
import { generateToken, verifyToken } from "../../common/services/token.service";
import env from "../../config/config.service";
import { OAuth2Client, TokenPayload } from "google-auth-library";
import { Types } from "mongoose";

class AuthService {
    private readonly _userModel = new UserRepo
    constructor() { }

    getTokens = (userId: Types.ObjectId): { accessToken: string, refreshToken: string } => {
        const uuid = randomUUID()

        const accessToken = generateToken({
            payload: { id: userId },
            secret_key: env.TOKEN_KEY,
            options: {
                expiresIn: "1d",
                jwtid: uuid
            }
        })

        const refreshToken = generateToken({
            payload: { id: userId },
            secret_key: env.REFRESH_TOKEN_KEY,
            options: {
                expiresIn: "1y",
                jwtid: uuid
            }
        })

        return { accessToken, refreshToken }
    }

    sendEmailOtp = async ({ email, userName, subject }: { email: string, userName: string | undefined, subject: emailEnum }) => {
        const isBlocked = await RedisService.ttl(RedisService.blockedOtpKey({ email, subject }))
        if (isBlocked > 0)
            throw new AppError(`you are blocked, please try again after ${isBlocked} seconds`, 400)

        const otpTtl = await RedisService.ttl(RedisService.otpKey({ email, subject }))
        if (otpTtl > 0)
            throw new AppError("you already have an active otp, please wait until it expires", 400)

        const otpTrials = Number(await RedisService.getValue(RedisService.maxOtpKey({ email, subject }))) || 0

        if (otpTrials >= 3) {
            await RedisService.setValue({ key: RedisService.blockedOtpKey({ email, subject }), value: 1, ttl: 60 * 15 })
            throw new AppError("you exceeded maximum number of otp requests", 400)
        }

        const OTP = await generateOTP()

        await RedisService.setValue({
            key: RedisService.otpKey({ email, subject }),
            value: Hash({ plainText: `${OTP}` }),
            ttl: 60 * 5
        })

        await RedisService.incr(RedisService.maxOtpKey({ email, subject }))

        if (otpTrials === 0)
            await RedisService.expire({ key: RedisService.maxOtpKey({ email, subject }), ttl: 60 * 15 })

        eventEmitter.emit("confirmEmail", async () => {
            await sendEmail({
                to: email,
                subject:
                    subject === emailEnum.forgetPassword
                        ? "Reset Your Password - SocialApp"
                        : "Verify Your Email - SocialApp",

                html: emailTemplate({
                    userName,
                    otp: OTP,
                    type: subject
                })
            })
        })
    }

    signUp = async (req: Request, res: Response, _next: NextFunction) => {
        const { userName, email, password, age, gender, phone, address }: signUpType = req.body
        await this._userModel.checkUser(email)
        const user = await this._userModel.create({
            userName, email, age, gender, address,
            phone: phone ? encrypt(phone) : undefined,
            password: Hash({ plainText: password })
        })
        await this.sendEmailOtp({ email, userName, subject: emailEnum.confirmEmail })
        successResponse({ res, message: 'user created successfully', data: user })
    }

    signIn = async (req: Request, res: Response, _next: NextFunction) => {
        const { email, password }: signInType = req.body
        const user = await this._userModel.findOne({ filter: { email, confirmed: { $exists: true }, provider: ProviderEnum.system } })
        if (!user) throw new AppError('user not exist or not confirmed (check your email)', 404)
        if (!Compare({ plainText: password, hash: user.password })) throw new AppError('invalid password', 401)

        const { accessToken, refreshToken } = this.getTokens(user._id)

        successResponse({ res, message: 'user logged in successfully', token: { accessToken, refreshToken } })
    }

    signUpWithGmail = async (req: Request, res: Response, _next: NextFunction) => {
        const { idToken } = req.body as { idToken: string }

        const client = new OAuth2Client();

        const ticket = await client.verifyIdToken({
            idToken,
            audience: env.CLIENT_ID,
        });
        const payload = ticket.getPayload();

        if (!payload) throw new AppError("Invalid Google token", 401);

        const { email, email_verified, name, picture } = payload as TokenPayload

        let user = await this._userModel.findOne({ filter: { email: email! } })

        if (!user)
            user = await this._userModel.create({ email: email!, confirmed: email_verified!, userName: name!, profilePicture: { secure_url: picture! }, provider: ProviderEnum.google })

        // login
        if (user.provider === ProviderEnum.system)
            throw new AppError('please log in system only', 400)

        const { accessToken, refreshToken } = this.getTokens(user._id)

        successResponse({ res, message: 'user logged in successfully', token: { accessToken, refreshToken } })
    }

    verifyEmail = async (req: Request, res: Response, _next: NextFunction) => {
        const { email, otp }: verifyEmailType = req.body

        const otpDb = await RedisService.getValue(
            RedisService.otpKey({ email, subject: emailEnum.confirmEmail })
        )

        if (!otpDb) throw new AppError("otp expired or not found", 400)

        if (!Compare({ plainText: otp, hash: otpDb })) throw new AppError("otp not match", 400)

        const user = await this._userModel.findOneAndUpdate({
            filter: { email },
            update: { confirmed: true },
            options: { new: true }
        })

        if (!user) throw new AppError("user not exist", 404)

        await RedisService.del([
            RedisService.otpKey({ email, subject: emailEnum.confirmEmail }),
            RedisService.maxOtpKey({ email, subject: emailEnum.confirmEmail }),
            RedisService.blockedOtpKey({ email, subject: emailEnum.confirmEmail })
        ])

        successResponse({ res, message: "email verified successfully" })
    }

    forgetPassword = async (req: Request, res: Response, _next: NextFunction) => {
        const { email }: forgetPasswordType = req.body

        const user = await this._userModel.findOne({
            filter: { email, confirmed: { $exists: true }, provider: ProviderEnum.system }
        })

        if (!user) throw new AppError("invalid email or not confirmed", 404)

        await this.sendEmailOtp({ email, userName: user.userName, subject: emailEnum.forgetPassword })

        successResponse({ res, message: "otp sent successfully" })
    }

    resetPassword = async (req: Request, res: Response, _next: NextFunction) => {
        const { email, otp, password }: resetPasswordType = req.body

        const otpValue = await RedisService.getValue(RedisService.otpKey({ email, subject: emailEnum.forgetPassword }))

        if (!otpValue) throw new AppError("otp expire", 400)

        if (!Compare({ plainText: otp, hash: otpValue }))
            throw new AppError("invalid otp", 400)

        const user = await this._userModel.findOneAndUpdate({
            filter: { email, confirmed: { $exists: true }, provider: ProviderEnum.system },
            update: {
                password: Hash({ plainText: password }),
                changeCredential: new Date()
            }
        })

        if (!user) throw new AppError("user not exist or not confirmed", 404)

        await RedisService.del([
            RedisService.otpKey({ email, subject: emailEnum.forgetPassword }),
            RedisService.maxOtpKey({ email, subject: emailEnum.forgetPassword }),
            RedisService.blockedOtpKey({ email, subject: emailEnum.forgetPassword })
        ])

        successResponse({ res, message: "password reset successfully" })
    }

    reSendOtp = async (req: Request, res: Response, _next: NextFunction) => {
        const { email }: forgetPasswordType = req.body

        const user = await this._userModel.findOne({
            filter: { email, confirmed: { $exists: false }, provider: ProviderEnum.system }
        })

        if (!user) throw new AppError("user not exist", 404)

        await this.sendEmailOtp({ email, userName: user.userName, subject: emailEnum.confirmEmail })

        successResponse({ res, message: "otp sent successfully" })
    }
}

export default new AuthService()