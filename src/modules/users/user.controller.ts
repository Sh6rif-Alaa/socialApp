import { Router } from "express";
import UserService from './user.service'
import Authentication from "../../common/middleware/authentication";
import authorization from "../../common/middleware/authorization";
import { RoleEnum } from "../../common/enum/user.enum";
import env from "../../config/config.service";
import chatRouter from "../chat/chat.controller";

const authenticationRefreshToken = new Authentication(env.REFRESH_TOKEN_KEY).auth
const authenticationUser = new Authentication(env.TOKEN_KEY).auth

const userRouter = Router({ caseSensitive: true, strict: true })

userRouter.use("/:userId/chat", chatRouter)

userRouter.get('/getMyProfile', authenticationUser, authorization([RoleEnum.user]), UserService.getMyProfile)
userRouter.post('/refreshToken', authenticationRefreshToken, authorization([RoleEnum.user]), UserService.refreshToken)

export default userRouter
