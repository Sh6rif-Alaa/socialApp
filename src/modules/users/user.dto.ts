import * as z from 'zod'
import { deleteUserSchema, updateProfileSchema } from "./user.validation"

export type updateProfileType = z.infer<typeof updateProfileSchema.body>

export type deleteUserType = z.infer<typeof deleteUserSchema.body>