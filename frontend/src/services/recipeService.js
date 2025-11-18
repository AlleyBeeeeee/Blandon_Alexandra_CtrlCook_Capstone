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

// read
export const getCustomRecipe = async (token) => {
  //fetch custom recipes for user
  const config = { headers: { authorization: `bearer ${token}` } }; //jwt token for protected route
  const response = await axios.get("/api/recipes", config); //get request for user data
  return response.data; //array of custom recipes
};
