import { useState, useEffect, useMemo } from "react";
import { useSelector } from "react-redux";
import {
  useGetExpensesQuery,
  useGetAdminExpensesQuery,
  useGetUserExpensesQuery,
  useSearchExpensesQuery,
  useAddExpenseMutation,
  useUpdateExpenseMutation,
  useDeleteExpenseMutation,
} from "../store/expenseApi";
import { useGetDepartmentsQuery, useGetSubDepartmentsQuery } from "../store/departmentApi";
import { getMonthByNumber } from "../utils/get-month";
import { useNavigate } from "react-router-dom";
import { useToastMessage } from "./useToast";
import { useLocation } from "../contexts/LocationContext";

export const useExpenses = (externalParams = {}) => {
  const { user, users } = useSelector((state) => state.auth);
  const { currentLoc } = useLocation();

  // RTK Query for departments
  const { data: deptData } = useGetDepartmentsQuery();
  const departments = deptData || [];
  
  const [currentDepartment, setCurrentDepartment] = useState(null);
  const [currentSubDepartment, setCurrentSubDepartment] = useState(null);

  const { data: subDeptData } = useGetSubDepartmentsQuery(currentDepartment?.id, { skip: !currentDepartment?.id });
  const subDepartments = subDeptData || [];


  const year = new Date().getFullYear();
  const currentMonth = new Date().toLocaleString("default", { month: "long" });

  // Internal pagination fallback
  const [internalPage, setInternalPage] = useState(1);
  const [internalLimit, setInternalLimit] = useState(10);
  
  const page = externalParams.page || internalPage;
  const limit = externalParams.limit || internalLimit;
  const setPage = externalParams.setPage || setInternalPage;
  const setLimit = externalParams.setLimit || setInternalLimit;

  const [search, setSearch] = useState("");
  const [filterMonth, setFilterMonth] = useState("");
  const [filterYear, setFilterYear] = useState("");

  const [open, setOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [formData, setFormData] = useState({
    userId: "",
    amount: 0,
    month: currentMonth,
    year,
    department: "",
    subDepartment: "",
  });

  // Debounce search
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(search), 500);
    return () => clearTimeout(handler);
  }, [search]);

  const hasFilters = useMemo(() => {
    return !!(debouncedSearch?.trim() || filterMonth || filterYear || currentDepartment?.id || currentSubDepartment?.id);
  }, [debouncedSearch, filterMonth, filterYear, currentDepartment, currentSubDepartment]);

  // Role and Admin checks
  const role = user?.role;
  const isAdmin = role === "superadmin";

  // Queries
  
  // 1. User Claims (Global or Location-filtered)
  const getExpensesQuery = useGetExpensesQuery(
    { page, limit, location: currentLoc },
    { skip: !isAdmin || hasFilters }
  );

  // 2. Company Spends (Admin-only separate list)
  const adminExpensesQuery = useGetAdminExpensesQuery(
    { page: externalParams.adminPage || 1, limit: externalParams.adminLimit || 100 },
    { skip: !isAdmin }
  );

  // 3. User Personal Expenses
  const userExpensesQuery = useGetUserExpensesQuery(
    { userId: user?.id, page, limit },
    { skip: isAdmin || !user?.id }
  );

  // 4. Search Results
  const searchQuery = useSearchExpensesQuery(
    {
      userName: debouncedSearch?.trim() || undefined,
      month: filterMonth || undefined,
      year: filterYear || undefined,
      department: currentDepartment?.id || undefined,
      subDepartment: currentSubDepartment?.id || undefined,
      page,
      limit,
      location: currentLoc,
    },
    { skip: !isAdmin || !hasFilters }
  );

  // Logic to determine main data feed for tables
  const mainQueryResult = hasFilters 
    ? searchQuery 
    : (isAdmin && !externalParams.forceUser ? getExpensesQuery : userExpensesQuery);
  
  const expenses = useMemo(() => mainQueryResult.data?.data || [], [mainQueryResult.data?.data]);
  const meta = useMemo(() => mainQueryResult.data?.meta || { total: 0, page, limit }, [mainQueryResult.data?.meta, page, limit]);
  const stats = useMemo(() => mainQueryResult.data?.stats || { totalSpent: 0, totalFromAllocation: 0, totalFromReimbursement: 0 }, [mainQueryResult.data?.stats]);
  const loading = mainQueryResult.isLoading || mainQueryResult.isFetching || adminExpensesQuery.isFetching;


  // Mutations
  const [addExpenseTrigger] = useAddExpenseMutation();
  const [updateExpenseTrigger] = useUpdateExpenseMutation();
  const [deleteExpenseTrigger] = useDeleteExpenseMutation();

  const navigate = useNavigate();
  const { success, error } = useToastMessage();

  const handleOpen = (row) => {
    setSelectedExpense({ name: user?.name, ...row });
    setFormData({
      userId: row.user?.id,
      amount: row.amount,
      month: row.month,
      year: row.year,
      department: row.department?.id || "",
      subDepartment: row.subDepartment?.id || "",
    });
    setOpen(true);
  };

  const handleClose = () => setOpen(false);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });


  const handleAdd = async () => {
    try {
      await addExpenseTrigger(formData).unwrap();
      
      setFormData({
        userId: "",
        amount: "",
        month: currentMonth,
        year,
        department: "",
        subDepartment: "",
      });

      success("Expense added successfully");
      if (role !== 'superadmin') {
         setTimeout(() => navigate("/user/expenses"), 2000);
      }
    } catch (err) {
      error(err?.data?.message || "Something went wrong, please try again later");
    }
  };

  const handleSubmit = async () => {
    if (!selectedExpense) return;
    try {
      await updateExpenseTrigger({ id: selectedExpense.id, updates: formData }).unwrap();
      setOpen(false);
      success("Expense updated successfully");
    } catch (err) {
      error(err?.data?.message || "Failed to update expense");
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteExpenseTrigger(id).unwrap();
      success("Expense deleted successfully");
    } catch (err) {
      error(err?.data?.message || "Failed to delete expense");
    }
  };


  return {
    departments,
    subDepartments,
    currentDepartment,
    setCurrentDepartment,
    currentSubDepartment,
    setCurrentSubDepartment,

    expenses,
    allExpenses: useMemo(() => mainQueryResult.data?.allExpenses || [], [mainQueryResult.data?.allExpenses]),
    stats,
    meta,
    
    // ✅ ADMIN SPECIFIC
    adminExpenses: adminExpensesQuery.data?.data || [],
    adminStats: adminExpensesQuery.data?.stats || { totalSpent: 0 },
    adminMeta: adminExpensesQuery.data?.meta || { total: 0, page: 1, limit: 100 },

    loading,
    users,
    year,
    currentMonth,
    page,
    setPage,
    limit,
    setLimit,
    formData,
    setFormData,
    handleChange,
    open,
    handleOpen,
    handleClose,
    selectedExpense,
    setSelectedExpense,
    handleAdd,
    handleSubmit,
    handleDelete,
    search,
    setSearch,
    filterMonth,
    setFilterMonth,
    filterYear,
    setFilterYear,
    getMonthByNumber,
    currentLocation: currentLoc,
  };
};
