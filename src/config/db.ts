import mongoose from "mongoose";

export const connectDb = async () => {
  try {
    await mongoose.connect(`${process.env.MONGO_URI}/Nuroon`);
  } catch (error) {
    console.error("MongoDb connection error :: ", error);
    process.exit(1);
  }
};
