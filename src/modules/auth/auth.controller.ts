import { Router } from "express";
import AuthService from './auth.service'
import validation from "../../common/middleware/validation";
import { forgetPasswordSchema, resetPasswordSchema, signInSchema, signUpSchema, verifyEmailSchema } from "./auth.validation";

const authRouter = Router({ caseSensitive: true, strict: true })

authRouter.post('/signup', validation(signUpSchema), AuthService.signUp)
authRouter.post('/signin', validation(signInSchema), AuthService.signIn)
authRouter.post('/reSendOtp', validation(forgetPasswordSchema), AuthService.reSendOtp)
authRouter.patch('/verifyEmail', validation(verifyEmailSchema), AuthService.verifyEmail)
authRouter.patch('/forget-password', validation(forgetPasswordSchema), AuthService.forgetPassword)
authRouter.patch('/reset-password', validation(resetPasswordSchema), AuthService.resetPassword)

export default authRouter
