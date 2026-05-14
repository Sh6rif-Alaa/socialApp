import * as z from 'zod'
import { Types } from 'mongoose'

export const generalRules = {
    id: z.string().refine((val) => Types.ObjectId.isValid(val), "Invalid Id") as z.ZodString,

    file: z.object({
        fieldname: z.string(),
        originalname: z.string(),
        encoding: z.string(),
        mimetype: z.string(),
        buffer: z.any().optional(),
        path: z.string().optional(),
        size: z.number()
    })
}