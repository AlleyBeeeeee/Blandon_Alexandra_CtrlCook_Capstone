//API Integration: Handles all client-server communication.
// formattinfg data/ making HTTP requests backend API endpoints

import axios from "axios";

export const searchRecipes = async (query) => {
  // search external recipes via wrapper
  const response = await axios.get(`/api/recipes/search?query=${query}`); // request to backend search
  return response.data; // returns recipe array results
};
