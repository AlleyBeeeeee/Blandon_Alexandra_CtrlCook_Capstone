import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/MyCookBook.css";

function MyCookBook() {
  const [savedRecipes, setSavedRecipes] = useState([]); // state for holding fetched recipes
  const [isLoading, setIsLoading] = useState(true); // state to manage loading status
  const [fetchError, setFetchError] = useState(""); // state for holding error messages
  const navigate = useNavigate(); // hook for programmatic navigation

  useEffect(() => {
    // runs once on mount to fetch saved recipes from the local backend
    const fetchRecipes = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/recipes"); // fetches saved recipes
        setSavedRecipes(response.data); // updates state with recipe data
      } catch (error) {
        console.error(error); // logs the error
        setFetchError("failed to load recipes."); // sets user-facing error message
      } finally {
        setIsLoading(false); // hides loading indicator regardless of success/failure
      }
    };
    fetchRecipes();
  }, []); // empty dependency array means it runs only on mount

  const handleDeleteRecipe = async (recipeId) => {
    if (!window.confirm("are you sure you want to delete this recipe?")) return; // confirmation check

    try {
      await axios.delete(`http://localhost:5000/api/recipes/${recipeId}`); // sends delete request using local _id
      // updates the local state by filtering out the deleted recipe
      setSavedRecipes(savedRecipes.filter((recipe) => recipe._id !== recipeId));
    } catch (error) {
      console.error(error);
      alert("failed to delete recipe."); // alerts user of failure
    }
  };

  const handleCustomizeRecipe = (recipe) => {
    navigate("/customize", { state: { recipe } }); // navigates and passes the recipe data in state
  };

  if (isLoading) return <p>loading recipes...</p>; // display loading status
  if (fetchError) return <p>{fetchError}</p>; // display error message

  return (
    // renders the cookbook view
    <div className="mycookbook-container">
      <h2>my cookbook</h2>
      {savedRecipes.length === 0 ? (
        // empty state: displays if no recipes are saved
        <div className="empty-state">
          <p>no saved recipes yet.</p>
          <Link to="/search" className="btn search-link-btn">
            🔎 search recipes
          </Link>
        </div>
      ) : (
        // recipe grid: displays saved recipes
        <div className="recipe-grid">
          {savedRecipes.map((recipe) => (
            <div key={recipe._id} className="recipe-card">
              {recipe.image && (
                <img
                  src={recipe.image}
                  alt={recipe.title}
                  className="recipe-img"
                />
              )}
              <h3>{recipe.title}</h3>
              <div className="recipe-card-buttons">
                <Link
                  to={`/recipe/${recipe.recipeId}`}
                  state={{ recipe }}
                  className="btn view-btn"
                >
                  view
                </Link>

                <button
                  onClick={() => handleCustomizeRecipe(recipe)}
                  className="btn customize-btn"
                >
                  ✏️ customize
                </button>
                <button
                  onClick={() => handleDeleteRecipe(recipe._id)}
                  className="btn delete-btn"
                >
                  🗑️ delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MyCookBook;
