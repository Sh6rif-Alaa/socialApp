import { NextFunction, Request, Response } from "express";
import { RoleEnum } from "../enum/user.enum";
import { AppError } from "../utils/globalErrorHandler";
import { GraphQLError } from "graphql";

const authorization = (roles: RoleEnum[]) => {
    return (req: Request & { user?: { role: RoleEnum } }, _res: Response, next: NextFunction) => {
        if (!roles.includes(req.user?.role!))
            throw new AppError('unAuthorize', 403)
        next()
    }
}

export const authorization_gql = async (roles: RoleEnum[], role: RoleEnum) => {
    if (!roles.includes(role))
        throw new GraphQLError('unAuthorize', {
            extensions: {
                code: "FORBIDDEN",
                status: 403,
                message: "you don't have permission to access this resource"
            }
        })
}

export default authorization