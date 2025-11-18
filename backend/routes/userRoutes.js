import express from "express";
import { registerUser, loginUser } from "../controllers/userController.js";

const router = express.Router();

// POST request to /api/users for registration
router.post("/", registerUser);

// POST request to /api/users/login for login
router.post("/login", loginUser);

export default router;
