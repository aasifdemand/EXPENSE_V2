import { apiSlice } from "./apiSlice";

export const departmentApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getDepartments: builder.query({
      query: () => "/department/departments",
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "Department", id })),
              { type: "Department", id: "LIST" },
            ]
          : [{ type: "Department", id: "LIST" }],
    }),
    getSubDepartments: builder.query({
      query: (deptId) => `/department/${deptId}`,
      providesTags: (result) => 
        result 
          ? [
              ...result.map(({ id }) => ({ type: "SubDepartment", id })),
              { type: "SubDepartment", id: "LIST" }
            ]
          : [{ type: "SubDepartment", id: "LIST" }],
    }),
    getDepartmentById: builder.query({
      query: (id) => `/department/${id}`,
      providesTags: (result, _, id) => [{ type: "Department", id }],
    }),
  }),
});

export const { 
  useGetDepartmentsQuery, 
  useGetSubDepartmentsQuery,
  useGetDepartmentByIdQuery 
} = departmentApi;
