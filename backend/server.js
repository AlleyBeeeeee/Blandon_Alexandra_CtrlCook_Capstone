// backend/server.js
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectdb from "./config/db.js"; // Assuming this is your DB connection function
import recipeRoutes from "./routes/recipeRoutes.js";
import userRoutes from "./routes/userRoutes.js"; // Assuming you have user routes
import { notFound, errorHandler } from "./middleware/errorMiddleware.js"; // Imports error middleware

dotenv.config({ path: "./.env" });

connectdb(); // Connects to the MongoDB database

const app = express();
const PORT = process.env.PORT || 5000;

// CORS middleware for allowing frontend communication
app.use(cors({ origin: "http://localhost:5173" }));

// Body parser for raw JSON data
app.use(express.json());

// Body parser for form data
app.use(express.urlencoded({ extended: false }));

// Base route (health check)
app.get("/", (req, res) => {
  res.json({ message: "backend api is running." });
});

// Mount user and recipe routes
app.use("/api/recipes", recipeRoutes);
app.use("/api/users", userRoutes);

// Must be after all routes
app.use(notFound); // 404 handler
app.use(errorHandler); // General error handler

app.listen(PORT, () => {
  console.log(`server running on port ${PORT}`);
});
