import { useState } from "react";
import { searchExternalRecipes } from "../services/recipeService";
import { Link } from "react-router-dom";

const SearchView = () => {
  const [query, setQuery] = useState("");
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    setError(null);
    if (!query) {
      setError("Please enter a search query.");
      return;
    }

    setLoading(true);
    try {
      // call the search api for summary results
      const results = await searchExternalRecipes(query);
      setRecipes(results);
      if (results.length === 0) {
        setError("No recipes found. Try a different query.");
      }
    } catch (err) {
      console.error("Search failed:", err);
      setError("Failed to fetch recipes. Check your API key and connection.");
      setRecipes([]);
    }
    setLoading(false);
  };

  return (
    <div className="container">
      <h2 className="text-3xl font-bold text-teal-600 mb-6">
        Search External Recipes
      </h2>

      {/* 🎯 Use the new 'search-form' class */}
      <form onSubmit={handleSearch} className="search-form">
        <input
          type="text"
          placeholder="search for ingredients or dishes"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button type="submit" disabled={loading}>
          {loading ? "searching..." : "search"}
        </button>
      </form>

      {error && <p className="error-message">{error}</p>}

      {/* The existing recipe-card and search-results classes will handle this section */}
      {!loading && recipes.length > 0 && (
        <div className="search-results">
          {recipes.map((recipe) => (
            <div key={recipe.id} className="recipe-card">
              {/* FIX: Add image check before rendering */}
              {recipe.image && (
                <img
                  src={recipe.image}
                  alt={recipe.title}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src =
                      "https://placehold.co/312x231/e0f2f1/004d40?text=No+Image";
                  }}
                />
              )}

              <h4>{recipe.title}</h4>

              <Link
                to={`/editor/new`}
                state={{
                  originalId: recipe.id,
                  recipe: recipe, // Pass the simplified recipe object
                }}
              >
                customize and save
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchView;
