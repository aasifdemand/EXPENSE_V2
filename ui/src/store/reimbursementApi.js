import { apiSlice } from "./apiSlice";

export const reimbursementApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getReimbursements: builder.query({
      query: ({ location = "OVERALL", status, page = 1, limit = 20 }) => ({
        url: "/reimbursement",
        params: { location, status, page, limit },
      }),
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ id }) => ({ type: "Reimbursement", id })),
              { type: "Reimbursement", id: "LIST" },
            ]
          : [{ type: "Reimbursement", id: "LIST" }],
    }),

    getUserReimbursements: builder.query({
      query: ({ userId, location = "OVERALL", page = 1, limit = 20 }) => ({
        url: `/reimbursement/${userId}`,
        params: { location, page, limit },
      }),
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ id }) => ({ type: "Reimbursement", id })),
              { type: "Reimbursement", id: "USER_LIST" },
            ]
          : [{ type: "Reimbursement", id: "USER_LIST" }],
    }),

    markReimbursed: builder.mutation({
      query: ({ id, isReimbursed }) => ({
        url: `/reimbursement/admin/${id}`,
        method: "PATCH",
        body: { isReimbursed },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Reimbursement", id },
        { type: "Reimbursement", id: "LIST" },
        { type: "Reimbursement", id: "USER_LIST" },
        { type: "Expense", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetReimbursementsQuery,
  useGetUserReimbursementsQuery,
  useMarkReimbursedMutation,
} = reimbursementApi;
