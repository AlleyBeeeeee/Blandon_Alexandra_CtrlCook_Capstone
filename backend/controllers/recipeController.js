// handles both spoonacular requests and CRUD operations

import axios from "axios"; // promise based http client to make ext api requests
import CustomRecipe from "../models/CustomRecipe.js";
import e from "express";

const API_KEY = process.env.SPOONACULAR_API_KEY;
const BASE_URL = process.env.SPOONACULAR_BASE_URL;

// r - read (external api wrapper)
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
          apiKey: process.env.SPOONACULAR_API_KEY,
          query: query,
          number: 10, // limits results to 10
        },
      }
    );

    // return the results array (or empty array if none found)
    res.json(apiResponse.data.results);
  } catch (error) {
    res.status(500).json({ message: "failed to fetch external recipes" });
  }
});

// CRUD

// C - create custom recipe
export const createCustomRecipe = async (req, res) => {
  const { originalApiId, title, customIngredients, customInstructions } =
    req.body;
  try {
    // creates a new document in the customrecipes collection
    const newRecipe = await CustomRecipe.create({
      owner: req.user._id, // uses the authenticated user's id from the middleware
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

// R - read for one user
export const getCustomRecipes = async (req, res) => {
  try {
    // finds all documents where the owner matches the authenticated users id
    const recipes = await CustomRecipe.find({ owner: req.user._id });
    // sends the array of custom recipes back to the frontend for the cookbook view
    res.status(200).json(recipes);
  } catch (error) {
    res.status(500).json({ message: "failed to retrieve custom recipes." });
  }
};

// U - update recipe
export const updateCustomRecipe = async (req, res) => {
  const { id } = req.params; // gets the recipe ID from the url parameter
  try {
    // finds and updates the recipe only if the ID matches AND the owner matches the logged-in user
    const updatedRecipe = await CustomRecipe.findOneAndUpdate(
      { _id: id, owner: req.user._id }, // primary query with authorization check
      req.body, // data sent from the frontend to update
      { new: true, runValidators: true } // 'new: true' returns the updated document
    );
    if (!updatedRecipe) {
      //recipe id is wrong or user is not the owner (unauthorized)
      return res
        .status(404)
        .json({ message: "recipe not found or unauthorized." });
    }
    res.status(200).json(updatedRecipe);
  } catch (error) {
    res.status(400).json({ message: "error updating custom recipe." });
  }
};

//D delete recipe
export const deleteCustomRecipe = async (req, res) => {
  const { id } = req.params; // gets the recipe ID from the url parameter

  try {
    // finds and permanently deletes the recipe only if the ID matches AND the owner matches the logged-in user
    const deletedRecipe = await CustomRecipe.findOneAndDelete({
      _id: id,
      owner: req.user._id, // primary query with authorization check
    });

    if (!deletedRecipe) {
      // recipe id is wrong or user is not the owner (unauthorized)
      return res
        .status(404)
        .json({ message: "recipe not found or unauthorized." });
    }
    // confirms deletion
    res.status(200).json({ message: "recipe deleted successfully." });
  } catch (error) {
    res.status(500).json({ message: "error deleting recipe." });
  }
};
