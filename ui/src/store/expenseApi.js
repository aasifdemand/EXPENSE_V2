import { apiSlice } from "./apiSlice";

export const expenseApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getExpenses: builder.query({
      query: ({ page = 1, limit = 20, location = "OVERALL" }) => ({
        url: "/expenses",
        params: { page, limit, location },
      }),
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ id }) => ({ type: "Expense", id })),
              { type: "Expense", id: "LIST" },
            ]
          : [{ type: "Expense", id: "LIST" }],
    }),

    getAdminExpenses: builder.query({
      query: ({ page = 1, limit = 20 }) => ({
        url: "/expenses/admin",
        params: { page, limit },
      }),
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ id }) => ({ type: "Expense", id })),
              { type: "Expense", id: "ADMIN_LIST" },
            ]
          : [{ type: "Expense", id: "ADMIN_LIST" }],
    }),

    getUserExpenses: builder.query({
      query: ({ userId, page = 1, limit = 20 }) => ({
        url: `/expenses/user/${userId}`,
        params: { page, limit },
      }),
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ id }) => ({ type: "Expense", id })),
              { type: "Expense", id: "USER_LIST" },
            ]
          : [{ type: "Expense", id: "USER_LIST" }],
    }),

    searchExpenses: builder.query({
      query: (params) => ({
        url: "/expenses/search",
        params,
      }),
      providesTags: [{ type: "Expense", id: "SEARCH" }],
    }),

    addExpense: builder.mutation({
      query: (formData) => ({
        url: "/expenses/create",
        method: "POST",
        body: formData,
        // Optional: Custom header from hook if needed, 
        // but prepareHeaders already handles CSRF and x-username can be added here
      }),
      invalidatesTags: [
        { type: "Expense", id: "LIST" },
        { type: "Expense", id: "USER_LIST" },
        { type: "Budget", id: "LIST" }, // Budget changes when expense added
      ],
    }),

    updateExpense: builder.mutation({
      query: ({ id, updates }) => ({
        url: `/expenses/${id}`,
        method: "PATCH",
        body: updates,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Expense", id },
        { type: "Expense", id: "LIST" },
        { type: "Expense", id: "USER_LIST" },
      ],
    }),

    deleteExpense: builder.mutation({
      query: (id) => ({
        url: `/expenses/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [
        { type: "Expense", id: "LIST" },
        { type: "Expense", id: "USER_LIST" },
      ],
    }),
  }),
});

export const {
  useGetExpensesQuery,
  useGetAdminExpensesQuery,
  useGetUserExpensesQuery,
  useSearchExpensesQuery,
  useAddExpenseMutation,
  useUpdateExpenseMutation,
  useDeleteExpenseMutation,
} = expenseApi;
