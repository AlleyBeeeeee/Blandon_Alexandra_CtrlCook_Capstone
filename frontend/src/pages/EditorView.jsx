import React, { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  saveCustomRecipe,
  updateCustomRecipe,
  getCustomRecipeById,
} from "../services/recipeService";

const EditorView = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);

  //  determine the mode: EDITING if user is logged in/did not come from a search result state
  const isEditing = user && !location.state?.recipe;
  const isNewRecipe = !isEditing;

  const [recipeData, setRecipeData] = useState({
    title: location.state?.recipe?.title || "",
    originalApiId: location.state?.recipe?.id || null,
    customInstructions: "",
    customIngredients: [""],
  });

  // useEffect to load existing recipe data for editing
  useEffect(() => {
    if (isEditing && user?.token) {
      const fetchRecipe = async () => {
        try {
          const existingRecipe = await getCustomRecipeById(id, user.token);

          setRecipeData({
            title: existingRecipe.title,
            originalApiId: existingRecipe.originalApiId || null,
            customInstructions: existingRecipe.customInstructions,
            customIngredients: existingRecipe.customIngredients || [""],
          });
        } catch (error) {
          console.error("failed to fetch recipe for editing:", error);
          // redirect if the recipe doesn't exist or is unauthorized
          navigate("/cookbook");
        }
      };
      fetchRecipe();
    }
  }, [id, isEditing, user, navigate]);

  const handleChange = (e) => {
    setRecipeData({ ...recipeData, [e.target.name]: e.target.value });
  };

  const handleIngredientChange = (index, value) => {
    const newIngredients = recipeData.customIngredients.map((ing, i) =>
      i === index ? value : ing
    );
    setRecipeData({ ...recipeData, customIngredients: newIngredients });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!user || !user.token)
      return alert("you must be logged in to save recipes.");

    try {
      if (isNewRecipe) {
        await saveCustomRecipe(recipeData, user.token); // CREATE
      } else {
        await updateCustomRecipe(id, recipeData, user.token); // UPDATE
      }

      alert("recipe saved successfully!");
      navigate("/cookbook");
    } catch (error) {
      alert("error saving recipe.");
      console.error(error);
    }
  };

  return (
    <div>
      <h2>{isNewRecipe ? "customize new recipe" : "edit custom recipe"}</h2>
      <form onSubmit={handleSave}>
        <input
          type="text"
          name="title"
          placeholder="recipe title"
          value={recipeData.title}
          onChange={handleChange}
          required
        />

        <label>instructions:</label>
        <textarea
          name="customInstructions"
          value={recipeData.customInstructions}
          onChange={handleChange}
        />

        <label>ingredients:</label>
        {/* Input fields for ingredients */}
        {recipeData.customIngredients.map((ing, index) => (
          <input
            key={index}
            type="text"
            value={ing}
            onChange={(e) => handleIngredientChange(index, e.target.value)}
          />
        ))}
        {/* Button to add an ingredient input (can be improved with better UI) */}
        <button
          type="button"
          onClick={() =>
            setRecipeData({
              ...recipeData,
              customIngredients: [...recipeData.customIngredients, ""],
            })
          }
        >
          add ingredient
        </button>

        <button type="submit">
          {isNewRecipe ? "save recipe" : "update recipe"}
        </button>
      </form>
    </div>
  );
};

export default EditorView;
