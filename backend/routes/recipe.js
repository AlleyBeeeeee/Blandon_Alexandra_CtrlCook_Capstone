import express from "express";
import Recipe from "../models/Recipe.js";

const router = express.Router();

// Save or update custom recipe
router.post("/", async (req, res) => {
  try {
    const {
      recipeId,
      title,
      image,
      customIngredients,
      originalIngredients,
      substitutions,
      instructions,
    } = req.body;

    //  original ingredients always exist
    if (!originalIngredients || originalIngredients.length === 0) {
      return res.status(400).json({
        error: "originalIngredients list is required and cannot be empty",
      });
    }

    // recipe already exists — update instead of duplicating
    let existingRecipe = await Recipe.findOne({ recipeId });

    if (existingRecipe) {
      existingRecipe.customIngredients = customIngredients;
      existingRecipe.substitutions = substitutions;
      existingRecipe.instructions = instructions;
      existingRecipe.image = image;
      existingRecipe.title = title;
      existingRecipe.originalIngredients = originalIngredients;

      await existingRecipe.save();
      return res.json(existingRecipe);
    }

    // create new recipe
    const newRecipe = new Recipe({
      recipeId,
      title,
      image,
      originalIngredients,
      customIngredients,
      substitutions,
      instructions,
    });

    const saved = await newRecipe.save();
    res.json(saved);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// get all customized recipes
router.get("/", async (req, res) => {
  try {
    const recipes = await Recipe.find().select(
      "recipeId title image customIngredients instructions originalIngredients"
    );
    // recipes array returned here will be mapped in MyCookBook
    res.json(recipes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// delete recipe
router.delete("/:id", async (req, res) => {
  try {
    const recipe = await Recipe.findByIdAndDelete(req.params.id);
    if (!recipe) return res.status(404).send("Recipe not found");
    res.status(200).json({ message: "Recipe deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
