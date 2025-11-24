import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/CustomizeRecipe.css";

function CustomizeRecipe() {
  const { state } = useLocation();
  const navigate = useNavigate();

  const [recipeData, setRecipeData] = useState(state?.recipe || null);
  const [ingredientList, setIngredientList] = useState([]);
  const [ingredientSubstitutions, setIngredientSubstitutions] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");

  const userAllergies = ["milk", "egg", "peanuts"];

  // Effect to initialize ingredientList
  useEffect(() => {
    if (!recipeData) return;

    // Logic to prioritize existing custom/original ingredients from DB,
    // then fall back to extendedIngredients from Spoonacular.
    const extractedIngredients = recipeData.customIngredients?.length
      ? recipeData.customIngredients
      : recipeData.originalIngredients?.length
      ? recipeData.originalIngredients
      : recipeData.extendedIngredients?.map((i) => i.original) || [];

    setIngredientList(extractedIngredients);
  }, [recipeData]);

  // Effect to fetch substitutions for known allergens
  useEffect(() => {
    if (!recipeData) return;

    const fetchSubs = async () => {
      const subs = {};
      const sourceIngredients = recipeData.customIngredients?.length
        ? recipeData.customIngredients
        : recipeData.originalIngredients?.length
        ? recipeData.originalIngredients
        : recipeData.extendedIngredients?.map((i) => i.original) || [];

      for (let ing of sourceIngredients) {
        // Handle both string ingredients and objects (if coming directly from Spoonacular API)
        const ingName = (
          typeof ing === "string" ? ing : ing.name || ""
        ).toLowerCase();

        // Skip if the name is empty or not in the allergy list
        if (!ingName || !userAllergies.includes(ingName.split(" ")[0]))
          continue;

        try {
          const res = await axios.get(
            `https://api.spoonacular.com/food/ingredients/substitutes?ingredientName=${ingName}&apiKey=${
              import.meta.env.VITE_SPOONACULAR_API_KEY
            }`
          );
          subs[ingName] = res.data.substitutes || [];
        } catch (err) {
          console.error("Error fetching substitution for", ingName, err);
        }
      }

      setIngredientSubstitutions(subs);
    };

    fetchSubs();
  }, [recipeData]);

  //  Handlers for ingredient modification
  const updateIngredient = (index, newIngredient) => {
    const updated = [...ingredientList];
    updated[index] = newIngredient;
    setIngredientList(updated);
  };

  const deleteIngredient = (index) => {
    const updated = [...ingredientList];
    updated.splice(index, 1);
    setIngredientList(updated);
  };

  // Function to save the customized recipe (FIXED)
  const saveCustomRecipe = async () => {
    setIsSaving(true);
    setMessage("");

    try {
      // Determine the canonical list of original ingredients.
      const originalSourceIngredients =
        recipeData.originalIngredients ||
        recipeData.extendedIngredients?.map((i) => i.original) ||
        ingredientList;

      const substitutionMap = {};

      // Calculate the substitution map by comparing the current list to the original list.
      ingredientList.forEach((newIng, i) => {
        const originalIngText = originalSourceIngredients[i] || "";
        // Ensure both are valid strings before processing
        if (typeof originalIngText !== "string" || typeof newIng !== "string")
          return;

        // Get a clean, lowercase name from the original ingredient text.
        let originalIngName = originalIngText
          .toLowerCase()
          .split(",")[0]
          .trim();
        originalIngName = originalIngName.replace(/\./g, "");

        // Check if the ingredient has actually been changed
        if (
          originalIngName &&
          newIng.toLowerCase().split(",")[0].trim() !== originalIngName
        ) {
          if (newIng.trim().length > 0) {
            // Use the sanitized name as the key
            substitutionMap[originalIngName] = newIng.trim();
          }
        }
      });

      //  Construct the payload
      const payload = {
        // Use Spoonacular ID (id or recipeId), fallback is a last resort
        recipeId: String(recipeData.id || recipeData.recipeId || Date.now()),
        title: recipeData.title,
        image: recipeData.image,

        // This is the array of strings for the original recipe
        originalIngredients: originalSourceIngredients,

        // This is the array of strings for the customized recipe
        customIngredients: ingredientList,

        // The calculated map of changes (sanitized keys)
        substitutions: substitutionMap,

        instructions: recipeData.instructions || "",
      };

      console.log("Saving Payload:", payload); // Logging the final payload

      await axios.post("http://localhost:5000/api/recipes", payload);

      setMessage("Recipe saved successfully!");
      navigate("/mycookbook");
    } catch (err) {
      console.error("Save failed:", err);
      // If the error response contains details, display them
      const errorMessage =
        err.response?.data?.error || "Please check server logs for details.";
      setMessage(`Failed to save recipe. Error: ${errorMessage}`);
    } finally {
      setIsSaving(false);
    }
  };

  // Loading and Error States
  if (!recipeData) return <p className="loading-text">Loading recipe...</p>;

  //  Component Render
  return (
    <div className="customize-container">
      <h2 className="page-title">Customize Recipe</h2>
      {message && <p className="message">{message}</p>}

      <div className="ingredients-section">
        <h3 className="section-title">Ingredients</h3>
        <ul className="ingredient-list">
          {ingredientList.map((ingredient, index) => {
            const ingName = ingredient.toLowerCase().split(" ")[0].trim(); // Simple name for substitution lookup

            return (
              <li key={index} className="ingredient-item">
                <span className="ingredient-text">{ingredient}</span>

                {ingredientSubstitutions[ingName]?.length > 0 && (
                  <div className="substitute-select">
                    <label className="substitute-label">Substitute: </label>
                    <select
                      className="substitute-dropdown"
                      value={ingredient}
                      onChange={(e) => updateIngredient(index, e.target.value)}
                    >
                      <option value={ingredient}>{ingredient}</option>
                      {ingredientSubstitutions[ingName].map((sub, subIndex) => (
                        <option key={subIndex} value={sub}>
                          {sub}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <button
                  className="delete-ingredient-btn"
                  onClick={() => deleteIngredient(index)}
                >
                  x
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="instructions-section">
        <h3 className="section-title">Instructions</h3>
        <textarea
          className="instructions-textarea"
          value={recipeData.instructions || ""}
          readOnly
          rows={10}
        />
      </div>

      <button
        className="save-btn"
        onClick={saveCustomRecipe}
        disabled={isSaving}
      >
        {isSaving ? "Saving..." : "Save Recipe"}
      </button>
    </div>
  );
}

export default CustomizeRecipe;
