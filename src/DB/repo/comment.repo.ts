import { Model } from "mongoose";
import CommentModel, { IComment } from "../models/comment.model";
import BaseRepo from "./base.repo";

class CommentRepo extends BaseRepo<IComment> {
    constructor(protected readonly model: Model<IComment> = CommentModel) { super(model) }

}

export default new CommentRepo()