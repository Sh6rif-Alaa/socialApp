import { Router } from "express";
import commentService from "./comment.service";
import validation from "../../common/middleware/validation";
import { createCommentSchema } from "./comment.validation";
import { multer_cloud } from "../../common/middleware/multer.cloud";
import { FileType, StorageEnum } from "../../common/enum/multer_enum";
import Authentication from "../../common/middleware/authentication";
import env from "../../config/config.service";
import authorization from "../../common/middleware/authorization";
import { RoleEnum } from "../../common/enum/user.enum";

const CommentRouter = Router({ caseSensitive: true, strict: true, mergeParams: true })

const authenticationUser = new Authentication(env.TOKEN_KEY)

CommentRouter.post('/',
    authenticationUser.auth,
    authorization([RoleEnum.user]),
    multer_cloud({ custom_type: FileType.image!, storageType: StorageEnum.memory }).array('attachments'),
    validation(createCommentSchema), commentService.createComment)

export default CommentRouter
