import { apiSlice } from "./apiSlice";

export const departmentApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getDepartments: builder.query({
      query: () => "/department/departments",
      transformResponse: (response) => response.departments || [],
      providesTags: (result) =>
        result && Array.isArray(result)
          ? [
              ...result.map(({ id }) => ({ type: "Department", id })),
              { type: "Department", id: "LIST" },
            ]
          : [{ type: "Department", id: "LIST" }],
    }),
    getSubDepartments: builder.query({
      query: (deptId) => `/department/${deptId}`,
      transformResponse: (response) => response.subDepartments || [],
      providesTags: (result) => 
        result && Array.isArray(result)
          ? [
              ...result.map(({ id }) => ({ type: "SubDepartment", id })),
              { type: "SubDepartment", id: "LIST" }
            ]
          : [{ type: "SubDepartment", id: "LIST" }],
    }),
    getAllSubDepartments: builder.query({
      query: () => "/department/sub-departments",
      transformResponse: (response) => response.subDepartments || [],
      providesTags: (result) => 
        result && Array.isArray(result)
          ? [
              ...result.map(({ id }) => ({ type: "SubDepartment", id })),
              { type: "SubDepartment", id: "LIST" }
            ]
          : [{ type: "SubDepartment", id: "LIST" }],
    }),
  }),
});

export const { 
  useGetDepartmentsQuery, 
  useGetSubDepartmentsQuery,
  useGetAllSubDepartmentsQuery
} = departmentApi;
