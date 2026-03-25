import { configureStore } from "@reduxjs/toolkit"

import AuthReducer from "./authSlice"
import budgetReducer from "./budgetSlice"
import expenseReducer from "./expenseSlice"
import departmentReducer from "./departmentSlice"
import reimbursementReducer from "./reimbursementSlice"
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
    budget: budgetReducer,
    expense: expenseReducer,
    department: departmentReducer,
    reimbursement: reimbursementReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(apiSlice.middleware),
});