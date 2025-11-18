//Redux Setup: Centralizes state management configuration
//file configures the central Redux Store, combining all application state slices into a single object

import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice.js";

export const store = configureStore({
  // configures / exports central redux store
  reducer: {
    auth: authReducer, // assigns the authreducer to 'auth' key in store state
  },
});
