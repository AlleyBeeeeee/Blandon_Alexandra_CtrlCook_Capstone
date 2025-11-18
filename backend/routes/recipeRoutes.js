import express from "express";
import { guard } from "../middleware/authMiddleware.js";
import {
  searchExternalRecipes,
  createCustomRecipe,
  getCustomRecipes,
  updateCustomRecipe,
  deleteCustomRecipe,
} from "../controllers/recipeController.js";

const router = express.Router();

router.get("/search", searchExternalRecipes); //route for searching
