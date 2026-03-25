import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_BASEURL,
    prepareHeaders: (headers, { getState }) => {
      // Extract CSRF token from auth state
      const token = getState().auth.csrf;
      if (token) {
        headers.set("x-csrf-token", token);
      }
      
      // For FormData (proof uploads), we must let the browser set the boundary
      // fetchBaseQuery handles this automatically if body is FormData
      
      return headers;
    },
    // Ensure cookies are sent with every request
    credentials: "include",
  }),
  tagTypes: ["Expense", "Budget", "Reimbursement", "User"],
  endpoints: () => ({}),
});
