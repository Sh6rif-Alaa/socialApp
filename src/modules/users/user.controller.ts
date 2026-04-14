import { Router } from "express";
import UserService from './user.service'
import Authentication from "../../common/middleware/authentication";
import authorization from "../../common/middleware/authorization";
import { RoleEnum } from "../../common/enum/user.enum";
import env from "../../config/config.service";

console.log(env.REFRESH_TOKEN_KEY)
const authenticationRefreshToken = new Authentication(env.REFRESH_TOKEN_KEY)

const userRouter = Router({ caseSensitive: true, strict: true })

userRouter.post('/refreshToken', authenticationRefreshToken.auth, authorization([RoleEnum.user]), UserService.refreshToken)

export default userRouter
