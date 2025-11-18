// handles both spoonacular requests and CRUD operations

import axios from "axios"; // promise based http client to make ext api requests
import CustomRecipe from "../models/CustomRecipe";

const API_KEY = process.env.SPOONACULAR_API_KEY;
const BASE_URL = process.env.SPOONACULAR_BASE_URL;

// r - read (external api wrapper)
export const searchExternalRecipes = async (req, res) => {
  const { query } = req.query; // extracts the search term from the url query parameters
  try {
    // uses axios to request data from spoonacular securely
    const response = await axios.get(`${BASE_URL}/recipes/complexSearch`, {
      // pass search parameters with api key
      params: { query, apiKey: API_KEY, number: 10, fillIngredients: true },
    });
    // sends results array back to the frontend
    res.json(response.data.results);
  } catch (error) {
    // handles errors
    res.status(500).json({ message: "failed to fetch external recipes." });
  }
};

// CRUD

// C - create
export const createCustomRecipe = async (req, res) => {
  const { originalApiId, title, customIngredients, customInstructions } =
    req.body;
  try {
    // creates a new document in the customrecipes collection
    const newRecipe = await CustomRecipe.create({
      owner: req.user._id, // uses the authenticated user's id from the 'protect' middleware
      originalApiId,
      title,
      customIngredients,
      customInstructions,
    });
    // sends a 201 (created) status with the new recipe data
    res.status(201).json(newRecipe);
  } catch (error) {
    res.status(400).json({ message: "error saving custom recipe." });
  }
};
