import mongoose from "mongoose";
import bcrypt from "bcryptjs"; //library for hashing passwords, making them secure before they are stored in the databas

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
  },
  { timestamps: true }
);

//security - mongoose hook runs before saving document
userSchema.pre("save", async function (next) {
  //intercepts the save operation/ allows the use of await for the hashing process
  if (!this.isModified("password")) return next(); // if the user is only updating their email or username (and not the password), this skips the expensive hashing process and proceeds directly (return next();)
  const salt = await bcrypt.genSalt(10); //random data added to the password before hashing/ prevents identical passwords from having identical hashes, guarding against "rainbow table" attacks. 10 is the cost factor, determining the computation complexity
  this.password = await bcrypt.hash(this.password, salt); // takes (this.password), combines it with the generated salt, hashes it using bcrypt, overwrites the plaintext value with the secure, one-way hash.
  next();
});

const user = mongoose.model("User", userSchema);
export default user;
