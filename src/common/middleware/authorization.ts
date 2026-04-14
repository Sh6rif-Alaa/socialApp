import { NextFunction, Request, Response } from "express";
import { RoleEnum } from "../enum/user.enum";
import { AppError } from "../utils/globalErrorHandler";

const authorization = (roles: RoleEnum[]) => {
    return (req: Request & { user?: { role: RoleEnum } }, _res: Response, next: NextFunction) => {
        if (!roles.includes(req.user?.role!))
            throw new AppError('unAuthorize', 403)
        next()
    }
}


export default authorization