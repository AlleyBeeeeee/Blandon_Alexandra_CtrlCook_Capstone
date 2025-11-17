// backend/config/db.js
import mongoose from "mongoose";

const connectdb = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`mongodb connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`error connecting to mongodb: ${error.message}`);
    process.exit(1); // terminates the process if connection fails
  }
};

export default connectdb;
