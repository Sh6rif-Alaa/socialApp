import { Request, Response } from "express"
import ChatRepo from "../../DB/repo/chat.repo"
import UserRepo from "../../DB/repo/user.repo"
import { AppError } from "../../common/utils/globalErrorHandler"
import successResponse from "../../common/utils/response.success"
import { Server, Socket } from "socket.io"
import redisService from "../../common/services/redis.service"
import S3Service from "../../common/services/s3.service"
import { Types } from "mongoose"
import { v4 as uuidv4 } from 'uuid'
import userModel from "../../DB/models/user.model"
import chatModel from "../../DB/models/chat.model"

class ChatService {
    private readonly _userModel = UserRepo
    private readonly _chatModel = ChatRepo
    private readonly _S3Service = S3Service
    constructor() { }

    getChat = async (req: Request, res: Response) => {
        const { userId } = req.params
        let { page, limit } = req.query as unknown as { page: number, limit: number }
        if (page < 0 || !page) page = 1
        if (limit < 0 || !limit) limit = 5
        page = page * 1 || 1
        limit = limit * 1 || 5
        const chat = await this._chatModel.findOne({
            filter: {
                participants: {
                    $all: [req.user!._id, userId],
                },
                group: { $exists: false }
            },
            options: {
                populate: [
                    { path: "participants" }
                ],
            },
            projection: {
                messages: {
                    $slice: [-(page * limit), limit]
                }
            }
        })

        if (!chat) throw new AppError("chat not found", 404)

        successResponse({ res, data: { chat } })
    }

    getGroupChat = async (req: Request, res: Response) => {
        const { groupId } = req.params
        let { page, limit } = req.query as unknown as { page: number, limit: number }
        if (page < 0 || !page) page = 1
        if (limit < 0 || !limit) limit = 5
        page = page * 1 || 1
        limit = limit * 1 || 5
        const chat = await this._chatModel.findOne({
            filter: {
                _id: groupId,
                participants: { $in: [req.user!._id] },
                group: { $exists: true }

            }, options: {
                populate: [
                    { path: "messages.createdBy" }
                ],
            },
        })

        console.log(chat)

        if (!chat) throw new AppError("chat not found", 404)

        successResponse({ res, data: { chat } })
    }

    createGroupChat = async (req: Request, res: Response) => {
        let { group, groupImage, participants } = req.body
        const createdBy = req.user!._id

        const dbParticipants = participants.map((p: string) => Types.ObjectId.createFromHexString(p))

        const users = await userModel.find({
            _id: { $in: dbParticipants },
            friends: { $in: [createdBy] }
        })

        if (users.length != participants.length) throw new AppError("some users not found", 404)

        const roomId = group.replaceAll(/\s+/g, "-") + "_" + uuidv4()

        if (req?.file) {
            groupImage = await this._S3Service.uploadFile({
                path: `chat/${roomId}`,
                file: req.file as Express.Multer.File
            })
        }

        dbParticipants.push(createdBy)

        const chat = await this._chatModel.create({
            group, groupImage,
            participants: dbParticipants,
            createdBy, roomId,
            messages: []
        })

        if (!chat) {
            if (groupImage)
                await this._S3Service.deleteFile(groupImage)

            throw new AppError("chat not created", 400)
        }

        successResponse({ res, data: { chat } })
    }

    // socket.io

    sendMessage = async (data: any, socket: Socket, io: Server) => {
        console.log(data)
        const { sendTo, content } = data
        const createdBy = socket.data.user._id

        const user = await this._userModel.findById(sendTo)
        if (!user) throw new AppError("user not found", 404)

        const chat = await this._chatModel.findOneAndUpdate({
            filter: {
                participants: {
                    $all: [createdBy, sendTo],
                },
                group: { $exists: false }
            },
            update: {
                $push: {
                    messages: {
                        content,
                        createdBy
                    }
                }
            }
        })

        if (!chat) {
            await this._chatModel.create({
                createdBy,
                messages: [{
                    content,
                    createdBy
                }],
                participants: [createdBy, sendTo]
            })
        }

        io.to(await redisService.getAllUserSockets(createdBy)).emit('successMessage', { content })
        io.to(await redisService.getAllUserSockets(sendTo)).emit('newMessage', { content, from: socket.data.user })
    }

    sendGroupMessage = async (data: any, socket: Socket, io: Server) => {
        const { groupId, content } = data
        const createdBy = socket.data.user._id

        const chat = await this._chatModel.findOneAndUpdate({
            filter: {
                _id: groupId,
                participants: {
                    $all: [createdBy],
                },
                group: { $exists: true }
            },
            update: {
                $push: {
                    messages: {
                        content,
                        createdBy
                    }
                }
            }
        })
        if (!chat) throw new AppError("group chat not found", 404)

        io.to(await redisService.getAllUserSockets(createdBy)).emit('successMessage', { content })
        io.to(chat.roomId).emit('newMessage', { content, from: socket.data.user, groupId })
    }

    join_room = async (data: any, socket: Socket, io: Server) => {
        const { roomId } = data
        const chat = await this._chatModel.findOne({
            filter: {
                roomId,
                participants: { $in: [socket.data.user._id] },
                group: { $exists: true }
            }
        })

        if (!chat) throw new AppError("chat not found", 404)

        socket.join(roomId)
        io.to(socket.id).emit('successMessage', { content: "You have joined the room" })
    }
}

export default new ChatService()