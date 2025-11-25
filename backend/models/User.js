import mongoose from "mongoose"; // FIX: Changed require to import

const UserSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
  },
  { timestamps: true }
);

//   indexes for efficient lookups
UserSchema.index({ username: 1, email: 1 });

export default mongoose.model("User", UserSchema);
