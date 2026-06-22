import type { NextFunction, Request, Response } from "express";
import successResponse from "../../common/utils/response.success";
import { randomUUID } from "node:crypto";
import { generateToken } from "../../common/services/token.service";
import env from "../../config/config.service";
import UserRepo from "../../DB/repo/user.repo";
import ChatRepo from "../../DB/repo/chat.repo";
import { Hash } from "../../common/utils/security/hash.security";
import { Types } from "mongoose";
import chatModel from "../../DB/models/chat.model";

class UserService {
    private readonly _userModel = UserRepo
    private readonly _chatModel = ChatRepo
    constructor() { }

    refreshToken = async (req: Request, res: Response, _next: NextFunction) => {
        const accessToken = generateToken({
            payload: { id: req.user?._id! },
            secret_key: env.TOKEN_KEY,
            options: {
                expiresIn: "3m",
                jwtid: randomUUID()
            }
        })

        successResponse({ res, token: accessToken })
    }

    getMyProfile = async (req: Request, res: Response, _next: NextFunction) => {
        const user = await this._userModel.findOne({
            filter: { _id: req.user!._id as Types.ObjectId },
            options: {
                populate: [
                    {
                        path: "friends"
                    }
                ]
            }
        })

        const groups = await chatModel.find({
                participants: { $in: [req.user!._id as Types.ObjectId] },
                group: { $exists: true }
        })

        successResponse({ res, data: { user, groups } })
    }

    // =============== graphql methods =============== 
    getUsersGql = async () => {
        return await this._userModel.find()
    }

    getUserByIdGql = async (userId: string) => {
        return await this._userModel.findById(userId.toString())
    }

    createUserGql = async (args: any) => {
        console.log(args)
        args.password = Hash({ plainText: args.password })
        return await this._userModel.create(args)
    }

    updateUserProfileGql = async (args: any, userId: Types.ObjectId) => {
        // userName is a virtual - findOneAndUpdate skips
        if (args.userName !== undefined) {
            const [firstName, ...rest] = (args.userName as string).trim().split(' ')
            args.firstName = firstName
            args.lastName = rest.join(' ') || ''
        }

        return await this._userModel.findOneAndUpdate({
            filter: { _id: userId },
            update: { $set: args }
        })
    }

    deleteUserGql = async (userId: string) => {
        return await this._userModel.findByIdAndDelete(userId)
    }
}

export default new UserService()