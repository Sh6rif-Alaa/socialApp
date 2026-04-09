export interface SuccessResponseOptions {
    res: any;
    status?: number;
    message?: string;
    data?: any;
    token?: any;
}

declare global {
    namespace Express {
        interface Request {
            rateLimit?: {
                resetTime: number;
            };
        }
    }
}