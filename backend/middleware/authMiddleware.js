import jwt from "jsonwebtoken";
import asyncHandler from "express-async-handler"; // for wrapping async functions
import User from "../models/User.js"; // remember the .js extension

// middleware function to protect routes
export const guard = asyncHandler(async (req, res, next) => {
  let token;

  // check if the authorization header exists and starts with 'bearer'
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];

      // verify token using the secret key
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // get user from the token id and attach it to the request object
      // Use req.user (lowercase) for consistency
      req.user = await User.findById(decoded.id).select("-password");

      next(); // move to the next middleware or route handler
    } catch (error) {
      console.error("jwt verification failed:", error.message);
      res.status(401); // unauthorized
      throw new Error("not authorized, token failed");
    }
  }

  if (!token) {
    res.status(401); // unauthorized
    throw new Error("not authorized, no token");
  }
});
