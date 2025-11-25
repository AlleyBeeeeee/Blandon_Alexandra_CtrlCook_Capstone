import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import "../styles/ViewRecipe.css";

function ViewRecipe() {
  const { id: recipeId } = useParams(); // extracts the 'id' parameter
  const navigate = useNavigate(); // hook to get the navigation function
  const { state } = useLocation(); // hook to get the current location's state
  // initialize recipeDetails using state data (for initial render) or null
  const [recipeDetails, setRecipeDetails] = useState(state?.recipe || null);
  const [substitutions, setSubstitutions] = useState({}); // initializes state to store ingredient substitutions
  const [isSaving, setIsSaving] = useState(false); // new state to manage saving button status
  // new state for dynamically loaded allergies
  const [userAllergies, setUserAllergies] = useState([]);

  // effect to load user-specific allergies (simulated fetch)
  useEffect(() => {
    const simulateAllergyFetch = () => {
      console.log("fetching user allergies..");
      const fetchedAllergies = ["wheat", "soy", "milk"]; // example fetched data
      setUserAllergies(fetchedAllergies); // updates the dynamic allergy state
    };
    simulateAllergyFetch();
  }, []); // empty dependency array: runs only once on component mount

  // effect to fetch full recipe details from spoonacular
  useEffect(() => {
    const fetchRecipeDetails = async () => {
      try {
        const apiKey = import.meta.env.VITE_SPOONACULAR_API_KEY;
        if (!apiKey) {
          console.error("spoonacular api key is missing!");
          return;
        }

        const response = await axios.get(
          // makes an api call to spoonacular to get full recipe information
          `https://api.spoonacular.com/recipes/${recipeId}/information?apiKey=${apiKey}`
        );
        console.log("Spoonacular API Response Data:", response.data);

        setRecipeDetails(response.data); // updates the state with the fetched recipe data
      } catch (error) {
        console.error("error fetching full recipe details:", error); // logs any errors during the fetch
      }
    };

    fetchRecipeDetails(); // calls the fetch function
  }, [recipeId]); // dependency array: runs on mount and when recipeId changes

  // effect to fetch substitutions for allergen ingredients (unchanged)
  useEffect(() => {
    const fetchSubstitutions = async () => {
      // checks for both recipe and allergies before fetching substitutions
      if (!recipeDetails || userAllergies.length === 0) return;

      const subs = {};
      for (let ingredient of recipeDetails.extendedIngredients || []) {
        const name = ingredient.name.toLowerCase();

        if (userAllergies.includes(name)) {
          try {
            const res = await axios.get(
              `https://api.spoonacular.com/food/ingredients/substitutes?ingredientName=${name}&apiKey=${
                import.meta.env.VITE_SPOONACULAR_API_KEY
              }`
            );
            subs[name] = res.data.substitutes || [];
          } catch (err) {
            console.error(err);
          }
        }
      }
      setSubstitutions(subs);
    };

    fetchSubstitutions();
  }, [recipeDetails, userAllergies]);

  //  to handle saving the recipe without customization
  const handleSaveRecipe = async () => {
    if (!recipeDetails || isSaving) return; // prevents multiple clicks or saving partial data

    setIsSaving(true);

    // map ingredients to the simple string array expected by your backend schema
    const originalIngredients = (recipeDetails.extendedIngredients || [])
      .map((i) => i.original)
      .filter(Boolean); // ensures no empty strings are saved

    const recipeData = {
      recipeId: String(recipeDetails.id),
      title: recipeDetails.title,
      image: recipeDetails.image,
      instructions: recipeDetails.instructions || "",
      // when saving without customizing, custom ingredients are the same as original
      originalIngredients: originalIngredients,
      customIngredients: originalIngredients,
      substitutions: {},
    };

    try {
      // call backend API endpoint to save the recipe
      const response = await axios.post(
        "http://localhost:5000/api/recipes",
        recipeData
      );
      alert(
        `Recipe "${response.data.title}" saved successfully to your Cookbook!`
      );
    } catch (error) {
      console.error("error saving recipe:", error);
      alert("failed to save recipe. it may already be in your cookbook.");
    } finally {
      setIsSaving(false);
    }
  };

  if (!recipeDetails) return <p>Loading recipe...</p>; // displays a loading message if recipeDetails is null

  return (
    // renders the component's output
    <div className="cookbook-view-container">
      <div className="recipe-hero">
        <img
          src={recipeDetails.image}
          alt={recipeDetails.title}
          className="recipe-hero-image"
        />
        <h1 className="recipe-title">{recipeDetails.title}</h1>
      </div>

      {/* display active allergies for user feedback - not working*/}
      <p
        style={{
          border: "1px solid #ff951c",
          padding: "10px",
          backgroundColor: "#fff8f0",
          borderRadius: "8px",
        }}
      >
        Active Allergies: {userAllergies.join(", ") || "None"}
      </p>

      <div className="view-actions">
        {/* Save Button */}
        <button
          className="action-btn save-btn"
          onClick={handleSaveRecipe}
          disabled={isSaving}
        >
          {isSaving ? (
            "Saving..."
          ) : (
            <>
              💾 <span>Save</span>
            </>
          )}
        </button>

        {/* button to navigate to customization */}
        <button
          className="action-btn customize-btn"
          onClick={() =>
            navigate(`/customize/${recipeId}`, {
              state: { recipe: recipeDetails }, // passes current recipe details for customization
            })
          }
        >
          ✏️ Customize
        </button>
      </div>

      <div className="recipe-section">
        <h2>Ingredients</h2>
        <ul>
          {(recipeDetails.extendedIngredients || []).map(
            (ingredient, index) => {
              const ingName = ingredient.name.toLowerCase();
              return (
                <li key={index}>
                  {ingredient.original}
                  {/* check if substitutions exist for this ingredient */}
                  {substitutions[ingName] &&
                    substitutions[ingName].length > 0 && (
                      <div className="substitutions">
                        🔄 Substitutes: {substitutions[ingName].join(", ")}
                      </div>
                    )}
                </li>
              );
            }
          )}
        </ul>
      </div>

      <div className="recipe-section">
        <h2>Instructions</h2>
        <ol>
          {/* attempts to map over structured instructions */}
          {recipeDetails.analyzedInstructions?.[0]?.steps?.map((step) => (
            <li key={step.number}>{step.step}</li>
          )) ||
            // fallback: maps over raw instruction text split by newlines
            recipeDetails.instructions
              ?.split("\n")
              .map((step, index) => <li key={index}>{step}</li>)}
        </ol>
      </div>
    </div>
  );
}

export default ViewRecipe;
