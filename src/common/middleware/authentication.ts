import { verifyToken } from "../services/token.service"
import { NextFunction, Request, Response } from "express"
import env from "../../config/config.service"
import UserRepo from "../../DB/repo/user.repo"
import { AppError } from "../utils/globalErrorHandler"
import RedisService from "../services/redis.service"

class Authentication {
    private readonly _userModel = new UserRepo
    private readonly _redisService = RedisService
    constructor(private readonly secret_key: string) { }

    auth = async (req: Request , _res: Response, next: NextFunction) => {
        const { authorization } = req.headers

        if (!authorization) throw new AppError('no authentication (token)', 404)

        const [prefix, token] = authorization.split(' ')

        if (prefix !== env.PREFIX) throw new AppError('invalid prefix', 404)

        console.log(this.secret_key)

        const decode = verifyToken({ token: token!, secret_key: this.secret_key })

        if (!decode || !decode?.id) throw new AppError('invalid token', 400)

        const user = await this._userModel.findById(decode.id)

        if (!user) throw new AppError('user not exist', 404)

        if (user.changeCredential?.getTime()! > decode.iat! * 1000) throw new AppError('invalid all token', 400)

        const revokeToken = await this._redisService.getValue(this._redisService.revokeKey({ userId: user._id, jti: decode.jti as unknown as string }))

        if (revokeToken) throw new AppError('invalid token revokeToken', 400)

        req.user = user
        req.decode = decode

        next()
    }
}

export default Authentication

