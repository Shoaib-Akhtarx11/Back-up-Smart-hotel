import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config()
export const connectDB = async () => {
  try {
    if (!process.env.MONGO_URL) {
      throw new Error("MONGO_URL is not defined in .env file");
    }
    await mongoose.connect(process.env.MONGO_URL);
    console.log("Database has been connected!!");
  } catch (err) {
    console.error("Database connection error:", err.message);
    process.exit(1);
  }
};
