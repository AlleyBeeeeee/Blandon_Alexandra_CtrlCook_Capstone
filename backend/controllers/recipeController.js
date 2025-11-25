import Recipe from "../models/Recipe.js";

// @route   GET /api/recipes
export const getUsersRecipes = async (req, res) => {
  try {
    const recipes = await Recipe.find({ userId: req.user.id }).sort({
      createdAt: -1,
    });
    res.json(recipes);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};

// @route   GET /api/recipes/:id
export const getRecipeById = async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);

    if (!recipe) return res.status(404).json({ msg: "Recipe not found" });

    if (recipe.userId.toString() !== req.user.id) {
      return res.status(401).json({ msg: "Not authorized" });
    }

    res.json(recipe);
  } catch (err) {
    console.error(err.message);
    if (err.kind === "ObjectId")
      return res.status(404).json({ msg: "Recipe not found" });
    res.status(500).send("Server Error");
  }
};

// @route   POST /api/recipes
export const createRecipe = async (req, res) => {
  try {
    const newRecipe = new Recipe({
      ...req.body,
      userId: req.user.id,
    });

    const recipe = await newRecipe.save();
    res.json(recipe);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};

// @route   PUT /api/recipes/:id
export const updateRecipe = async (req, res) => {
  const { title, ingredients, instructions, servings, readyInMinutes } =
    req.body;

  try {
    let recipe = await Recipe.findById(req.params.id);

    if (!recipe) return res.status(404).json({ msg: "Recipe not found" });

    if (recipe.userId.toString() !== req.user.id) {
      return res.status(401).json({ msg: "Not authorized" });
    }

    recipe = await Recipe.findByIdAndUpdate(
      req.params.id,
      { $set: { title, ingredients, instructions, servings, readyInMinutes } },
      { new: true }
    );

    res.json(recipe);
  } catch (err) {
    console.error(err.message);
    if (err.kind === "ObjectId")
      return res.status(404).json({ msg: "Recipe not found" });
    res.status(500).send("Server Error");
  }
};

// @route   DELETE /api/recipes/:id
export const deleteRecipe = async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);

    if (!recipe) return res.status(404).json({ msg: "Recipe not found" });

    if (recipe.userId.toString() !== req.user.id) {
      return res.status(401).json({ msg: "Not authorized" });
    }

    await Recipe.deleteOne({ _id: req.params.id });

    res.json({ msg: "Recipe removed" });
  } catch (err) {
    console.error(err.message);
    if (err.kind === "ObjectId")
      return res.status(404).json({ msg: "Recipe not found" });
    res.status(500).send("Server Error");
  }
};
