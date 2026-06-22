import express from 'express'
import type { Application, Request, Response } from 'express'
import helmet from 'helmet'
import cors from 'cors'
import { rateLimit } from 'express-rate-limit'
import successResponse from './common/utils/response.success'
import env from './config/config.service'
import globalErrorHandler, { AppError } from './common/utils/globalErrorHandler'
import authRouter from './modules/auth/auth.controller'
import userRouter from './modules/users/user.controller'
import postRouter from './modules/posts/post.controller'
import socketGetway from './modules/realTime/socket.getway'
import { connectDB } from './DB/connectionDB'
import redisService from './common/services/redis.service'
import { createHandler } from 'graphql-http/lib/use/express'
import gql_schema from './modules/graphql/graphql.schema'
import chatRouter from './modules/chat/chat.controller'

const port = Number(env.PORT)

const app: Application = express()

const limiter = rateLimit({
    windowMs: 60 * 5 * 1000,
    limit: 50,
    legacyHeaders: false,
    handler: (req: Request) => {
        throw new AppError(`too many requests, try again after ${req.rateLimit!.resetTime - Date.now() / 1000} seconds`, 429)
    },
})

const bootstrap = async () => {
    app.use(express.json(), helmet(), cors(), limiter)

    await connectDB()
    await redisService.connect()

    app.get('/', (_req: Request, res: Response) => { successResponse({ res, message: 'Welcome on SocialMedia App' }) })

    app.use('/auth', authRouter)
    app.use('/user', userRouter)
    app.use('/post', postRouter)
    app.use('/chat', chatRouter)

    app.use('/graphql', createHandler({ schema: gql_schema, context: (req) => ({ req }) }))

    app.use((req: Request) => { throw new AppError(`Url ${req.originalUrl} with method ${req.method} not found`, 404) })

    app.use(globalErrorHandler)

    const httpServer = app.listen(port, () => console.log(`app running on port ${port}!`))

    await socketGetway.initIO(httpServer)
}

export default bootstrap