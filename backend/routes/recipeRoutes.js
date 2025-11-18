import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  searchExternalRecipes,
  createCustomRecipe,
  getCustomRecipes,
  updateCustomRecipe,
  deleteCustomRecipe,
} from "../controllers/recipeController.js";
