import mongoose from "mongoose";
import env from "../config/config.service";

export const connectDB = async (): Promise<void> => {
    try {
        await mongoose.connect(env.DB_URI)
        console.log("Database connected successfully")
    } catch (error: any) {
        console.log(error.message)
    }
}