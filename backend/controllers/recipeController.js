import asyncHandler from "express-async-handler";
import CustomRecipe from "../models/CustomRecipe.js";
import axios from "axios";

export const searchExternalRecipes = asyncHandler(async (req, res) => {
  const { query } = req.query;

  if (!query) {
    res.status(400);
    throw new Error("please provide a search query");
  }

  try {
    // call the external api using the key from the .env file
    const apiResponse = await axios.get(
      "https://api.spoonacular.com/recipes/complexSearch",
      {
        params: {
          // FIX: Changed API_KEY to SPOONACULAR_API_KEY
          apiKey: process.env.SPOONACULAR_API_KEY,
          query: query,
          number: 10, // limits results to 10
        },
      }
    ); // return the results array (or empty array if none found)

    res.json(apiResponse.data.results);
  } catch (error) {
    res.status(500).json({ message: "failed to fetch external recipes" });
  }
});
export const getExternalRecipeDetails = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!id) {
    res.status(400);
    throw new Error("recipe id is required");
  }

  try {
    // call the spoonacular endpoint for detailed information
    const apiResponse = await axios.get(
      `https://api.spoonacular.com/recipes/${id}/information`,
      {
        params: {
          // fix: ensure the correct environment variable name is used here too
          apiKey: process.env.SPOONACULAR_API_KEY,
          includeNutrition: false,
        },
      }
    );

    const data = apiResponse.data;

    // format the response to match the editor's expected state shape
    const formattedRecipe = {
      title: data.title,
      originalApiId: data.id,
      // use instructions or summary as a fallback for the custom instructions field
      customInstructions:
        data.instructions || data.summary || "instructions not available.",
      // map extended ingredients array to a simple array of strings
      customIngredients: data.extendedIngredients.map((ing) => ing.original),
    };

    res.json(formattedRecipe);
  } catch (error) {
    // log the error for debugging and return a 500 status
    console.error("external api detail fetch failed:", error.message);
    res.status(500).json({
      message: "failed to fetch detailed recipe from external source.",
    });
  }
});

export const createCustomRecipe = asyncHandler(async (req, res) => {
  const { title, originalApiId, customInstructions, customIngredients } =
    req.body;

  if (!title) {
    res.status(400);
    throw new Error("recipe must have a title");
  }

  // create the recipe, linking the owner ID from the `req.user` object set by `protect` middleware
  const recipe = await CustomRecipe.create({
    owner: req.user.id,
    title,
    originalApiId,
    customInstructions,
    customIngredients,
  });

  res.status(201).json(recipe);
});

export const getCustomRecipes = asyncHandler(async (req, res) => {
  // find all recipes where the owner matches the logged-in user's ID
  const recipes = await CustomRecipe.find({ owner: req.user.id });

  res.status(200).json(recipes);
});

export const getCustomRecipeById = asyncHandler(async (req, res) => {
  const recipe = await CustomRecipe.findById(req.params.id);

  if (!recipe) {
    res.status(404);
    throw new Error("recipe not found");
  }

  // ensure the found recipe belongs to the logged-in user
  if (recipe.owner.toString() !== req.user.id) {
    res.status(401);
    throw new Error("not authorized to view this recipe");
  }

  res.status(200).json(recipe);
});

export const updateCustomRecipe = asyncHandler(async (req, res) => {
  const recipe = await CustomRecipe.findById(req.params.id);

  if (!recipe) {
    res.status(404);
    throw new Error("recipe not found");
  }

  // authorization check: ensure the recipe owner matches the logged-in user
  if (recipe.owner.toString() !== req.user.id) {
    res.status(401);
    throw new Error("not authorized to update this recipe");
  }

  const updatedRecipe = await CustomRecipe.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true } // returns the updated document
  );

  res.status(200).json(updatedRecipe);
});

export const deleteCustomRecipe = asyncHandler(async (req, res) => {
  const recipe = await CustomRecipe.findById(req.params.id);

  if (!recipe) {
    res.status(404);
    throw new Error("recipe not found");
  }

  // authorization check: ensure the recipe owner matches the logged-in user
  if (recipe.owner.toString() !== req.user.id) {
    res.status(401);
    throw new Error("not authorized to delete this recipe");
  }

  await CustomRecipe.deleteOne({ _id: req.params.id });

  res.status(200).json({ id: req.params.id, message: "recipe removed" });
});
