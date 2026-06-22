import * as z from 'zod'
import { generalRules } from '../../common/utils/generalRules'
import { modelStatusEnem } from '../../common/enum/post.enum'

// createComment schema
export const createCommentSchema = {
    body: z.object({
        content: z.string().optional(),
        attachments: z.array(generalRules.file).optional(),
        tags: z.array(generalRules.id).optional(),
        modelStatus: z.enum(Object.values(modelStatusEnem) as [string, ...string[]])
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
    }).strict(),

    params: z.object({
        postId: generalRules.id,
        commentId: generalRules.id.optional()
    })
}
