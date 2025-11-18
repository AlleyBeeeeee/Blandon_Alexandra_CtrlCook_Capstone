//API Integration: Handles all client-server communication.
// formattinfg data/ making HTTP requests backend API endpoints

import axios from "axios";

export const searchRecipes = async (query) => {
  // search external recipes via wrapper
  const response = await axios.get(`/api/recipes/search?query=${query}`); // request to backend search
  return response.data; // returns recipe array results
};

//CRUD Ops

// create
export const saveCustomRecipe = async (recipeData, token) => {
  //save custome recipes
  const config = { headers: { authorization: `bearer ${token}` } }; //jwt token reuqest  for auth
  const response = await axios.post("/api/recipes", recipeData, config);
  return response.data; //returns created recipe objet
};
// R  function to fetch all custom recipes for the logged-in user
export const getCustomRecipes = async (token) => {
  const config = { headers: { authorization: `bearer ${token}` } };
  const response = await axios.get("/api/recipes", config);
  return response.data;
};
// read
export const getCustomRecipeById = async (recipeId, token) => {
  const config = { headers: { authorization: `bearer ${token}` } };
  // sends GET request to recipe id endpoint
  const response = await axios.get(`/api/recipes/${recipeId}`, config);
  return response.data; // returns the single recipe object.
};

//update
export const updateCustomRecipe = async (recipeId, updateData, token) => {
  //updates existing custom recipe
  const config = { headers: { authorization: `bearer ${token}` } }; //jwt token for protected route
  const response = await axios.put(
    //sends put request recipe id endpoint
    `/api/recipes/${recipe_id}`,
    update_data,
    config
  );
  return response.data; // returns the updated recipe
};

// delete
export const deleteCustomRecipe = async (recipeId, token) => {
  // fuction to delete recipe
  const config = { headers: { authorization: `bearer ${token}` } }; // jwt token for protected route
  const response = await axios.delete(`/api/recipes/${recipeId}`, config); //delete request to endpoint, checks if the user is owner before delete
  return response.data; // returns a success message
};
