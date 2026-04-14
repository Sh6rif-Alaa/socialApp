import type { NextFunction, Request, Response } from "express";
import successResponse from "../../common/utils/response.success";
import { randomUUID } from "node:crypto";
import { generateToken } from "../../common/utils/token.service";
import env from "../../config/config.service";

class UserService {
    constructor() { }

    refreshToken = async (req: Request & { user?: { _id: string } }, res: Response, _next: NextFunction) => {
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
}

export default new UserService()