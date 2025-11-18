import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { searchRecipes } from "../services/recipeService";

function SearchView() {
  const [searchTerm, setSearchTerm] = useState(""); // state for user input
  const [results, setResults] = useState([]); // state for search results
  const navigate = useNavigate();

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchTerm) return;
    try {
      const data = await searchRecipes(searchTerm); // calling the api service
      setResults(data);
    } catch (error) {
      console.error("search failed:", error);
      setResults([]);
    }
  };

  return (
    <div>
      <h2>find recipes from the web</h2>
      <form onSubmit={handleSearch}>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="e.g., pasta, chicken, vegan"
        />
        <button type="submit">search</button>
      </form>

      <h3>results:</h3>
      {results.map((recipe) => (
        // map over results and display each recipe card
        <div
          key={recipe.id}
          style={{ border: "1px solid #ccc", margin: "10px", padding: "10px" }}
        >
          <h4>{recipe.title}</h4>
          <button
            // navigate to the editor, passing the api recipe data in the state object
            onClick={() =>
              navigate(`/editor/${recipe.id}`, { state: { recipe } })
            }
          >
            customize and save
          </button>
        </div>
      ))}
    </div>
  );
}

export default SearchView;
