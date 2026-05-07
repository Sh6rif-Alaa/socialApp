import { Model } from "mongoose";
import PostModel from "../models/post.model";
import BaseRepo from "./base.repo";
import { AppError } from "../../common/utils/globalErrorHandler";
import { IPost } from "../models/post.model";

class PostRepo extends BaseRepo<IPost> {
    constructor(protected readonly model: Model<IPost> = PostModel) { super(model) }

    async checkPost(email: string): Promise<void> {
        const postExist = await this.model.findOne({
            filter: { email },
        })
        if (postExist) throw new AppError('Post already exists', 409)
    }
}

export default PostRepo