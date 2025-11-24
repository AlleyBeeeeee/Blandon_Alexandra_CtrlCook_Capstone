import mongoose from "mongoose";

// function to connect to mongodb
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("mongodb connected");
  } catch (err) {
    console.error("mongodb connection error:", err);
    process.exit(1);
  }
};

export default connectDB;
