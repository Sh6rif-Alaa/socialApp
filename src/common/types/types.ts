import { IUser } from "../../DB/models/user.model";
import { JwtPayload } from "jsonwebtoken";
import { HydratedDocument } from "mongoose";

export interface SuccessResponseOptions {
    res: any;
    status?: number;
    message?: string;
    data?: any;
    token?: any;
}

declare module 'express-serve-static-core' {
    interface Request {
        rateLimit?: {
            resetTime: number;
        };
        user?: HydratedDocument<IUser>
        decode?: JwtPayload
    }
}