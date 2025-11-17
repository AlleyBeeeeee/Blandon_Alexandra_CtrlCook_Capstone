import mongoose from "mongoose";

const customRecipeSchema = new mongoose.Schema(
  {
    // links this recipe back to the user who created it
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true, // indexed for fast lookup of a user's collection
    },
    original_api_id: { type: String, required: true },
    title: { type: String, required: true },
    custom_ingredients: [{ name: String, quantity: String }],
    custom_instructions: { type: String },
  },
  { timestamps: true }
);

const customRecipe = mongoose.model("CustomRecipe", customRecipeSchema);
export default customRecipe;
