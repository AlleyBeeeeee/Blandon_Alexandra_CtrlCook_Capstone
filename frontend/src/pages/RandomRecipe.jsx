import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/ViewRecipe.css";

function RandomRecipe() {
  // hook to get the navigation function for programmatic routing
  const navigate = useNavigate(); // state to hold the fetched random recipe object
  const [recipeDetails, setRecipeDetails] = useState(null); // state to manage the loading status while fetching data
  const [loading, setLoading] = useState(true); // effect hook to run the data fetching logic once after the component mounts

  useEffect(() => {
    // defines an asynchronous function to fetch the random recipe
    const fetchRandomRecipe = async () => {
      try {
        // makes an api call to spoonacular to get one random recipe
        const response = await axios.get(
          `https://api.spoonacular.com/recipes/random?number=1&apiKey=${
            import.meta.env.VITE_SPOONACULAR_API_KEY
          }`
        ); // updates the state with the first recipe object from the response array
        setRecipeDetails(response.data.recipes[0]);
      } catch (error) {
        console.error("error fetching random recipe:", error);
      } finally {
        // sets loading to false regardless of success or failure
        setLoading(false);
      }
    }; // calls the asynchronous fetch function

    fetchRandomRecipe();
  }, []); // empty dependency array ensures this runs only once on mount // if loading is true, display a simple loading message

  if (loading) return <p>loading random recipe...</p>; // if loading is false but no recipe data was retrieved, display a failure message
  if (!recipeDetails) return <p>failed to load recipe.</p>; // the component's render output

  return (
    // main container for the recipe view
    <div className="cookbook-view-container">
      <div className="recipe-hero">
        {/* displays the recipe image */}

        <img
          src={recipeDetails.image}
          alt={recipeDetails.title}
          className="recipe-hero-image"
        />
        {/* displays the recipe title */}
        <h1 className="recipe-title">{recipeDetails.title}</h1>
      </div>

      <div className="view-actions">
        <button
          className="action-btn customize-btn"
          onClick={() =>
            // navigates the user to the customize route
            navigate(`/customize/${recipeDetails.id}`, {
              // passes the current recipe details object as state to the new route
              state: { recipe: recipeDetails },
            })
          }
        >
          ✏️ Customize
        </button>
      </div>

      <div className="recipe-section">
        <h2>ingredients</h2>
        <ul>
          {/* maps over the extendedingredients array (or an empty array if null) */}

          {(recipeDetails.extendedIngredients || []).map(
            (
              ingredient,
              index // displays the original string representation of the ingredient
            ) => (
              <li key={index}>{ingredient.original}</li>
            )
          )}
        </ul>
      </div>

      <div className="recipe-section">
        <h2>instructions</h2>
        <ol>
          {/* attempts to map over structured steps from analyzedinstructions */}

          {recipeDetails.analyzedInstructions?.[0]?.steps?.map((step) => (
            <li key={step.number}>{step.step}</li>
          )) || // fallback: if structured steps are missing, maps over the raw instructions text split by newlines
            recipeDetails.instructions
              ?.split("\n")
              .map((step, index) => <li key={index}>{step}</li>)}
        </ol>
      </div>
    </div>
  );
}

export default RandomRecipe;
