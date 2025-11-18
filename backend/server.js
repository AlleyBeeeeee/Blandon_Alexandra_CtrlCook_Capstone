import express from "express";
import dotenv from "dotenv";
import connectdb from "./config/db.js";
import cors from "cors";
import recipe_routes from "./routes/recipeRoutes.js";

dotenv.config();
connectdb();
