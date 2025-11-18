import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import {
  getCustomRecipes,
  deleteCustomRecipe,
} from "../services/recipeService"; // imported camelCase functions

function MyCookbook() {
  const user = useSelector((state) => state.auth.user); //retrieves the current user
  const [recipes, setRecipes] = useState([]); //hold the array of custom recipe
  const [message, setMessage] = useState(""); //user feedback fail to load

  // fetches all custom recipes from the backend for the logged-in user
  const fetchCustomRecipes = async () => {
    if (!user || !user.token) return;
    try {
      const data = await getCustomRecipes(user.token); //sends authenticated get request to the backend
      setRecipes(data); //replaces the current recipes array with new data
    } catch (error) {
      setMessage("failed to load recipes.");
      console.error(error);
    }
  };

  // handles the delete operation for a recipe
  const handleDeleteRecipe = async (recipeId) => {
    if (!user || !user.token) return;
    try {
      await deleteCustomRecipe(recipeId, user.token); // sends an authenticated delete request
      setMessage("recipe deleted successfully.");
      // refresh list
      fetchCustomRecipes();
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
    }
  }, [user]);

  if (!user) {
    return <h2>please log in to view MyCookBook.</h2>;
  }

  return (
    <div>
      <h2>my custom cookbook ({recipes.length} recipes)</h2>
      {message && <p style={{ color: "green" }}>{message}</p>}
      {recipes.length === 0 ? ( //checks if the recipe array is empty
        <p>you haven't saved any custom recipes yet.</p>
      ) : (
        recipes.map(
          (
            recipe //maps each recipe object to a div for display
          ) => (
            <div
              key={recipe._id}
              style={{
                border: "1px solid #ccc",
                margin: "10px",
                padding: "10px",
              }}
            >
              <h4>{recipe.title}</h4>
              <p>ingredients: {recipe.customIngredients.join(", ")}</p>
              <button
                style={{ marginRight: "10px" }}
                onClick={() => handleDeleteRecipe(recipe._id)}
              >
                delete
              </button>
              <Link to={`/editor/${recipe._id}`} state={{ recipe }}>
                edit
              </Link>
            </div>
          )
        )
      )}
    </div>
  );
}

export default MyCookbook;
