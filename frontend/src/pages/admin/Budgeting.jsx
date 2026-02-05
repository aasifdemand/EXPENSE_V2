import { Box, Grid, Typography, Container, Paper } from "@mui/material";
import { useBudgeting } from "../../hooks/useBudgeting";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { fetchAllUsers } from "../../store/authSlice";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import SavingsIcon from "@mui/icons-material/Savings";
import GroupsIcon from "@mui/icons-material/Groups";
import BudgetForm from "../../components/admin/budgeting/BudgetForm";
import BudgetTable from "../../components/admin/budgeting/BudgetTable";
import EditBudgetModal from "../../components/admin/budgeting/BudgetEditModal";
import StatCard from "../../components/general/StatCard";
import { styled } from "@mui/material/styles";

// Styled Components
const PageContainer = styled(Container)(({ theme }) => ({
  padding: theme.spacing(4),
  minHeight: "100vh",
  backgroundColor: "#f8fafc",
  fontFamily: '"Poppins", sans-serif !important',
}));

const PageHeader = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(4),
}));

const GradientTypography = styled(Typography)(() => ({
  background: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
  fontWeight: 700,
  fontFamily: '"Poppins", sans-serif',
}));

const ContentCard = styled(Paper)(({ theme }) => ({
  borderRadius: 16,
  boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
  border: "1px solid rgba(226, 232, 240, 0.8)",
  backgroundColor: "white",
  padding: theme.spacing(3),
  transition: "all 0.3s ease",
  "&:hover": {
    boxShadow: "0 8px 30px rgba(0,0,0,0.08)",
  },
  fontFamily: '"Poppins", sans-serif',
}));

const Budgeting = () => {
  const dispatch = useDispatch();

  const {
    statsBudgets,
    budgets,
    loading,
    meta,
    users,
    page,
    setPage,
    formData,
    setFormData,
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
    setLimit,
    limit,
  } = useBudgeting();

  useEffect(() => {
    dispatch(fetchAllUsers());
  }, [dispatch]);

  const totalAllocated = statsBudgets.reduce(
    (acc, b) => acc + Number(b.allocatedAmount || 0),
    0,
  );

  const totalSpent = statsBudgets.reduce(
    (acc, b) => acc + Number(b.spentAmount || 0),
    0,
  );

  const remainingBalance = statsBudgets.reduce(
    (acc, b) => acc + Number(b.remainingAmount || 0),
    0,
  );

  const utilizationRate =
    totalAllocated > 0 ? ((totalSpent / totalAllocated) * 100).toFixed(1) : 0;

  // Budget Stats Cards
  const budgetStats = [
    {
      title: "Total Allocated",
      value: `₹${totalAllocated.toLocaleString()}`,
      icon: <AccountBalanceIcon />,
      color: "#3b82f6",
      subtitle: "Total budget allocation",
      trend:
        utilizationRate > 0 ? `${utilizationRate}% utilized` : "No utilization",
      trendColor:
        utilizationRate > 80
          ? "#ef4444"
          : utilizationRate > 50
            ? "#f59e0b"
            : "#10b981",
    },
    {
      title: "Total Expenses",
      value: `₹${totalSpent.toLocaleString()}`,
      icon: <MonetizationOnIcon />,
      color: "#ef4444",
      subtitle: "Total budget spent",
      trend: totalSpent > 0 ? "Active spending" : "No expenses",
      trendColor: totalSpent > 0 ? "#ef4444" : "#64748b",
    },
    {
      title: "Remaining Balance",
      value: `₹${remainingBalance.toLocaleString()}`,
      icon: <SavingsIcon />,
      color: "#10b981",
      subtitle: "Available funds",
      trend: remainingBalance > 0 ? "Available" : "Over budget",
      trendColor: remainingBalance > 0 ? "#10b981" : "#ef4444",
    },
    {
      title: "Budget Allocations",
      value: statsBudgets?.length || 0,
      icon: <GroupsIcon />,
      color: "#f59e0b",
      subtitle: "Total allocations",
      trend: users?.length > 0 ? `${users.length} users` : "No users",
      trendColor: "#64748b",
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
    <PageContainer maxWidth="xl">
      <div initial="hidden" animate="visible" variants={containerVariants}>
        {/* Page Header */}
        <PageHeader>
          <GradientTypography variant="h4" sx={{ mb: 1 }}>
            Budget Management
          </GradientTypography>
          <Typography
            variant="h6"
            sx={{
              color: "#64748b",
              fontWeight: 400,
              fontSize: "1.1rem",
            }}
          >
            Allocate, monitor, and manage budgets across your organization
          </Typography>
        </PageHeader>

        {/* Stats Section */}
        <div variants={itemVariants}>
          <Grid container spacing={3} sx={{ mb: 4 }}>
            {budgetStats.map((stat, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <StatCard stat={stat} />
              </Grid>
            ))}
          </Grid>
        </div>

        {/* Summary Overview */}
        <div variants={itemVariants}>
          <ContentCard sx={{ mb: 3 }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                mb: 2,
              }}
            >
              <Typography
                variant="h6"
                sx={{
                  color: "#1e293b",
                  fontWeight: 600,
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                }}
              >
                <AccountBalanceIcon /> Budget Overview
              </Typography>
              <Box sx={{ display: "flex", gap: 2 }}>
                <Box sx={{ textAlign: "center" }}>
                  <Typography
                    variant="caption"
                    sx={{
                      color: "#64748b",
                      fontSize: "0.75rem",
                      display: "block",
                      fontWeight: 500,
                    }}
                  >
                    Utilization Rate
                  </Typography>
                  <Typography
                    variant="h6"
                    sx={{
                      color:
                        utilizationRate > 80
                          ? "#ef4444"
                          : utilizationRate > 50
                            ? "#f59e0b"
                            : "#10b981",
                      fontWeight: 700,
                    }}
                  >
                    {utilizationRate}%
                  </Typography>
                </Box>
              </Box>
            </Box>

            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 3,
                flexWrap: "wrap",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Box
                  sx={{
                    width: 12,
                    height: 12,
                    borderRadius: "50%",
                    backgroundColor: "#3b82f6",
                  }}
                />
                <Typography variant="body2" sx={{ color: "#64748b" }}>
                  Allocated: ₹{totalAllocated.toLocaleString()}
                </Typography>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Box
                  sx={{
                    width: 12,
                    height: 12,
                    borderRadius: "50%",
                    backgroundColor: "#ef4444",
                  }}
                />
                <Typography variant="body2" sx={{ color: "#64748b" }}>
                  Spent: ₹{totalSpent.toLocaleString()}
                </Typography>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Box
                  sx={{
                    width: 12,
                    height: 12,
                    borderRadius: "50%",
                    backgroundColor: "#10b981",
                  }}
                />
                <Typography variant="body2" sx={{ color: "#64748b" }}>
                  Remaining: ₹{remainingBalance.toLocaleString()}
                </Typography>
              </Box>
            </Box>
          </ContentCard>
        </div>

        {/* Budget Form Section */}
        <div variants={itemVariants}>
          <ContentCard sx={{ mb: 3 }}>
            <Typography
              variant="h6"
              sx={{
                color: "#1e293b",
                fontWeight: 600,
                mb: 2,
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
            >
              <GroupsIcon /> Create New Budget Allocation
            </Typography>
            <BudgetForm
              users={users}
              formData={formData}
              setFormData={setFormData}
              handleChange={handleChange}
              handleAdd={handleAdd}
              loading={loading}
            />
          </ContentCard>
        </div>

        {/* Budget Table Section */}
        <div variants={itemVariants}>
          <ContentCard>
            <Typography
              variant="h6"
              sx={{
                color: "#1e293b",
                fontWeight: 600,
                mb: 3,
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
            >
              <AccountBalanceIcon /> Budget Allocations
            </Typography>
            <BudgetTable
              showPagination
              limit={limit}
              setLimit={setLimit}
              budgets={budgets}
              loading={loading}
              meta={meta}
              page={page}
              setPage={setPage}
              search={search}
              setSearch={setSearch}
              filterMonth={filterMonth}
              setFilterMonth={setFilterMonth}
              filterYear={filterYear}
              setFilterYear={setFilterYear}
              getMonthByNumber={getMonthByNumber}
              handleOpen={handleOpen}
            />
          </ContentCard>
        </div>

        {/* Edit Budget Modal */}
        <EditBudgetModal
          open={open}
          handleClose={handleClose}
          formData={formData}
          handleChange={handleChange}
          handleSubmit={handleSubmit}
        />
      </div>
    </PageContainer>
  );
};

export default Budgeting;
