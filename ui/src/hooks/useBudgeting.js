import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { getMonthByNumber } from "../utils/get-month";
import { useLocation } from "../contexts/LocationContext";
import {
  useGetBudgetsQuery,
  useGetUserBudgetsQuery,
  useSearchBudgetsQuery,
  useAllocateBudgetMutation,
  useUpdateBudgetMutation,
} from "../store/budgetApi";

export const useBudgeting = () => {
  const { user } = useSelector((state) => state?.auth);
  const { currentLoc } = useLocation();

  const year = new Date().getFullYear();
  const currentMonth = new Date().toLocaleString("default", { month: "long" });
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const [formData, setFormData] = useState({
    userId: "",
    amount: 0,
    month: currentMonth,
    year,
    company: "",
  });

  const [open, setOpen] = useState(false);
  const [selectedBudget, setSelectedBudget] = useState(null);

  const [search, setSearch] = useState("");
  const [filterMonth, setFilterMonth] = useState("");
  const [filterYear, setFilterYear] = useState("");

  const [debouncedSearch, setDebouncedSearch] = useState(search);

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);
    return () => clearTimeout(handler);
  }, [search]);

  // Determine which query to run
  const isFiltering = !!debouncedSearch?.trim() || !!filterMonth || !!filterYear;

  // 1. Search Query
  const { data: searchData, isFetching: searchLoading } = useSearchBudgetsQuery(
    {
      userName: debouncedSearch || undefined,
      month: filterMonth || undefined,
      year: filterYear || undefined,
      page,
      limit,
      location: currentLoc,
    },
    { skip: !isFiltering }
  );

  // 2. Admin List Query
  const { data: adminListData, isFetching: adminLoading } = useGetBudgetsQuery(
    {
      page,
      limit,
      location: currentLoc,
    },
    { skip: isFiltering || user?.role !== "superadmin" }
  );

  // 3. User List Query
  const { data: userListData, isFetching: userLoading } = useGetUserBudgetsQuery(
    {
      userId: user?.id,
      page,
      limit,
    },
    { skip: isFiltering || user?.role === "superadmin" || !user?.id }
  );

  // Consolidate Data
  const currentResult = isFiltering
    ? searchData
    : user?.role === "superadmin"
      ? adminListData
      : userListData;

  const budgets = currentResult?.data || currentResult?.budgets || [];
  const meta = currentResult?.meta || { total: 0, page, limit };
  const stats = currentResult?.stats || { totalAllocated: 0, totalSpent: 0 };
  const loading = searchLoading || adminLoading || userLoading;

  // Mutations
  const [allocateBudgetTrigger] = useAllocateBudgetMutation();
  const [updateBudgetTrigger] = useUpdateBudgetMutation();

  // Handle Reset to first page
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, filterMonth, filterYear, currentLoc]);

  const handleOpen = (row) => {
    setSelectedBudget(row);
    setFormData({
      userId: row?.user?.id || row?.user || "",
      amount: row.allocatedAmount || 0,
      month: row.month,
      year: row.year,
      company: row?.company || "",
    });
    setOpen(true);
  };

  const handleClose = () => setOpen(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAdd = async () => {
    const resolvedUserId = formData.userId || user?.id;
    if (!resolvedUserId) return;

    try {
      await allocateBudgetTrigger({
        ...formData,
        userId: resolvedUserId,
      }).unwrap();

      setFormData({
        userId: "",
        amount: 0,
        month: currentMonth,
        year,
        company: "",
      });
    } catch (err) {
      console.error("Allocation failed:", err);
    }
  };

  const handleSubmit = async () => {
    if (!selectedBudget) return;
    try {
      await updateBudgetTrigger({
        id: selectedBudget.id || selectedBudget._id,
        updates: formData,
      }).unwrap();
      setOpen(false);
    } catch (err) {
      console.error("Update failed:", err);
    }
  };

  return {
    stats,
    statsBudgets: budgets, // Re-using budgets for statsBudgets placeholder
    budgets,
    loading,
    meta,
    users: [], // Will be handled by usersApi later
    formData,
    setFormData,
    page,
    setPage,
    limit,
    setLimit,
    open,
    handleOpen,
    handleClose,
    handleChange,
    handleAdd,
    handleSubmit,
    search,
    setSearch,
    filterMonth,
    setFilterMonth,
    filterYear,
    setFilterYear,
    getMonthByNumber,
    selectedMonth,
    setSelectedMonth,
  };
};
