import * as z from 'zod'
import { allowCommentEnum, availabilityEnum } from '../../common/enum/post.enum'

// createPost schema
export const createPostSchema = {
    body: z.object({
        content: z.string().optional(),
        attachments: z.array(z.any()).optional(),
        allowComment: z.string().default(allowCommentEnum.allow),
        availability: z.string().default(availabilityEnum.public),
        tags: z.array(z.any()).optional()
    }).superRefine((args, ctx) => {
        if (!args.content && !args.attachments) {
            ctx.addIssue({
                code: "custom",
                path: ['content'],
                message: "content is required"
            })
            if (args?.tags?.length) {
                const uniqueTags = new Set(args.tags)
                if (args.tags.length !== uniqueTags.size) {
                    ctx.addIssue({
                        code: "custom",
                        path: ['tags'],
                        message: "Dublicate tag"
                    })
                }
            }
        }
    }).strict()
}