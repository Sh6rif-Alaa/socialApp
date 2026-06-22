import mongoose, { Types } from "mongoose"
import { modelStatusEnem } from "../../common/enum/post.enum"

export interface IComment {
    content?: string
    attachments?: string[]
    likes?: Types.ObjectId[]
    tags?: Types.ObjectId[]
    folderId?: string
    createdBy: Types.ObjectId
    refId: Types.ObjectId
    modelStatus: modelStatusEnem
}

const commentSchema = new mongoose.Schema<IComment>({
    content: { type: String, required: function (this: IComment) { return !this.attachments?.length } },
    attachments: [String],
    likes: [{ type: Types.ObjectId, ref: 'User' }],
    tags: [{ type: Types.ObjectId, ref: 'User' }],
    folderId: String,
    createdBy: { type: Types.ObjectId, ref: 'User', required: true },
    refId: { type: Types.ObjectId, ref: 'Post', required: true },
    modelStatus: { type: String, enum: modelStatusEnem, required: true }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    strict: true,
    strictQuery: true
})

commentSchema.virtual('replies', {
    ref: 'Comment',
    localField: "_id",
    foreignField: "refId"
})

const commentModel = (mongoose.models.comment || mongoose.model<IComment>('Comment', commentSchema)) as mongoose.Model<IComment>

export default commentModel