import { useEffect, useState } from "react";
import { Box } from "@mui/material";
import { styled } from "@mui/material/styles";
import { useDispatch, useSelector } from "react-redux";
import { AnimatePresence } from "framer-motion";

import { useBudgeting } from "../../hooks/useBudgeting";
import { useExpenses } from "../../hooks/useExpenses";
import { fetchBudgets } from "../../store/budgetSlice";
import { fetchExpenses } from "../../store/expenseSlice";
import { fetchReimbursements } from "../../store/reimbursementSlice";
import { useLocation } from "../../contexts/LocationContext";

import BudgetTable from "../../components/admin/budgeting/BudgetTable";
import ExpenseTable from "../../components/admin/expense/ExpenseTable";
import TabButtonsWithReport from "../../components/general/TabButtonsWithReport";
import EditBudgetModal from "../../components/admin/budgeting/BudgetEditModal";

import DashboardHeader from "../../components/admin/dashboard/DashboardHeader";
import ExpenseChart from "../../components/admin/expense/ExpenseChart";

// Icons
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import BusinessIcon from "@mui/icons-material/Business";
import StatCard from "../../components/admin/dashboard/StatCard";

const DashboardContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(4),
  minHeight: "100vh",
  backgroundColor: "#f8fafc",
  width: "100%",
  maxWidth: "1800px",
  margin: "0 auto",
}));

// Stats Card Component

const AdminDashboard = () => {
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState("budget");
  const { currentLoc } = useLocation();

  const { reimbursements } = useSelector((state) => state?.reimbursement);

  const {
    statsBudgets,
    budgets,
    loading: budgetLoading,
    meta: budgetMeta,
    page: budgetPage,
    setPage: setBudgetPage,
    handleOpen: handleBudgetOpen,
    search: budgetSearch,
    setSearch: setBudgetSearch,
    filterMonth: budgetFilterMonth,
    setFilterMonth: setBudgetFilterMonth,
    filterYear: budgetFilterYear,
    setFilterYear: setBudgetFilterYear,
    getMonthByNumber: getBudgetMonthByNumber,
    setLimit: setBudgetLimit,
    limit: budgetLimit,
    formData: budgetFormData,
    handleClose: budgetHandleClose,
    handleSubmit: budgetHandleSubmit,
    handleChange: budgetHandleChange,
    open: budgetOpen,
  } = useBudgeting();

  const {
    allExpenses,
    expenses,
    loading: expenseLoading,
    meta: expenseMeta,
    page: expensePage,
    adminExpenses,
    setPage: setExpensePage,
    handleOpen: handleExpenseOpen,
    search: expenseSearch,
    setSearch: setExpenseSearch,
    filterMonth: expenseFilterMonth,
    setFilterMonth: setExpenseFilterMonth,
    filterYear: expenseFilterYear,
    setFilterYear: setExpenseFilterYear,
    getMonthByNumber: getExpenseMonthByNumber,
    setLimit: setExpenseLimit,
    limit: expenseLimit,
    setSelectedMonth: setExpenseSelectedMonth,
  } = useExpenses();

  console.log("admin expenses: ", adminExpenses);

  useEffect(() => {
    dispatch(fetchBudgets({ location: currentLoc, page: 1, limit: 10000 }));
    dispatch(fetchExpenses({ location: currentLoc }));
    dispatch(fetchReimbursements({ location: currentLoc }));
  }, [dispatch, currentLoc]);

  const totalPendingReimbursed =
    reimbursements
      ?.filter((r) => !r?.isReimbursed)
      .reduce((acc, r) => acc + Number(r?.amount || 0), 0) || 0;

  const totalReimbursed =
    reimbursements
      ?.filter((r) => r?.isReimbursed)
      .reduce((acc, r) => acc + Number(r?.amount || 0), 0) || 0;

  const totalExpenses = statsBudgets.reduce(
    (acc, b) => acc + Number(b.spentAmount || 0),
    0,
  );

  const totalAllocated =
    statsBudgets?.reduce((acc, b) => acc + Number(b?.allocatedAmount), 0) || 0;

  // Stats configuration
  const budgetStatsConfig = [
    {
      title: "Total Allocated",
      value: `₹${totalAllocated.toLocaleString()}`,
      icon: <AccountBalanceIcon />,
      color: "#3b82f6",
      subtitle: "Total budget allocation",
    },
    {
      title: "Total Expenses",
      value: `₹${totalExpenses.toLocaleString()}`,
      icon: <MonetizationOnIcon />,
      color: "#ef4444",
      subtitle: "Allocated expenses",
    },
    {
      title: "To Be Reimbursed",
      value: `₹${totalPendingReimbursed.toLocaleString()}`,
      icon: <CreditCardIcon />,
      color: "#f59e0b",
      subtitle: "Pending funds",
    },
    {
      title: "Total Reimbursed",
      value: `₹${totalReimbursed.toLocaleString()}`,
      icon: <BusinessIcon />,
      color: "#10b981",
      subtitle: "Reimbursed funds",
    },
  ];

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        duration: 0.5,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
      },
    },
  };

  return (
    <DashboardContainer
      sx={{
        px: { xs: 2, sm: 3, md: 4 },
        py: { xs: 2, sm: 3, md: 4 },
      }}
    >
      <div initial="hidden" animate="visible" variants={containerVariants}>
        {/* Header */}
        <div variants={itemVariants}>
          <DashboardHeader />
        </div>

        {/* Stats Grid - Full Width Cards */}
        <Box sx={{ mb: 4 }}>
          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              gap: 2,
              justifyContent: "flex-start",
            }}
          >
            {budgetStatsConfig.map((stat, index) => (
              <Box
                key={index}
                sx={{
                  flex: {
                    xs: "1 1 100%",
                    sm: "1 1 calc(50% - 10px)",
                    md: "1 1 0",
                  },
                  minWidth: { xs: "100%", sm: "240px" },
                }}
              >
                <div variants={itemVariants}>
                  <StatCard stat={stat} />
                </div>
              </Box>
            ))}
          </Box>
        </Box>

        {/* Chart Section */}
        <div variants={itemVariants}>
          <ExpenseChart expenses={expenses} />
        </div>

        {/* Tabs Section */}
        <div variants={itemVariants}>
          <Box sx={{ mb: 3 }}>
            <TabButtonsWithReport
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              budgets={statsBudgets}
              expenses={allExpenses}
            />
          </Box>
        </div>

        {/* Tables Section */}
        <AnimatePresence mode="wait">
          <div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {activeTab === "budget" && (
              <>
                <BudgetTable
                  showPagination
                  limit={budgetLimit}
                  setLimit={setBudgetLimit}
                  budgets={budgets}
                  loading={budgetLoading}
                  meta={budgetMeta}
                  page={budgetPage}
                  setPage={setBudgetPage}
                  search={budgetSearch}
                  setSearch={setBudgetSearch}
                  filterMonth={budgetFilterMonth}
                  setFilterMonth={setBudgetFilterMonth}
                  filterYear={budgetFilterYear}
                  setFilterYear={setBudgetFilterYear}
                  getMonthByNumber={getBudgetMonthByNumber}
                  handleOpen={handleBudgetOpen}
                />
                <EditBudgetModal
                  open={budgetOpen}
                  handleClose={budgetHandleClose}
                  formData={budgetFormData}
                  handleChange={budgetHandleChange}
                  handleSubmit={budgetHandleSubmit}
                />
              </>
            )}
            {activeTab === "expense" && (
              <ExpenseTable
                limit={expenseLimit}
                setLimit={setExpenseLimit}
                expenses={expenses}
                loading={expenseLoading}
                meta={expenseMeta}
                page={expensePage}
                setPage={setExpensePage}
                search={expenseSearch}
                setSearch={setExpenseSearch}
                filterMonth={expenseFilterMonth}
                setFilterMonth={setExpenseFilterMonth}
                filterYear={expenseFilterYear}
                setFilterYear={setExpenseFilterYear}
                getMonthByNumber={getExpenseMonthByNumber}
                handleOpen={handleExpenseOpen}
                setSelectedMonth={setExpenseSelectedMonth}
              />
            )}
          </div>
        </AnimatePresence>
      </div>
    </DashboardContainer>
  );
};

export default AdminDashboard;
