import type { NextFunction, Request, Response } from "express";
import successResponse from "../../common/utils/response.success";
import PostRepo from "../../DB/repo/post.repo";
import { createPostType, getPostsQueryType, likePostParamsType, updatePostBodyType, updatePostParamsType } from "./post.dto";
import { Types } from "mongoose";
import UserRepo from "../../DB/repo/user.repo";
import { AppError } from "../../common/utils/globalErrorHandler";
import RedisService from "../../common/services/redis.service";
import { randomUUID } from "node:crypto";
import S3Service from "../../common/services/s3.service";
import NotificationService from "../../common/services/notification.service";
import { availabilityEnum } from "../../common/enum/post.enum";


class PostService {
    private readonly _postModel = new PostRepo
    private readonly _userModel = new UserRepo()
    private readonly _redisService = RedisService
    private readonly _notificationService = NotificationService
    private readonly _s3Service = S3Service
    constructor() { }

    createPost = async (req: Request, res: Response, _next: NextFunction) => {
        const { content, allowComment, availability, tags }: createPostType = req.body

        let mentions: Types.ObjectId[] = []
        let fcmTokens: string[] = []

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
                path: `users/${req.user?._id}/posts/${folderId}`,
            })
        }

        const post = await this._postModel.create({
            createdBy: req.user?._id!,
            content: content!,
            attachments: urls,
            allowComment,
            availability,
            tags: mentions,
            folderId
        })

        if (!post) {
            await this._s3Service.deleteFiles(urls)
            throw new AppError("failed to create post", 500)
        }

        if (fcmTokens.length) {
            await this._notificationService.sendNotifications({
                tokens: fcmTokens,
                data: {
                    title: `${req.user?.firstName} ${req.user?.lastName} mentioned you in a post`,
                    body: content || 'new post was created',
                }
            })
        }

        successResponse({ res, message: 'post created successfully', data: post })
    }

    getPosts = async (req: Request, res: Response, _next: NextFunction) => {
        const { page, limit }: getPostsQueryType = req.query as any
        const userId = req.user?._id!
        const friends = req.user?.friends || []

        const visibilityFilter = {
            $or: [
                { availability: availabilityEnum.public },
                { availability: availabilityEnum.onlyMe, createdBy: userId },
                { availability: availabilityEnum.friends, createdBy: { $in: [...friends, userId] } },
                { tags: { $in: [userId] } }
            ]
        }

        const posts = await this._postModel.findPaginated(
            {
                filter: visibilityFilter as any,
                options: { sort: { createdAt: -1 } },
                page,
                limit
            }
        )

        successResponse({
            res,
            message: 'posts fetched successfully',
            data: {
                posts: posts.docs,
                pagination: {
                    total: posts.total,
                    page: posts.page,
                    limit: posts.limit,
                    totalPages: posts.totalPages
                }
            }
        })
    }

    likePost = async (req: Request, res: Response, _next: NextFunction) => {
        const { postId }: likePostParamsType = req.params as any
        const userId = req.user?._id!

        const post = await this._postModel.findById(postId)
        if (!post) throw new AppError("post not found", 404)

        const alreadyLiked = post.likes?.some(id => id.equals(userId))

        const updatedPost = await this._postModel.findOneAndUpdate({
            filter: { _id: postId },
            update: alreadyLiked
                ? { $pull: { likes: userId } }
                : { $addToSet: { likes: userId } },
            options: { new: true }
        })

        successResponse({
            res,
            message: alreadyLiked ? 'post unliked successfully' : 'post liked successfully',
            data: { likesCount: updatedPost?.likes?.length ?? 0 }
        })
    }

    updatePost = async (req: Request, res: Response, _next: NextFunction) => {
        const { postId }: updatePostParamsType = req.params as any
        const { content, allowComment, availability, tags }: updatePostBodyType = req.body
        const userId = req.user?._id!

        const post = await this._postModel.findById(postId)
        if (!post) throw new AppError("post not found", 404)
        if (!post.createdBy.equals(userId)) throw new AppError("unauthorized", 403)

        let mentions: Types.ObjectId[] | undefined
        if (tags !== undefined) {
            if (tags.length) {
                const mentionsTags = await this._userModel.find({ _id: { $in: tags } })
                if (tags.length !== mentionsTags.length)
                    throw new AppError("invalid tags", 400)
                mentions = mentionsTags.map(u => u._id)
            } else {
                mentions = []
            }
        }

        const updatePayload: Record<string, any> = {}
        if (content !== undefined) updatePayload.content = content
        if (allowComment !== undefined) updatePayload.allowComment = allowComment
        if (availability !== undefined) updatePayload.availability = availability
        if (mentions !== undefined) updatePayload.tags = mentions

        const updatedPost = await this._postModel.findOneAndUpdate({
            filter: { _id: postId },
            update: { $set: updatePayload },
            options: { new: true }
        })

        successResponse({ res, message: 'post updated successfully', data: updatedPost })
    }

}

export default new PostService()
