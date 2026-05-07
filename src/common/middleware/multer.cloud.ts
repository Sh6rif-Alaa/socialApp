import multer from 'multer'
import { AppError } from '../utils/globalErrorHandler'
import type { Request } from 'express'
import { StorageEnum, FileType } from '../enum/multer_enum'
import { tmpdir } from 'node:os'
import { v4 as uuidv4 } from 'uuid'

export const multer_cloud = ({ custom_type = FileType.image, storageType = StorageEnum.memory }: { custom_type?: string[], storageType?: StorageEnum } = {}) => {
    const storage = storageType === StorageEnum.memory ? multer.memoryStorage() : multer.diskStorage({
        destination: tmpdir(),
        filename: (_req: Request, file: Express.Multer.File, cb: Function) => {
            const uniqueSuffix = uuidv4() + '-' + file.originalname
            cb(null, uniqueSuffix)
        },
    })

    function fileFilter(_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) {
        if (!custom_type!.includes(file.mimetype))
            cb(new AppError(`this type ${file.mimetype} not allowed`, 400))
        else
            cb(null, true)
    }

    return multer({ storage, fileFilter })
}