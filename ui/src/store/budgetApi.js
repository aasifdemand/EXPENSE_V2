import { apiSlice } from "./apiSlice";

export const budgetApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getBudgets: builder.query({
      query: ({ userId, page = 1, limit = 5, month = "", year = "", company = "", location = "OVERALL" }) => ({
        url: "/budget",
        params: { userId, page, limit, month, year, company, location },
      }),
      providesTags: (result) =>
        result?.data
          ? [
            ...result.data.map(({ id }) => ({ type: "Budget", id })),
            { type: "Budget", id: "LIST" },
          ]
          : [{ type: "Budget", id: "LIST" }],
    }),

    getUserBudgets: builder.query({
      query: ({ userId, page = 1, limit = 5 }) => ({
        url: `/budget/user/${userId}`,
        params: { page, limit },
      }),
      providesTags: (result) =>
        result?.data
          ? [
            ...result.data.map(({ id }) => ({ type: "Budget", id })),
            { type: "Budget", id: "USER_LIST" },
          ]
          : [{ type: "Budget", id: "USER_LIST" }],
    }),

    searchBudgets: builder.query({
      query: (params) => ({
        url: "/budget/search",
        params: {
          ...params,
          page: params.page || 1,
          limit: params.limit || 10,
          location: params.location || "OVERALL",
        },
      }),
      providesTags: [{ type: "Budget", id: "SEARCH" }],
    }),

    allocateBudget: builder.mutation({
      query: (budgetData) => ({
        url: "/budget/allocate",
        method: "POST",
        body: budgetData,
      }),
      invalidatesTags: [
        { type: "Budget", id: "LIST" },
        { type: "Budget", id: "USER_LIST" },
        { type: "Expense", id: "LIST" }, // Allocating budget might affect expense metrics
      ],
    }),

    updateBudget: builder.mutation({
      query: ({ id, updates }) => ({
        url: `/budget/${id}`,
        method: "PATCH",
        body: updates,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Budget", id },
        { type: "Budget", id: "LIST" },
        { type: "Budget", id: "USER_LIST" },
      ],
    }),

    deleteBudget: builder.mutation({
      query: (id) => ({
        url: `/budget/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [
        { type: "Budget", id: "LIST" },
        { type: "Budget", id: "USER_LIST" },
      ],
    }),
  }),
});

export const {
  useGetBudgetsQuery,
  useGetUserBudgetsQuery,
  useSearchBudgetsQuery,
  useAllocateBudgetMutation,
  useUpdateBudgetMutation,
  useDeleteBudgetMutation,
} = budgetApi;
