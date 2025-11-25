import mongoose from "mongoose";

const RecipeSchema = new mongoose.Schema({
  // store the original numeric ID from Spoonacular
  //  value that should be used in the frontend Link component (recipe.recipeId)
  recipeId: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  image: { type: String },

  // original ingredients as text array for local fallback/customization base
  originalIngredients: { type: [String], required: true },

  //  user-modified ingredients separately
  customIngredients: { type: [String], default: [] },

  substitutions: { type: Map, of: String, default: {} },
  instructions: { type: String },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Recipe", RecipeSchema);
