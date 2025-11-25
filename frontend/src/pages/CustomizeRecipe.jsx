import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/CustomizeRecipe.css";

function CustomizeRecipe() {
  // react router hook to get state passed from the previous route (the recipe object)
  const { state } = useLocation();
  // react router hook to programmatically change navigation
  const navigate = useNavigate();

  // state to hold the recipe data fetched/passed initially
  const [recipeData, setRecipeData] = useState(state?.recipe || null);
  // state holding the list of ingredients the user can modify
  const [ingredientList, setIngredientList] = useState([]);
  // state holding potential substitutions fetched from the spoonacular api
  const [ingredientSubstitutions, setIngredientSubstitutions] = useState({});
  // boolean flag to disable the save button while saving
  const [isSaving, setIsSaving] = useState(false);
  // state to display success or error messages to the user
  const [message, setMessage] = useState("");
  // state holding the editable recipe instructions
  const [customInstructions, setCustomInstructions] = useState("");
  // new state for the ingredient input box, tracks what the user is typing
  const [newIngredientText, setNewIngredientText] = useState("");
  // hardcoded list of user allergies for demonstration/lookup
  const userAllergies = ["milk", "egg", "peanuts"];

  // effect to initialize ingredient list and custom instructions when recipe data loads
  useEffect(() => {
    // exit if no recipe data is available
    if (!recipeData) return;

    // 1. initialize ingredients: prioritize custom (for re-editing), then original (from db), then extended (from spoonacular)
    const extractedIngredients = recipeData.customIngredients?.length
      ? recipeData.customIngredients
      : recipeData.originalIngredients?.length
      ? recipeData.originalIngredients
      : recipeData.extendedIngredients?.map((i) => i.original) || [];

    setIngredientList(extractedIngredients);

    // 2. initialize instructions: prioritize custom, then original
    const extractedInstructions =
      recipeData.customInstructions || recipeData.instructions || "";
    setCustomInstructions(extractedInstructions);
  }, [recipeData]);

  // effect to fetch substitutions for known allergens
  useEffect(() => {
    if (!recipeData) return;

    const fetchSubs = async () => {
      const subs = {};
      // determine the source list for fetching substitutions (must match initialization logic)
      const sourceIngredients = recipeData.customIngredients?.length
        ? recipeData.customIngredients
        : recipeData.originalIngredients?.length
        ? recipeData.originalIngredients
        : recipeData.extendedIngredients?.map((i) => i.original) || [];

      // loop through each ingredient to check for allergies
      for (let ing of sourceIngredients) {
        // extract the ingredient name, handling both string and object formats
        const ingName = (
          typeof ing === "string" ? ing : ing.name || ""
        ).toLowerCase();

        // skip if the ingredient name isn't one of the user's allergies (checking the first word)
        if (!ingName || !userAllergies.includes(ingName.split(" ")[0]))
          continue;

        try {
          // call the spoonacular api to get substitutes for the allergic ingredient
          const res = await axios.get(
            `https://api.spoonacular.com/food/ingredients/substitutes?ingredientName=${ingName}&apiKey=${
              import.meta.env.VITE_SPOONACULAR_API_KEY
            }`
          );
          // store the substitutes array, keyed by the ingredient name
          subs[ingName] = res.data.substitutes || [];
        } catch (err) {
          console.error("error fetching substitution for", ingName, err);
        }
      }

      setIngredientSubstitutions(subs);
    };

    fetchSubs();
  }, [recipeData]);

  // handlers for ingredient modification
  // updates an existing ingredient (used by substitution dropdown)
  const updateIngredient = (index, newIngredient) => {
    const updated = [...ingredientList];
    updated[index] = newIngredient;
    setIngredientList(updated);
  };

  // removes an ingredient from the list
  const deleteIngredient = (index) => {
    const updated = [...ingredientList];
    updated.splice(index, 1);
    setIngredientList(updated);
  };

  // new handler: function to add a new ingredient from the input box
  const addIngredient = () => {
    const newText = newIngredientText.trim();
    // only add if the input is not empty
    if (newText) {
      // append the new ingredient to the existing list
      setIngredientList([...ingredientList, newText]);
      // clear the input field after adding
      setNewIngredientText("");
    }
  };

  // function to save the customized recipe to the backend
  const saveCustomRecipe = async () => {
    setIsSaving(true);
    setMessage("");

    try {
      // determine the canonical list of original ingredients for comparison.
      // this only includes original items, ignoring user-added ingredients for substitution mapping calculation.
      const originalSourceIngredients =
        recipeData.originalIngredients ||
        recipeData.extendedIngredients?.map((i) => i.original) ||
        ingredientList.slice(
          0,
          recipeData.originalIngredients?.length ||
            recipeData.extendedIngredients?.length ||
            0
        );

      const substitutionMap = {};

      // calculate the substitution map by comparing the custom list to the original list.
      ingredientList.forEach((newIng, i) => {
        const originalIngText = originalSourceIngredients[i] || "";

        // skip check if the index 'i' corresponds to a newly added ingredient
        if (i >= originalSourceIngredients.length) return;

        if (typeof originalIngText !== "string" || typeof newIng !== "string")
          return;

        // sanitize and clean the original ingredient name for the map key
        let originalIngName = originalIngText
          .toLowerCase()
          .split(",")[0]
          .trim();
        originalIngName = originalIngName.replace(/\./g, "");

        // check if the ingredient has been changed by the user (substitution)
        if (
          originalIngName &&
          newIng.toLowerCase().split(",")[0].trim() !== originalIngName
        ) {
          if (newIng.trim().length > 0) {
            // map the original name to the new substituted ingredient
            substitutionMap[originalIngName] = newIng.trim();
          }
        }
      });

      // construct the payload to send to the server
      const payload = {
        // use recipe id from state, falling back to a timestamp if missing
        recipeId: String(recipeData.id || recipeData.recipeId || Date.now()),
        title: recipeData.title,
        image: recipeData.image,

        // send the canonical original ingredients
        originalIngredients: originalSourceIngredients,

        // send the final, customized list of ingredients (including additions/deletions)
        customIngredients: ingredientList,

        // send the map of changes/substitutions made to original ingredients
        substitutions: substitutionMap,

        // send the user's edited instructions
        instructions: customInstructions,
      };

      console.log("saving payload:", payload);

      // send the post request to the backend api
      await axios.post("http://localhost:5000/api/recipes", payload);

      setMessage("recipe saved successfully!");
      // redirect the user to their cookbook page
      navigate("/mycookbook");
    } catch (err) {
      console.error("save failed:", err);
      // extract and display error details from the response
      const errorMessage =
        err.response?.data?.error || "please check server logs for details.";
      setMessage(`failed to save recipe. error: ${errorMessage}`);
    } finally {
      // reset saving state regardless of success/failure
      setIsSaving(false);
    }
  };

  // loading state check
  if (!recipeData) return <p className="loading-text">loading recipe...</p>;

  // component render starts here
  return (
    <div className="customize-container">
      <h2 className="page-title">Customize Recipe</h2>
      {/* display messages if present */}
      {message && <p className="message">{message}</p>}

      <div className="ingredients-section">
        <h3 className="section-title">Ingredients:</h3>
        <ul className="ingredient-list">
          {/* map over the current ingredient list to display each item */}
          {ingredientList.map((ingredient, index) => {
            // extract the base ingredient name for substitution lookup
            const ingName = ingredient.toLowerCase().split(" ")[0].trim();

            return (
              <li key={index} className="ingredient-item">
                {/* display the ingredient text */}
                <span className="ingredient-text">{ingredient}</span>

                {/* check if substitutions exist for this ingredient */}
                {ingredientSubstitutions[ingName]?.length > 0 && (
                  <div className="substitute-select">
                    <label className="substitute-label">substitute: </label>
                    <select
                      className="substitute-dropdown"
                      // bind the select value to the current ingredient in the list
                      value={ingredient}
                      // update the ingredientlist state when a new substitute is selected
                      onChange={(e) => updateIngredient(index, e.target.value)}
                    >
                      {/* first option is always the current ingredient */}
                      <option value={ingredient}>{ingredient}</option>
                      {/* map over available substitutes */}
                      {ingredientSubstitutions[ingName].map((sub, subIndex) => (
                        <option key={subIndex} value={sub}>
                          {sub}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* button to delete the ingredient */}
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

        {/* new input and button section for adding ingredients */}
        <div className="add-ingredient-form">
          <input
            type="text"
            className="new-ingredient-input"
            placeholder="Add ingredient (e.g., 1 tsp salt)"
            // bind value to newingredienttext state
            value={newIngredientText}
            // update state on change
            onChange={(e) => setNewIngredientText(e.target.value)}
            // allow adding by pressing the enter key
            onKeyDown={(e) => {
              if (e.key === "enter") {
                e.preventDefault();
                addIngredient();
              }
            }}
          />
          <button
            className="add-ingredient-btn"
            onClick={addIngredient}
            // disable button if input is empty
            disabled={!newIngredientText.trim()}
          >
            + Add
          </button>
        </div>
      </div>

      <div className="instructions-section">
        <h3 className="section-title">Instructions</h3>
        <textarea
          className="instructions-textarea"
          // bind value to custominstructions state
          value={customInstructions}
          // update state on change, making it editable
          onChange={(e) => setCustomInstructions(e.target.value)}
          rows={10}
        />
      </div>

      <button
        className="save-btn"
        onClick={saveCustomRecipe}
        // disable while saving
        disabled={isSaving}
      >
        {isSaving ? "Saving..." : "Save Recipe"}
      </button>
    </div>
  );
}

export default CustomizeRecipe;
