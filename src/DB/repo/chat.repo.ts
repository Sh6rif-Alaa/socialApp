import { Model } from "mongoose";
import chatModel, { IChat } from "../models/chat.model";
import BaseRepo from "./base.repo";

class ChatRepo extends BaseRepo<IChat> {
    constructor(protected readonly model: Model<IChat> = chatModel) { super(model) }

}

export default new ChatRepo()