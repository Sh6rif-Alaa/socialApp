import { Model } from "mongoose";
import userModel, { IUser } from "../models/user.model";
import BaseRepo from "./base.repo";
import { AppError } from "../../common/utils/globalErrorHandler";

class UserRepo extends BaseRepo<IUser> {
    constructor(protected readonly model: Model<IUser> = userModel) { super(model) }

    async checkUser(email: string): Promise<void> {
        const userExist = await this.model.findOne({
            filter: { email },
        })
        if (userExist) throw new AppError('user already exists', 409)
    }
}

export default UserRepo