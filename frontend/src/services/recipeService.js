import axios from "axios";

// function to search external recipes (summary)
export const searchRecipes = async (query) => {
  const response = await axios.get(`/api/recipes/search?query=${query}`);
  return response.data;
};

// function to fetch full details of a non-saved recipe from the external api wrapper
export const getExternalRecipeDetails = async (recipeId) => {
  const response = await axios.get(`/api/recipes/external/${recipeId}`);
  return response.data; // returns the formatted recipe object
};

// c - create: function to save a custom recipe.
export const saveCustomRecipe = async (recipeData, token) => {
  const config = { headers: { authorization: `bearer ${token}` } };
  const response = await axios.post("/api/recipes", recipeData, config);
  return response.data;
};

// r - read all: function to fetch all custom recipes for the logged-in user.
export const getCustomRecipes = async (token) => {
  const config = { headers: { authorization: `bearer ${token}` } };
  const response = await axios.get("/api/recipes", config);
  return response.data;
};

// r - read single: function to fetch a single custom recipe by its mongodb id.
export const getCustomRecipeById = async (recipeId, token) => {
  const config = { headers: { authorization: `bearer ${token}` } };
  const response = await axios.get(`/api/recipes/${recipeId}`, config);
  return response.data;
};

// u - update: function to update an existing custom recipe.
export const updateCustomRecipe = async (recipeId, updateData, token) => {
  const config = { headers: { authorization: `bearer ${token}` } };
  const response = await axios.put(
    `/api/recipes/${recipeId}`,
    updateData,
    config
  );
  return response.data;
};

// d - delete: function to delete a custom recipe.
export const deleteCustomRecipe = async (recipeId, token) => {
  const config = { headers: { authorization: `bearer ${token}` } };
  const response = await axios.delete(`/api/recipes/${recipeId}`, config);
  return response.data;
};
