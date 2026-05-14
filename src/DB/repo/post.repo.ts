import { Model } from "mongoose";
import PostModel from "../models/post.model";
import BaseRepo from "./base.repo";
import { IPost } from "../models/post.model";

class PostRepo extends BaseRepo<IPost> {
    constructor(protected readonly model: Model<IPost> = PostModel) { super(model) }
    
}

export default PostRepo