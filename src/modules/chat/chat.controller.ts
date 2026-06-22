import { Router } from "express";
import ChatService from './chat.service'
import Authentication from "../../common/middleware/authentication";
import env from "../../config/config.service";
import { multer_cloud } from "../../common/middleware/multer.cloud";
import validation from "../../common/middleware/validation";
import authorization from "../../common/middleware/authorization";
import { RoleEnum } from "../../common/enum/user.enum";
import { createGroupChatSchema } from "./chat.validation";

const chatRouter = Router({ caseSensitive: true, strict: true, mergeParams: true })
const authenticationUser = new Authentication(env.TOKEN_KEY).auth

chatRouter.get('/', authenticationUser, authorization([RoleEnum.user]), ChatService.getChat)
chatRouter.get('/group/:groupId', authenticationUser, authorization([RoleEnum.user]), ChatService.getGroupChat)
chatRouter.post('/group',
    authenticationUser,
    authorization([RoleEnum.user]),
    multer_cloud().single('groupImage'),
    validation(createGroupChatSchema),
    ChatService.createGroupChat
)

export default chatRouter
