import { Router } from "express";
import PostService from './post.service'
import validation from "../../common/middleware/validation";
import { createPostSchema } from "./post.validation";
import { multer_cloud } from "../../common/middleware/multer.cloud";
import { FileType, StorageEnum } from "../../common/enum/multer_enum";

const postRouter = Router({ caseSensitive: true, strict: true })

postRouter.post('/crea', multer_cloud(
    {
        custom_type: FileType.image,
        storageType: StorageEnum.memory,
    }).array['attachments'],
    validation(createPostSchema), PostService.createPost)

export default postRouter
