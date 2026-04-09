import { Router } from "express";
import AuthService from './auth.service'
import validation from "../../common/middleware/validation";
import { signInSchema, signUpSchema } from "./auth.validation";

const authRouter = Router({ caseSensitive: true, strict: true })

authRouter.post('/signup', validation(signUpSchema), AuthService.signUp)
authRouter.post('/signin', validation(signInSchema), AuthService.signIn)

export default authRouter
