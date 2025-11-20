//User Authentication (Client): Manages local user state and JWT.
// Redux slice manages the application's user state, handles successful login/logout, tracks the authenticated status, manages storing/retrieving the user object from local storage.

import { createSlice } from "@reduxjs/toolkit";

// attempts to load user data from local storage on initial load
const user = JSON.parse(localStorage.getItem("user"));

const auth_slice = createSlice({
  name: "auth",
  initialState: {
    user: user || null,
    isAuthenticated: !!user, // boolean flag for quick auth check
    isLoading: false,
    error: null,
  },
  reducers: {
    loginSuccess: (state, action) => {
      // Renamed from login_success for consistency
      state.user = action.payload;
      state.is_authenticated = true;
      localStorage.setItem("user", JSON.stringify(action.payload)); // saves user/token locally
    },
    logout: (state) => {
      state.user = null;
      state.is_authenticated = false;
      localStorage.removeItem("user"); // removes user/token on logout
    },
  },
});

export const { loginSuccess, logout } = auth_slice.actions; // Exporting loginSuccess
export default auth_slice.reducer;
