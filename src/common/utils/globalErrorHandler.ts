import type { NextFunction, Request, Response } from "express";

export class AppError extends Error {
    constructor(public message: any, public statusCode: number = 500) {
        super()
    }
}

const globalErrorHandler = (err: AppError, _req: Request, res: Response, _next: NextFunction) => {
    console.log(err.stack)
    res.status(err.statusCode || 500).json({ message: err.message, status: err.statusCode || 500, stack: err.stack })
}

export default globalErrorHandler