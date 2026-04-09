import { ZodType } from "zod";
import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/globalErrorHandler";

type ReqType = keyof Request;
type SchemaType = Partial<Record<ReqType, ZodType>>;

const validation = (Schema: SchemaType) => {
    return (req: Request, _res: Response, next: NextFunction) => {
        const errorResult = []
        for (const key of Object.keys(Schema) as ReqType[]) {
            if (!Schema[key]) continue
            const { success, error } = Schema[key].safeParse(req[key]);

            if (!success) {
                errorResult.push(...error.issues.map((err) => ({
                    key: key as string,
                    message: err.message,
                    path: err.path[0] as string,
                    type: err.code,
                })));
            }
        }

        if (errorResult.length > 0)
            throw new AppError(errorResult);


        next();
    }
}


export default validation