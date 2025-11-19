import { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  saveCustomRecipe,
  updateCustomRecipe,
  getCustomRecipeById,
  getExternalRecipeDetails,
} from "../services/recipeService";

const EditorView = () => {
  const { id } = useParams(); // spoonacular id or mongodb id
  const location = useLocation();
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);

  // determine if we are editing an existing recipe from mongodb
  const isEditing = user && !location.state?.originalId;
  // determine if we are customizing a new recipe from a search result
  const isNewRecipe = location.state?.originalId && !isEditing;

  const [recipeData, setRecipeData] = useState({
    title: location.state?.recipe?.title || "",
    originalApiId: location.state?.originalId || null, // initialize with external id if present
    customInstructions: "",
    customIngredients: [""],
  });

  // useeffect to load existing recipe data for editing or fetch new recipe details
  useEffect(() => {
    // 1. load existing recipe from mongodb (editing mode)
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
          // redirect if the recipe is not found or unauthorized
          navigate("/cookbook");
        }
      };
      fetchRecipe();

      // 2. fetch full details from external api (new customization mode)
    } else if (isNewRecipe) {
      const fetchExternalRecipe = async () => {
        try {
          // fetch full details using the id passed from the search view
          const fullRecipe = await getExternalRecipeDetails(
            location.state.originalId
          );

          // pre-fill the state with the details from the external api
          setRecipeData({
            title: fullRecipe.title,
            originalApiId: fullRecipe.originalApiId,
            customInstructions: fullRecipe.customInstructions,
            customIngredients: fullRecipe.customIngredients || [""],
          });
        } catch (error) {
          console.error("failed to fetch external recipe details:", error);
          alert("could not fetch recipe details. please try another recipe.");
          navigate("/search");
        }
      };
      fetchExternalRecipe();
    }
  }, [id, isEditing, isNewRecipe, user, navigate, location.state]);

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
      if (isNew) {
        // create new recipe (c)
        await saveCustomRecipe(recipeData, user.token);
      } else {
        // update existing recipe (u)
        await updateCustomRecipe(id, recipeData, user.token);
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
