import asyncHandler from "express-async-handler";
import CustomRecipe from "../models/CustomRecipe.js";
import axios from "axios";
import { mockSearchResults, mockRecipeDetails } from "../mockSearchData.js";

export const searchExternalRecipes = asyncHandler(async (req, res) => {
  const { query } = req.query;

  if (!query) {
    res.status(400);
    throw new Error("please provide a search query");
  }
  if (process.env.USE_MOCK_DATA === "true") {
    return res.json(mockSearchResults);
  }

  if (!process.env.SPOONACULAR_API_KEY) {
    res.status(500);
    throw new Error("Spoonacular API Key is not set in environment variables.");
  }

  try {
    // call the external api using the key from the .env file
    const apiResponse = await axios.get(
      "https://api.spoonacular.com/recipes/complexSearch",
      {
        params: {
          apiKey: process.env.SPOONACULAR_API_KEY,
          query: query,
          number: 10,
        },
      }
    );

    res.json(apiResponse.data.results);
  } catch (error) {
    const status = error.response?.status || 500;

    let message = "Failed to fetch external recipes.";

    if (status === 402) {
      message =
        "Spoonacular API quota exceeded or key invalid. Check your key and daily limit.";
    } else if (status === 401) {
      message =
        "Authentication failed with Spoonacular API. Check your API key.";
    }
    res.status(status).json({ message });
  }
});

export const getExternalRecipeDetails = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!id) {
    res.status(400);
    throw new Error("recipe id is required");
  }

  // mpck data check
  if (process.env.USE_MOCK_DATA === "true") {
    return res.json(mockRecipeDetails);
  }
  // api check
  if (!process.env.SPOONACULAR_API_KEY) {
    res.status(500);
    throw new Error("Spoonacular API Key is not set in environment variables.");
  }

  try {
    const apiResponse = await axios.get(
      `https://api.spoonacular.com/recipes/${id}/information`,
      {
        params: {
          apiKey: process.env.SPOONACULAR_API_KEY,
        },
      }
    );

    res.json(apiResponse.data);
  } catch (error) {
    const status = error.response?.status || 500;

    let message = "Failed to fetch external recipe details.";

    if (status === 402) {
      message =
        "Spoonacular API quota exceeded or key invalid. Check your key and daily limit.";
    } else if (status === 401) {
      message =
        "Authentication failed with Spoonacular API. Check your API key.";
    } else if (status === 404) {
      message = "Recipe not found on external API.";
    }

    res.status(status).json({ message });
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

    original_api_id: originalApiId,
    custom_instructions: customInstructions,
    custom_ingredients: customIngredients,
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
    throw new Error("Recipe not found");
  }

  // ensure the found recipe belongs to the logged-in user
  if (recipe.owner.toString() !== req.user.id) {
    res.status(401);
    throw new Error("Not authorized to view this recipe");
  }

  res.status(200).json(recipe);
});

export const updateCustomRecipe = asyncHandler(async (req, res) => {
  const recipe = await CustomRecipe.findById(req.params.id);

  if (!recipe) {
    res.status(404);
    throw new Error("Recipe not found.");
  }

  // authorization check: ensure the recipe owner matches the logged-in user
  if (recipe.owner.toString() !== req.user.id) {
    res.status(401);
    throw new Error("Not authorized to update this recipe.");
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
    throw new Error("Recipe not found.");
  }

  // authorization check: ensure the recipe owner matches the logged-in user
  if (recipe.owner.toString() !== req.user.id) {
    res.status(401);
    throw new Error("Not authorized to delete this recipe.");
  }

  await CustomRecipe.deleteOne({ _id: req.params.id });

  res.status(200).json({ id: req.params.id, message: "Recipe removed." });
});
