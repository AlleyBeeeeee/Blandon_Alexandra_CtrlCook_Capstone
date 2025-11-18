//API Integration (Authentication)

import axios from "axios";

const API_URL = "/api/users"; // base url for user authentication routes.

// REGISTER user
export const register = async (userData) => {
  // sends a post request to the registration endpoint (/api/users).
  const response = await axios.post(API_URL, userData);
  return response.data;
};

//  LOGIN user
export const login = async (userData) => {
  // sends a post request to the login endpoint (/api/users/login).
  const response = await axios.post(`${API_URL}/login`, userData);
  return response.data;
};
