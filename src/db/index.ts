import { env } from "@/common/utils/envConfig";
import mongoose from "mongoose";

export const connect = async () => {
  try {
    await mongoose.connect(env.MONGO_URI as string);
    console.log("Database connected successfully");
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};
