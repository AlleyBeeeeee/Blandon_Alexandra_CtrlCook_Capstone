import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom"; // 🎯 CRITICAL FIX: Ensure Link is imported
import {
  getCustomRecipes,
  deleteCustomRecipe,
} from "../services/recipeService";

function MyCookbook() {
  const user = useSelector((state) => state.auth.user);
  const [recipes, setRecipes] = useState([]);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // fetches all custom recipes from the backend for the logged-in user
  const fetchCustomRecipes = async () => {
    if (!user || !user.token) {
      setRecipes([]);
      setIsLoading(false);
      return;
    }
    try {
      setIsLoading(true);
      const data = await getCustomRecipes(); // Fetches all custom recipes for the logged-in user
      setRecipes(data);
    } catch (error) {
      setMessage("failed to load recipes.");
      console.error(error);
      setRecipes([]);
    } finally {
      setIsLoading(false);
    }
  };

  // handles the delete operation for a recipe
  const handleDeleteRecipe = async (recipeId) => {
    if (!user || !user.token) return;
    if (!window.confirm("Are you sure you want to delete this custom recipe?"))
      return;

    try {
      await deleteCustomRecipe(recipeId); // Sends an authenticated delete request
      setMessage("recipe deleted successfully.");
      fetchCustomRecipes(); // Refresh list
    } catch (err) {
      setMessage("error deleting recipe.");
      console.error(err);
    }
  };

  // fetches recipes when user changes
  useEffect(() => {
    if (user) {
      fetchCustomRecipes();
    } else {
      setRecipes([]); // clear recipes on logout
      setIsLoading(false);
    }
  }, [user]);

  if (!user) {
    return <h2 className="text-xl mt-8">Please log in to view MyCookBook.</h2>;
  }

  if (isLoading) {
    return <h2 className="text-xl mt-8">Loading your cookbook...</h2>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6 mt-10">
      <h2 className="text-3xl font-bold text-teal-600 mb-6">
        My Custom Cookbook ({recipes.length} recipes)
      </h2>
      {message && <p className="text-green-600 mb-4">{message}</p>}

      {recipes.length === 0 ? (
        <p>You haven't saved any custom recipes yet.</p>
      ) : (
        <div className="cookbook-list">
          {recipes.map((recipe) => (
            <div key={recipe._id} className="recipe-card">
              <img src={`/path/to/placeholder/image.jpg`} alt={recipe.title} /> 
              <h4>{recipe.title}</h4>
              <p>
                {recipe.customIngredients
                  .map((ing) => `${ing.quantity || ""} ${ing.name}`.trim())
                  .join(", ")}
              </p>
              <div className="card-actions">
                <Link to={`/editor/${recipe._id}`}>View / Edit</Link>
                <button onClick={() => handleDeleteRecipe(recipe._id)}>
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MyCookbook;
