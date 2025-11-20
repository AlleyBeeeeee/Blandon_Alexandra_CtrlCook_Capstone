import axios from "axios";

// Base URL for custom and external recipe routes
const RECIPE_API_URL = "/api/recipes";

//  function to retrieve JWT token from local storage
const getToken = () => JSON.parse(localStorage.getItem("user"))?.token;

//  function to create authenticated request configuration
const getConfig = () => ({
  headers: {
    // attach JWT token for protected routes
    Authorization: `Bearer ${getToken()}`,
  },
});

// search external recipes (GET /api/recipes/search?query=...)
// hits backend controller then calls Spoonacular.
export const searchExternalRecipes = async (query) => {
  const response = await axios.get(`${RECIPE_API_URL}/search`, {
    params: { query },
  });
  return response.data;
};

//  external recipe details
//  hits backend controller then calls Spoonacular for details.
export const getExternalRecipeDetails = async (recipeId) => {
  const response = await axios.get(`${RECIPE_API_URL}/external/${recipeId}`);
  return response.data;
};

// create a custom recipe (POST /api/recipes)
export const createCustomRecipe = async (recipeData) => {
  const response = await axios.post(RECIPE_API_URL, recipeData, getConfig());
  return response.data;
};

// single custom recipe (GET /api/recipes/:id)
export const getCustomRecipeById = async (recipeId) => {
  const response = await axios.get(
    `${RECIPE_API_URL}/${recipeId}`,
    getConfig()
  );
  return response.data;
};

// all custom recipes for the loggedin user (GET /api/recipes)
export const getCustomRecipes = async () => {
  const response = await axios.get(RECIPE_API_URL, getConfig());
  return response.data;
};

// update custom recipe (PUT /api/recipes/:id)
export const updateCustomRecipe = async (recipeId, recipeData) => {
  const response = await axios.put(
    `${RECIPE_API_URL}/${recipeId}`,
    recipeData,
    getConfig()
  );
  return response.data;
};

// delete custom recipe (DELETE /api/recipes/:id)
export const deleteCustomRecipe = async (recipeId) => {
  const response = await axios.delete(
    `${RECIPE_API_URL}/${recipeId}`,
    getConfig()
  );
  return response.data;
};
