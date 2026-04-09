import * as z from 'zod'
import { GenderEnum } from '../../common/enum/user.enum'

// body signUp schema
export const signUpSchemaBody = z.object({
    userName: z.string().min(3, 'userName must be at least 3 characters long').max(25, 'userName must be at most 25 characters long'),
    password: z.string().min(6, 'password must be at least 6 characters long'),
    cPassword: z.string().min(6, 'confirmPassword must be at least 6 characters long'),
    email: z.email(),
    age: z.number().min(16, 'age must be at least 16 years old').max(80, 'age must be at most 80 years old'),
    gender: z.enum(Object.values(GenderEnum)).default(GenderEnum.male),
    phone: z.string().min(10, 'phone must be at least 10 digits long').max(15, 'phone must be at most 15 digits long').optional(),
    address: z.string().min(10, 'address must be at least 10 characters long').max(100, 'address must be at most 100 characters long').optional(),
})

// refined signUp schema -> split for password and cPassword to get error with the rest of the fields
const signInSchemaRefined = signUpSchemaBody.refine((data) => data.password === data.cPassword, {
    message: "Passwords do not match",
    path: ["cPassword"],
    when(payload) {
        return signUpSchemaBody
            .pick({ password: true, cPassword: true })
            .safeParse(payload.value).success
    },
})

// signUp schema
export const signUpSchema = {
    body: signInSchemaRefined
}

// signIn schema
export const signInSchema = {
    body: z.object({
        email: z.email(),
        password: z.string().min(6, 'password must be at least 6 characters long'),
    }).strict()
}
