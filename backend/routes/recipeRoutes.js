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

router // protected routes for managing users custom data
  .route("/")
  .post(guard, createCustomRecipe) // create
  .get(guard, getCustomRecipes); // read all users recipes

router
  .route("/:id")
  .put(guard, updateCustomRecipe) // update
  .delete(guard, deleteCustomRecipe); // delete
