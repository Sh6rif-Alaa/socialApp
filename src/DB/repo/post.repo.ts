import { Model } from "mongoose";
import postModel, { IPost } from "../models/post.model";
import BaseRepo from "./base.repo";

class PostRepo extends BaseRepo<IPost> {
    constructor(protected readonly model: Model<IPost> = postModel) { super(model) }

}

export default new PostRepo()