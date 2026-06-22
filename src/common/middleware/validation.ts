import { ZodType } from "zod";
import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/globalErrorHandler";
import { GraphQLError } from "graphql";

type ReqType = keyof Request;
type SchemaType = Partial<Record<ReqType, ZodType>>;

const validation = (Schema: SchemaType) => {
    return (req: Request, _res: Response, next: NextFunction) => {
        const errorResult = []
        for (const key of Object.keys(Schema) as ReqType[]) {
            if (!Schema[key]) continue
            if (req.file) { req.body.attachment = req.file }
            if (req.files) { req.body.attachments = req.files }
            const { success, error, data } = Schema[key].safeParse(req[key]);

            if (!success) {
                errorResult.push(...error.issues.map((err) => ({
                    key: key as string,
                    message: err.message,
                    path: err.path[0] as string,
                    type: err.code,
                })));
            }

            if (data) (req[key] as any) = data
        }

        if (errorResult.length > 0)
            throw new AppError(errorResult);

        next();
    }
}

export const validation_gql = async (Schema: ZodType, data: any) => {
    const errorResult = []

    const { success, error } = Schema.safeParse(data);

    if (!success) {
        errorResult.push(...error.issues.map((err) => ({
            message: err.message,
            path: err.path[0] as string,
            type: err.code,
        })));
    }

    if (errorResult.length > 0)
        throw new GraphQLError('Validation Faild', {
            extensions: {
                code: "BAD_REQUEST",
                status: 400,
                message: "one or many fields have validation errors",
                errors: errorResult
            }
        })
}

export default validation