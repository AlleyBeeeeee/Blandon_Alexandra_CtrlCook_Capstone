import React, { useState } from "react";
import { searchRecipes } from "../services/recipeService";
import { Link } from "react-router-dom"; // import link for navigation

const SearchView = () => {
  const [query, setQuery] = useState("");
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query) return;

    setLoading(true);
    try {
      // call the search api for summary results
      const results = await searchRecipes(query);
      setRecipes(results);
    } catch (error) {
      console.error("search failed:", error);
      alert("failed to fetch recipes from external source.");
    }
    setLoading(false);
  };

  return (
    <div>
      <h2>recipe search</h2>
      <form onSubmit={handleSearch}>
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

      <div className="search-results">
        {recipes.map((recipe) => (
          <div key={recipe.id} className="recipe-card">
            <h4>{recipe.title}</h4>
            {/* link to the editor view, passing the external id in the url and state */}
            {/* the editor will use this id to fetch the full details */}
            <Link
              to={`/editor/${recipe.id}`}
              state={{
                originalId: recipe.id, // pass the spoonacular id via state
              }}
            >
              customize and save
            </Link>
          </div>
        ))}
        {recipes.length === 0 && !loading && query && (
          <p>no results found for "{query}".</p>
        )}
      </div>
    </div>
  );
};

export default SearchView;
