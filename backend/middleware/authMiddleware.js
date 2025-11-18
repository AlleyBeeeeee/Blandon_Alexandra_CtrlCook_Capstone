// security guard - ensuring authicated users can perform actions

import jwt from "jsonwebtoken"; // libraray for decoding / verifying tokens
import User from "../models/User"; // asso w user id

export const guard = async (req, res, next) => {
  let token;
  if (
    // checks if the request header contains auth and bearer
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer") // security for authenticating API requests
  )
    try {
      token = req.headers.authorization.split("")[1]; //splits the header string and grabs token value
      const decoded = jwt.verify(token, process.env.JWT_SECRET); // verifies the token's signature against the servers secret key
      // if valid, it decodes the payload/ contains the users id

      req.User = await User.findById(decoded.id).select("-password"); // uses the decoded user id to find the user document in the database
      // the .select('-password') excludes the password hash from the retrieved object for security

      next(); // calls next() to allow the request to proceed to the controller function (the user is verified).
    } catch (error) {
      // if verification fails sends a 401 message
      res.status(401).json({ message: "not authorized, token failed" });
    }
  // checks if the 'token' variable was not set
  if (!token) {
    // sends a 401 unauthorized response if no token was provided in the request
    res.status(401).json({ message: "not authorized, no token" });
  }
};
