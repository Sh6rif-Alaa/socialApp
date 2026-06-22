import type { NextFunction, Request, Response } from "express";
import successResponse from "../../common/utils/response.success";
import CommentRepo from "../../DB/repo/comment.repo";
import { createCommentType } from "./comment.dto";
import { Types } from "mongoose";
import UserRepo from "../../DB/repo/user.repo";
import { AppError } from "../../common/utils/globalErrorHandler";
import RedisService from "../../common/services/redis.service";
import { randomUUID } from "node:crypto";
import S3Service from "../../common/services/s3.service";
import NotificationService from "../../common/services/notification.service";
import PostRepo from "../../DB/repo/post.repo";
import { allowCommentEnum, availabilityEnum, modelStatusEnem } from "../../common/enum/post.enum";
import { HydratedDocument } from "mongoose";
import { IComment } from "../../DB/models/comment.model";
import { IPost } from "../../DB/models/post.model";


class CommentService {
    private readonly _postModel = PostRepo
    private readonly _commentModel = CommentRepo
    private readonly _userModel = UserRepo
    private readonly _redisService = RedisService
    private readonly _notificationService = NotificationService
    private readonly _s3Service = S3Service
    constructor() { }

    createComment = async (req: Request, res: Response, _next: NextFunction) => {
        const { content, tags, modelStatus }: createCommentType = req.body
        const { postId, commentId } = req.params
        const userId = req.user?._id!
        const friends = req.user?.friends || []

        const visibilityFilter = [
            { availability: availabilityEnum.public },
            { availability: availabilityEnum.onlyMe, createdBy: userId },
            { availability: availabilityEnum.friends, createdBy: { $in: [...friends, userId] } },
            { tags: { $in: [userId] } }
        ]

        let mentions: Types.ObjectId[] = []
        let fcmTokens: string[] = []

        let doc: HydratedDocument<IComment | IPost> | null = null

        if (modelStatus == modelStatusEnem.comment && commentId) {
            const comment = await this._commentModel.findOne({
                filter: {
                    _id: commentId,
                    refId: postId!
                },
                options: {
                    populate: {
                        path: 'refId',
                        match: {
                            _id: postId,
                            $or: visibilityFilter,
                            allowComment: allowCommentEnum.allow
                        }
                    }
                }
            })
            if (!comment?.refId) throw new AppError('comment not found', 404)
            doc = comment
        } else if (modelStatus == modelStatusEnem.post && postId) {
            const post = await this._postModel.findOne({
                filter: {
                    _id: postId,
                    $or: visibilityFilter as any,
                    allowComment: allowCommentEnum.allow
                },
            })

            if (!post) throw new AppError('post not found', 404)
            doc = post
        }

        if(!doc) throw new AppError('comment or post not found', 404)

        if (tags?.length) {
            const mentionsTags = await this._userModel.find({ _id: { $in: tags } })
            if (tags.length != mentionsTags.length)
                throw new AppError("invalid tags", 400)
            for (const tag of mentionsTags) {
                mentions.push(tag._id)
                fcmTokens.push(...(await this._redisService.getFCMs(tag._id) || []))
            }
        }

        let urls: string[] = []
        let folderId = randomUUID()

        if (req.files) {
            urls = await this._s3Service.uploadFiles({
                files: req.files as Express.Multer.File[],
                path: `users/${req.user?._id}/Comments/${folderId}`,
            })
        }

        const Comment = await this._commentModel.create({
            createdBy: req.user?._id!,
            content: content!,
            attachments: urls,
            tags: mentions,
            folderId
        })

        if (!Comment) {
            await this._s3Service.deleteFiles(urls)
            throw new AppError("failed to create Comment", 500)
        }

        if (fcmTokens.length) {
            await this._notificationService.sendNotifications({
                tokens: fcmTokens,
                data: {
                    title: `${req.user?.firstName} ${req.user?.lastName} mentioned you in a Comment`,
                    body: content || 'new Comment was created',
                }
            })
        }

        successResponse({ res, message: 'Comment created successfully', data: doc })
    }

}

export default new CommentService()
