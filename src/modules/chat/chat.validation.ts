import * as z from 'zod'
import { generalRules } from '../../common/utils/generalRules'

// createGroupChat schema
export const createGroupChatSchema = {
    body: z.object({
        group: z.string().min(1, "group is required"),
        groupImage: generalRules.file.optional(),
        participants: z.array(generalRules.id).min(1, "participants is required")
    }).superRefine((args, ctx) => {
        if (args?.participants) {
            const uniqueParticipants = new Set(args.participants)
            if (args.participants.length !== uniqueParticipants.size) {
                ctx.addIssue({
                    code: "custom",
                    path: ['participants'],
                    message: "Dublicate participants"
                })
            }
        }
    }).strict()
}