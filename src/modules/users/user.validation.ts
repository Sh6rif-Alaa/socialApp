import { GenderEnum } from "../../common/enum/user.enum";
import * as z from 'zod'

// updateProfile schema
export const updateProfileSchema = {
    body: z.strictObject({
        email: z.email().optional(),
        userName: z.string().min(3, 'userName must be at least 3 characters long').max(25, 'userName must be at most 25 characters long').optional(),
        age: z.number().min(16, 'age must be at least 16 years old').max(80, 'age must be at most 80 years old').optional(),
        gender: z.enum(GenderEnum).optional(),
        phone: z.string().min(10, 'phone must be at least 10 digits long').max(15, 'phone must be at most 15 digits long').optional(),
        address: z.string().min(10, 'address must be at least 10 characters long').max(100, 'address must be at most 100 characters long').optional(),
    })
}

export const deleteUserSchema = {
    body: z.strictObject({
        id: z.string()
    })
}