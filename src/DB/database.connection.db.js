import mongoose from "mongoose";
import { DB_URI } from "../../config/config.service.js";

export const connectDB = async () => {
    try {
        await mongoose.connect(DB_URI);

        console.log("DB connected successfully 👌");
    } catch (error) {
        console.error("Failed to connect to database:", error);

        process.exit(1);
    }
};
