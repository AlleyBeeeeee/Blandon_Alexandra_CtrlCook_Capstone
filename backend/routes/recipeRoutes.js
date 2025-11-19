import express from "express";
import { guard } from "../middleware/authMiddleware.js";
import {
  searchExternalRecipes,
  createCustomRecipe,
  getCustomRecipes,
  updateCustomRecipe,
  deleteCustomRecipe,
  getCustomRecipeById,
  getExternalRecipeDetails,
} from "../controllers/recipeController.js";

const router = express.Router();

// Route for searching external recipes
router.get("/search", searchExternalRecipes);

// Route for fetching detailed external recipe by ID
router.get("/external/:id", getExternalRecipeDetails);

// Routes for base path /api/recipes (protected)
router // protected routes for managing users custom data
  .route("/")
  .post(guard, createCustomRecipe) // create
  .get(guard, getCustomRecipes); // read all users recipes

// Routes for specific recipe ID path /api/recipes/:id (protected)
router
  .route("/:id")
  .get(guard, getCustomRecipeById) // read single
  .put(guard, updateCustomRecipe) // update
  .delete(guard, deleteCustomRecipe); // delete

export default router;
