import * as z from 'zod'
import { allowCommentEnum, availabilityEnum } from '../../common/enum/post.enum'
import { generalRules } from '../../common/utils/generalRules'

// createPost schema
export const createPostSchema = {
    body: z.object({
        content: z.string().optional(),
        attachments: z.array(generalRules.file).optional(),
        allowComment: z.enum(allowCommentEnum).default(allowCommentEnum.allow),
        availability: z.enum(availabilityEnum).default(availabilityEnum.public),
        tags: z.array(generalRules.id).optional()
    }).superRefine((args, ctx) => {
        if (!args.content && !args.attachments) {
            ctx.addIssue({
                code: "custom",
                path: ['content'],
                message: "content is required"
            })
        }
        if (args?.tags) {
            const uniqueTags = new Set(args.tags)
            if (args.tags.length !== uniqueTags.size) {
                ctx.addIssue({
                    code: "custom",
                    path: ['tags'],
                    message: "Dublicate tag"
                })
            }
        }
    }).strict()
}

// getPosts schema
export const getPostsSchema = {
    query: z.object({
        page: z.coerce.number().int().min(1).default(1),
        limit: z.coerce.number().int().min(1).max(50).default(10),
    })
}

// likePost schema
export const likePostSchema = {
    params: z.object({
        postId: generalRules.id
    })
}

// updatePost schema
export const updatePostSchema = {
    params: z.object({
        postId: generalRules.id
    }),
    body: z.object({
        content: z.string().optional(),
        allowComment: z.enum(allowCommentEnum).optional(),
        availability: z.enum(availabilityEnum).optional(),
        tags: z.array(generalRules.id).optional()
    }).superRefine((args, ctx) => {
        if (args?.tags) {
            const uniqueTags = new Set(args.tags)
            if (args.tags.length !== uniqueTags.size) {
                ctx.addIssue({
                    code: "custom",
                    path: ['tags'],
                    message: "Dublicate tag"
                })
            }
        }
    }).strict()
}