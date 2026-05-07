import type { NextFunction, Request, Response } from "express";
import successResponse from "../../common/utils/response.success";
import PostRepo from "../../DB/repo/post.repo";

class AuthService {
    private readonly _postModel = new PostRepo
    constructor() { }

    createPost = async (req: Request, res: Response, _next: NextFunction) => {

        successResponse({ res, message: 'post created successfully', data: post })
    }

}

export default new AuthService()