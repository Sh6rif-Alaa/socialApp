import { Router } from "express";
import PostService from './post.service'
import validation from "../../common/middleware/validation";
import { createPostSchema, getPostsSchema, likePostSchema, updatePostSchema } from "./post.validation";
import { multer_cloud } from "../../common/middleware/multer.cloud";
import { FileType, StorageEnum } from "../../common/enum/multer_enum";
import Authentication from "../../common/middleware/authentication";
import env from "../../config/config.service";
import authorization from "../../common/middleware/authorization";
import { RoleEnum } from "../../common/enum/user.enum";

const postRouter = Router({ caseSensitive: true, strict: true })

const authenticationUser = new Authentication(env.TOKEN_KEY)

postRouter.post('/',
    authenticationUser.auth,
    authorization([RoleEnum.user]),
    multer_cloud({ custom_type: FileType.image!, storageType: StorageEnum.memory }).array('attachments'),
    validation(createPostSchema), PostService.createPost)

postRouter.get('/', authenticationUser.auth, validation(getPostsSchema), PostService.getPosts)
postRouter.patch('/:postId/like', authenticationUser.auth, authorization([RoleEnum.user]), validation(likePostSchema), PostService.likePost)
postRouter.patch('/:postId', authenticationUser.auth, authorization([RoleEnum.user]), validation(updatePostSchema), PostService.updatePost)

export default postRouter
