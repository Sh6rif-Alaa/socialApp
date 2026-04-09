import express from 'express'
import type { Application, Request, Response } from 'express'
import helmet from 'helmet'
import cors from 'cors'
import { rateLimit } from 'express-rate-limit'
import successResponse from './common/utils/response.success'
import env from './config/config.service'
import globalErrorHandler, { AppError } from './common/utils/globalErrorHandler'
import authRouter from './modules/auth/auth.controller'
import { connectDB } from './DB/connectionDB'
const port = Number(env.PORT)

const app: Application = express()

const limiter = rateLimit({
    windowMs: 60 * 5 * 1000,
    limit: 10,
    legacyHeaders: false,
    handler: (req: Request) => {
        throw new AppError(`too many requests, try again after ${req.rateLimit!.resetTime - Date.now() / 1000} seconds`, 429)
    },
})

const bootstrap = () => {
    app.use(express.json(), helmet(), cors(), limiter)

    connectDB()

    app.get('/', (_req: Request, res: Response) => { successResponse({ res, message: 'Welcome on SocialMedia App' }) })

    app.use('/auth', authRouter)

    app.use((req: Request) => { throw new AppError(`Url ${req.originalUrl} with method ${req.method} not found`, 404) })

    app.use(globalErrorHandler)

    app.listen(port, () => console.log(`app running on port ${port}!`))
}

export default bootstrap