import mongoose, { Types } from "mongoose"

interface IMessage {
    createdBy: Types.ObjectId
    content: string
}

export interface IChat {
    // ovo
    createdBy: Types.ObjectId
    participants: Types.ObjectId[],
    messages: IMessage[]

    //ovm
    group: string
    groupImage: string
    roomId: string
}

const messageSchema = new mongoose.Schema<IMessage>(
    {
        createdBy: {
            type: Types.ObjectId,
            ref: 'User',
            required: true
        },
        content: {
            type: String,
            required: true
        }
    },
    { timestamps: true }
)

const chatSchema = new mongoose.Schema<IChat>(
    {
        createdBy: {
            type: Types.ObjectId,
            ref: 'User',
            required: true
        },
        participants: {
            type: [Types.ObjectId],
            ref: 'User',
            required: true
        },
        messages: [messageSchema],
        group: String,
        groupImage: String,
        roomId: String
    },
    {
        timestamps: true
    }
)

const chatModel = (mongoose.models.chat || mongoose.model<IChat>('Chat', chatSchema)) as mongoose.Model<IChat>
export default chatModel