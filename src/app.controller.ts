import express from 'express'
import type { Application, NextFunction, Request, Response } from 'express'
import helmet from 'helmet'
import cors from 'cors'
import { rateLimit } from 'express-rate-limit'
import successResponse from './common/utils/response.success'
import env from './config/config.service'
import globalErrorHandler, { AppError } from './common/utils/globalErrorHandler'
import authRouter from './modules/auth/auth.controller'
import userRouter from './modules/users/user.controller'
import { connectDB } from './DB/connectionDB'
import redisService from './common/services/redis.service'
import userModel from './DB/models/user.model'
import { multer_cloud } from './common/middleware/multer.cloud'
import s3Service from './common/services/s3.service'
import { FileType, StorageEnum } from './common/enum/multer_enum'
import { pipeline } from 'node:stream/promises'

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

const bootstrap = async () => {
    app.use(express.json(), helmet(), cors(), limiter)

    await connectDB()
    await redisService.connect()

    app.get('/', (_req: Request, res: Response) => { successResponse({ res, message: 'Welcome on SocialMedia App' }) })

    app.use('/auth', authRouter)
    app.use('/user', userRouter)

    app.get("/upload/pre-signed/*path", async (req: Request, res: Response, _next: NextFunction) => {
        const { path } = req.params as { path: string[] };
        const { download } = req.query as { download: string };
        const Key = path.join("/") as string;

        const url = await s3Service.getPreSignedUrl({
            Key,
            download: download ? download : undefined
        });

        successResponse({ res, data: url });
    });

    app.get("/upload/*path", async (req: Request, res: Response, _next: NextFunction) => {
        const { path } = req.params as { path: string[] };
        const { download } = req.query as { download: string };
        const Key = path.join("/") as string;

        const result = await s3Service.getFile(Key);
        const stream = result.Body as NodeJS.ReadableStream;

        res.setHeader("Content-Type", result.ContentType!);
        res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");

        if (download && download === "true") {
            res.setHeader("Content-Disposition", `attachment; filename="${path.pop()}"`);
        }

        await pipeline(stream, res);
    });

    app.post('/upload', multer_cloud({ storageType: StorageEnum.disk, custom_type: FileType.image! }).single('image'), async (_req: Request, res: Response) => {
        const file = await s3Service.uploadFile({
            file: _req.file!,
            path: 'posts'
        })
        successResponse({ res, message: 'uploaded successfully', data: { file } })
    })


    app.use((req: Request) => { throw new AppError(`Url ${req.originalUrl} with method ${req.method} not found`, 404) })

    app.use(globalErrorHandler)

    app.listen(port, () => console.log(`app running on port ${port}!`))
}

export default bootstrap