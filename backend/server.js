import express from "express";
import dotenv from "dotenv";
import connectdb from "./config/db.js";
import cors from "cors";
import recipe_routes from "./routes/recipeRoutes.js";

dotenv.config();
connectdb();

const app = express();
// allows frontend (port 5173) to communicate with backend (port 5000)
app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());
