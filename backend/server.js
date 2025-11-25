import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./db.js";
import authRoutes from "./routes/auth.js";
import recipeRoutes from "./routes/recipe.js";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

// connect to mongodb
connectDB();

// routes
app.use("/api/auth", authRoutes);
app.use("/api/recipes", recipeRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
