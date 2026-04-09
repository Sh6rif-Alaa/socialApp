import type { NextFunction, Request, Response } from "express";
import successResponse from "../../common/utils/response.success";
import userModel, { IUser } from "../../DB/models/user.model";
import { Model } from "mongoose";
import { AppError } from "../../common/utils/globalErrorHandler";
import { Compare, Hash } from "../../common/utils/security/hash.security";
import { encrypt } from "../../common/utils/security/encrypt.security";
import * as db_service from '../../DB/db.service'
import { signUpType, signInType } from "./auto.dto";

class AuthService {
    private readonly _userModel: Model<IUser> = userModel
    constructor() { }

    signUp = async (req: Request, res: Response, _next: NextFunction) => {
        const { userName, email, password, age, gender, phone, address }: signUpType = req.body
        const userExist = await db_service.findOne({
            filter: { email },
            model: this._userModel
        })
        if (userExist) throw new AppError('user already exists', 409)
        const user = await db_service.create({
            data: {
                userName, email, age, gender, address,
                phone: phone ? encrypt(phone) : undefined,
                password: Hash({ plainText: password })
            },
            model: this._userModel
        })
        successResponse({ res, message: 'user created successfully', data: user })
    }

    signIn = async (req: Request, res: Response, _next: NextFunction) => {
        const { email, password }: signInType = req.body
        const user = await db_service.findOne({
            filter: { email },
            model: this._userModel
        })
        if (!user) throw new AppError('user not found', 404)
        if (!Compare({ plainText: password, hash: user.password })) throw new AppError('invalid password', 401)
        successResponse({ res, message: 'user logged in successfully', data: { email, password } })
    }
}

export default new AuthService()