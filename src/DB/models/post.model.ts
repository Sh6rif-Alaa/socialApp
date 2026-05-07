import mongoose, { Types } from "mongoose"
import { allowCommentEnum, availabilityEnum } from "../../common/enum/post.enum"


export interface IPost {
    content: string
    attachments: string[]
    allowComment: allowCommentEnum
    availability: availabilityEnum
    likes: Types.ObjectId[]
    tags: Types.ObjectId[]
    createdBy: Types.ObjectId
}

const postSchema = new mongoose.Schema<IPost>({
    content: { types: String, required: function (this) { return !this.attachments.length } },
    attachments: [String],
    allowComment: { types: String, enum: allowCommentEnum, default: allowCommentEnum.allow },
    availability: { types: String, enum: availabilityEnum, default: availabilityEnum.public },
    likes: [{ types: Types.ObjectId, ref: 'post' }],
    tags: [{ types: Types.ObjectId, ref: 'User' }],
    createdBy: { types: Types.ObjectId, ref: 'User', required: true }
})

const postModel = (mongoose.models.post || mongoose.model<IPost>('Post', postSchema)) as mongoose.Model<IPost>

export default postModel