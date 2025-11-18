//User Authentication (Client): Manages local user state and JWT.
// Redux slice manages the application's user state, handles successful login/logout, tracks the authenticated status, manages storing/retrieving the user object from local storage.

import { createSlice } from "@reduxjs/toolkit";

const user = JSON.parse(localStorage.getItem("user"));

const authSlice = createSlice({
  name: "auth", //give name to slice/used as key in store
  initialState: {
    user: user || null, //stores user object or null if not logged in
    isAuthenticated: !!user, //boolean flag - true if user exists
    isLoading: false, // state for api request loading
    error: null, //state for authentication erros
  },

  reducers: {
    // reducer for successful login or registration
    loginSuccess: (state, action) => {
      state.user = action.payload; // sets user state with data
      state.isAuthenticated = true; //sets flag to true
      localStorage.setItem("user", JSON.stringify(action.payload));
    },
    logout: (state) => {
      state.user = null; //clears use obj in the state
      state.isAuthenticated = false; // sets flag
      localStorage.removeItem("user"); //removes user data from local storage
    },
  },
});

export const { loginSuccess, logout } = authSlice.actions; //actions for use in components
export default authSlice.reducer; //reducer function to be combined in the store
