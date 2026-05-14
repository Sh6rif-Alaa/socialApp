import mongoose, { Types } from "mongoose"
import { allowCommentEnum, availabilityEnum } from "../../common/enum/post.enum"


export interface IPost {
    content?: string
    attachments?: string[]
    allowComment: allowCommentEnum
    availability: availabilityEnum
    likes?: Types.ObjectId[]
    tags?: Types.ObjectId[]
    folderId?: string
    createdBy: Types.ObjectId
}

const postSchema = new mongoose.Schema<IPost>({
    content: { type: String, required: function (this: IPost) { return !this.attachments?.length } },
    attachments: [String],
    allowComment: { type: String, enum: allowCommentEnum, default: allowCommentEnum.allow },
    availability: { type: String, enum: availabilityEnum, default: availabilityEnum.public },
    likes: [{ type: Types.ObjectId, ref: 'User' }],
    tags: [{ type: Types.ObjectId, ref: 'User' }],
    folderId: String,
    createdBy: { type: Types.ObjectId, ref: 'User', required: true }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    strict: true,
    strictQuery: true
})

const postModel = (mongoose.models.post || mongoose.model<IPost>('Post', postSchema)) as mongoose.Model<IPost>

export default postModel