import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    // Connect to your local MongoDB instance or MongoDB Atlas URI string safely
    const conn = await mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/cp-gym");
    console.log(`🚀 MongoDB Connected Successfully: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ Database Connection Error: ${error}`);
    process.exit(1); // Stop the server if database connection failure occurs
  }
};