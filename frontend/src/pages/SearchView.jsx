import { useState } from "react";
import { searchExternalRecipes } from "../services/recipeService";
import { Link } from "react-router-dom";

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
      const results = await searchExternalRecipes(query);
      setRecipes(results);
    } catch (error) {
      console.error("search failed:", error);
      alert("failed to fetch recipes from external source.");
    }
    setLoading(false);
  };

  return (
    <div>
      <h2>Recipe Search</h2>

      {/* 🎯 Use the new 'search-form' class */}
      <form onSubmit={handleSearch} className="search-form">
        <input
          type="text"
          placeholder="Search for ingredients or dishes..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button type="submit" disabled={loading}>
          {loading ? "Searching..." : "Search"}
        </button>
      </form>

      {/* The existing recipe-card and search-results classes will handle this section */}
      <div className="search-results">
        {recipes.map((recipe) => (
          <div key={recipe.id} className="recipe-card">
            {recipe.image && <img src={recipe.image} alt={recipe.title} />}

            <h4>{recipe.title}</h4>

            <Link
              to={`/editor/${recipe.id}`}
              state={{
                originalId: recipe.id,
              }}
            >
              customize and save
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SearchView;
