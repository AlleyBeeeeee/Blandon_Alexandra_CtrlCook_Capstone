import mongoose from "mongoose";

const CustomRecipeSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    originalApiId: { type: String, required: false },
    title: { type: String, required: true },
    customIngredients: [{ type: String }],
    customInstructions: { type: String },
  },
  { timestamps: true }
);

const CustomRecipe = mongoose.model("CustomRecipe", CustomRecipeSchema);
export default CustomRecipe;
