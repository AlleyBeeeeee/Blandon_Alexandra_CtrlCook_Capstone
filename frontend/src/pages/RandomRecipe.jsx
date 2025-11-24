import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/ViewRecipe.css";

function RandomRecipe() {
  const navigate = useNavigate();
  const [recipeDetails, setRecipeDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRandomRecipe = async () => {
      try {
        // Fetch a random recipe from Spoonacular
        const response = await axios.get(
          `https://api.spoonacular.com/recipes/random?number=1&apiKey=${
            import.meta.env.VITE_SPOONACULAR_API_KEY
          }`
        );
        setRecipeDetails(response.data.recipes[0]);
      } catch (error) {
        console.error("Error fetching random recipe:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRandomRecipe();
  }, []);

  if (loading) return <p>Loading random recipe...</p>;
  if (!recipeDetails) return <p>Failed to load recipe.</p>;

  return (
    <div className="cookbook-view-container">
      <div className="recipe-hero">
        <img
          src={recipeDetails.image}
          alt={recipeDetails.title}
          className="recipe-hero-image"
        />
        <h1 className="recipe-title">{recipeDetails.title}</h1>
      </div>

      <div className="view-actions">
        <button
          className="action-btn customize-btn"
          onClick={() =>
            navigate(`/customize/${recipeDetails.id}`, {
              state: { recipe: recipeDetails },
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
            (ingredient, index) => (
              <li key={index}>{ingredient.original}</li>
            )
          )}
        </ul>
      </div>

      <div className="recipe-section">
        <h2>Instructions</h2>
        <ol>
          {recipeDetails.analyzedInstructions?.[0]?.steps?.map((step) => (
            <li key={step.number}>{step.step}</li>
          )) ||
            recipeDetails.instructions
              ?.split("\n")
              .map((step, index) => <li key={index}>{step}</li>)}
        </ol>
      </div>
    </div>
  );
}

export default RandomRecipe;
