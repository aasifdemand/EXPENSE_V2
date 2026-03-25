import { configureStore } from "@reduxjs/toolkit"

import AuthReducer from "./authSlice"
import { apiSlice } from "./apiSlice"

// Import APIs to ensure they are injected
import "./expenseApi"
import "./budgetApi"
import "./departmentApi"
import "./reimbursementApi"
import "./authApi"

export const store = configureStore({
  reducer: {
    [apiSlice.reducerPath]: apiSlice.reducer,
    auth: AuthReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(apiSlice.middleware),
});