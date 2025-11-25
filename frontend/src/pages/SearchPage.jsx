import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import "../styles/Home.css";
import logo from "../assets/CClogo.png";

function SearchPage() {
  const navigate = useNavigate(); // hook to programmatically change the url/route
  const location = useLocation(); // hook to get the current url and search params
  const params = new URLSearchParams(location.search); // creates an object to easily read url query parameters
  const queryParam = params.get("query") || ""; // gets the 'query' value from the url, defaults to empty string
  const [query, setQuery] = useState(queryParam); // state for the search input value, initialized from the url
  // store results. use an array for loading/saving state
  const [results, setResults] = useState([]); // state to store the array of search results (recipes)
  // state to track saving status for individual recipes
  const [savingStatus, setSavingStatus] = useState({}); // state object to track if a specific recipe is currently being saved

  // effect to fetch search results from spoonacular
  useEffect(() => {
    if (!query) return; // don't fetch if the query is empty
    const fetchResults = async () => {
      try {
        const res = await axios.get(
          // initiates an api call to spoonacular's complex search endpoint
          `https://api.spoonacular.com/recipes/complexSearch?query=${query}&apiKey=${
            import.meta.env.VITE_SPOONACULAR_API_KEY
          }` // constructs the api url with the query and api key
        );
        setResults(res.data.results); // updates the results state with the fetched recipe array
      } catch (err) {
        console.error(err); // logs any error during the fetch
      }
    };
    fetchResults(); // calls the async function to start fetching
  }, [query]); // dependency array: this effect runs whenever the 'query' state changes

  // function to handle search submission
  const handleSearch = (e) => {
    e.preventDefault(); // prevents the default form submission behavior (page reload)
    if (query.trim()) {
      // checks if the query is not just empty space
      navigate(`/search?query=${encodeURIComponent(query)}`); // navigates to the search route, updating the url query param
    }
  };

  //  function to handle saving the recipe directly from the search results
  const handleSaveRecipe = async (recipe) => {
    // prevent action if already saving
    if (savingStatus[recipe.id]) return; // exits if the recipe is already in the saving process

    // set saving status to true for this recipe
    setSavingStatus((prev) => ({ ...prev, [recipe.id]: true })); // sets the specific recipe's saving status to true

    // 3. fetch full recipe details since complexSearch only gives title/image/id
    try {
      const apiKey = import.meta.env.VITE_SPOONACULAR_API_KEY; // gets the api key
      const fullRecipeRes = await axios.get(
        // initiates a second api call for full details
        `https://api.spoonacular.com/recipes/${recipe.id}/information?apiKey=${apiKey}` // constructs the url using the recipe id
      );
      const fullRecipeDetails = fullRecipeRes.data; // extracts the detailed recipe data

      // 4. map ingredients to the simple string array expected by your backend
      const originalIngredients = (fullRecipeDetails.extendedIngredients || [])
        .map((i) => i.original) // extracts the original text for each ingredient
        .filter(Boolean); // removes any null or undefined values

      const recipeData = {
        recipeId: String(fullRecipeDetails.id), // must be the numeric spoonacular id (converts id to string)
        title: fullRecipeDetails.title, // recipe title
        image: fullRecipeDetails.image, // recipe image url
        instructions: fullRecipeDetails.instructions || "", // instructions, defaults to empty string if missing
        originalIngredients: originalIngredients, // full list of original ingredients
        customIngredients: originalIngredients, // initializes custom ingredients with original ingredients
        substitutions: {}, // empty object for initial substitutions
      };

      // 5. post the recipe to your local backend
      await axios.post("http://localhost:5000/api/recipes", recipeData); // sends the prepared data to the local backend to save
      alert(`Recipe "${recipe.title}" saved successfully to your Cookbook!`); // shows success message
    } catch (error) {
      console.error("error saving recipe:", error); // logs the saving error
      alert(
        "failed to save recipe. it may already be in your cookbook or the API fetch failed." // shows user-friendly error message
      );
    } finally {
      // 6. set saving status back to false
      setSavingStatus((prev) => ({ ...prev, [recipe.id]: false })); // resets the saving status for this recipe
    }
  };

  return (
    // returns the jsx structure to be rendered
    <div className="home-container">
      <div className="logo-container">
        <img src={logo} alt="Ctrl + Cook Logo" className="logo" />{" "}
        {/* displays the logo */}
      </div>

      <form className="search-form" onSubmit={handleSearch}>
        {" "}
        {/* form element, submitting triggers handleSearch */}
        <input
          type="text"
          placeholder="Search Recipes..."
          className="search-input"
          value={query} // binds the input value to the 'query' state
          onChange={(e) => setQuery(e.target.value)} // updates the 'query' state on every input change
        />
        <button type="submit" className="btn">
          Search {/* the submit button */}
        </button>
      </form>

      <div className="results">
        {results.length === 0 && query ? <p>Searching...</p> : null}{" "}
        {/* shows "searching" if query is set but no results are loaded */}
        <ul className="results-list">
          {results.map(
            (
              recipe // maps over the search results to display each recipe
            ) => (
              <li
                key={recipe.id} // uses recipe id as a unique key for list rendering
                className="result-item"
              >
                <div
                  className="result-content"
                  onClick={() => navigate(`/recipe/${recipe.id}`)} //clicking this area navigates to the detail page
                >
                  {recipe.image && ( // checks if an image exists
                    <img
                      src={recipe.image}
                      alt={recipe.title}
                      className="result-img"
                    /> // displays the recipe image
                  )}
                  <span className="result-title">{recipe.title}</span>{" "}
                  {/* displays the recipe title */}
                </div>

                {/* SAVE BUTTON */}
                <button
                  className="btn save-btn"
                  onClick={(e) => {
                    // stop event from propagating to the parent <div> (which navigates)
                    e.stopPropagation(); // stops the click from triggering the navigation in the parent div
                    handleSaveRecipe(recipe); // calls the save function
                  }}
                  disabled={savingStatus[recipe.id]} // disables the button if the recipe is currently saving
                  style={{ marginLeft: "10px" }}
                >
                  {savingStatus[recipe.id] ? "Saving..." : "💾 Save"}{" "}
                  {/* displays 'saving...' or 'save' based on status */}
                </button>
              </li>
            )
          )}
        </ul>
        <div className="search-buttons">
          <button type="submit" className="btn">
            Search
          </button>
          <button
            type="button"
            className="btn"
            onClick={() => navigate("/random")}
          >
            I'm Feeling Lucky
          </button>
        </div>
      </div>
    </div>
  );
}

export default SearchPage;
