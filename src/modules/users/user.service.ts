import type { NextFunction, Request, Response } from "express";
import successResponse from "../../common/utils/response.success";
import { randomUUID } from "node:crypto";
import { generateToken } from "../../common/services/token.service";
import env from "../../config/config.service";
import UserRepo from "../../DB/repo/user.repo";

class UserService {
    private readonly _userModel = new UserRepo
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
        successResponse({ res, data: req.user })
    }
}

export default new UserService()