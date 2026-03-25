import { apiSlice } from "./apiSlice";
import { forceLogout, setAuthState } from "./authSlice";

export const authApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    fetchSessionUser: builder.query({
      query: () => "/auth/session",
      providesTags: ["User"],
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data?.user) {
            dispatch(setAuthState({ user: data.user, isAuthenticated: true }));
          }
        } catch (err) {
          // If 401/403, the baseQuery or interceptor should handle logout, 
          // but we can be explicit here
          if (err.error?.status === 401 || err.error?.status === 403) {
            dispatch(forceLogout());
          }
        }
      },
    }),

    login: builder.mutation({
      query: (credentials) => ({
        url: "/auth/login",
        method: "POST",
        body: credentials,
      }),
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data?.user) {
            dispatch(
              setAuthState({
                isAuthenticated: data.user.authenticated,
                isTwoFactorPending: data.user.twoFactorPending,
                isTwoFactorVerified: data.user.twoFactorVerified,
                role: data.user.role,
                qr: data.qr,
              })
            );
          }
        } catch (err) {
          console.error("Login failed:", err);
        }
      },
    }),

    getCsrfToken: builder.query({
      query: () => "/auth/csrf-token",
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data?.csrfToken) {
            localStorage.setItem("csrf", data.csrfToken);
            dispatch(setAuthState({ csrf: data.csrfToken }));
          }
        } catch (err) {
          console.error("CSRF fetch failed:", err);
        }
      },
    }),

    logout: builder.mutation({
      query: () => ({
        url: "/auth/logout",
        method: "POST",
      }),
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          dispatch(forceLogout());
        } catch (err) {
          console.error("Logout failed:", err);
          dispatch(forceLogout()); // Force logout anyway on error
        }
      },
    }),

    getUsers: builder.query({
      query: ({ page = 1, limit = 10 } = {}) => ({
        url: "/auth/users",
        params: { page, limit },
      }),
      providesTags: (result) =>
        result?.users
          ? [
              ...result.users.map(({ id }) => ({ type: "User", id })),
              { type: "User", id: "LIST" },
            ]
          : [{ type: "User", id: "LIST" }],
    }),

    createUser: builder.mutation({
      query: (userData) => ({
        url: "/auth/users/create",
        method: "POST",
        body: userData,
      }),
      invalidatesTags: [{ type: "User", id: "LIST" }],
    }),

    resetPassword: builder.mutation({
      query: ({ userId, password }) => ({
        url: `/auth/reset/${userId}`,
        method: "PATCH",
        body: { password },
      }),
      invalidatesTags: (result, error, { userId }) => [{ type: "User", id: userId }],
    }),

    updateProfile: builder.mutation({
      query: ({ userId, ...updateData }) => ({
        url: `/auth/profile/${userId}`,
        method: "PATCH",
        body: updateData,
      }),
      invalidatesTags: (result, error, { userId }) => [
        { type: "User", id: userId },
        { type: "User", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useFetchSessionUserQuery,
  useLoginMutation,
  useGetCsrfTokenQuery,
  useLazyGetCsrfTokenQuery,
  useLogoutMutation,
  useGetUsersQuery,
  useCreateUserMutation,
  useResetPasswordMutation,
  useUpdateProfileMutation,
} = authApi;
