import { createSlice } from "@reduxjs/toolkit";

// Load from localStorage if available
const storedUser = localStorage.getItem("username");

const initialState = {
  username: storedUser || null,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    login: (state, action) => {
      state.username = action.payload;
      localStorage.setItem("username", action.payload);
    },
    logout: (state) => {
      state.username = null;
      localStorage.removeItem("username");
    },
  },
});

export const { login, logout } = userSlice.actions;
export default userSlice.reducer;
