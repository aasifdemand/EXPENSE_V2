import {
  Box,
  Button,
  Tabs,
  Tab,
  Grid,
  Typography,
  Container,
  Paper,
  Chip,
  Stack,
} from "@mui/material";
import { useExpenses } from "../../hooks/useExpenses";
import ExpenseTable from "../../components/admin/expense/ExpenseTable";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

import { styled } from "@mui/material/styles";
// Icons
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import ReceiptIcon from "@mui/icons-material/Receipt";
import PendingActionsIcon from "@mui/icons-material/PendingActions";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import BusinessIcon from "@mui/icons-material/Business";
import AddIcon from "@mui/icons-material/Add";
import PersonIcon from "@mui/icons-material/Person";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import StatCard from "../../components/general/StatCard";
import InfoIcon from "@mui/icons-material/Info";

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

const StyledTabs = styled(Tabs)(({ theme }) => ({
  "& .MuiTab-root": {
    textTransform: "none",
    fontWeight: 600,
    fontSize: "0.95rem",
    fontFamily: '"Poppins", sans-serif',
    minHeight: 48,
    padding: theme.spacing(1.5, 2.5),
    "&.Mui-selected": {
      color: "#3b82f6",
    },
  },
  "& .MuiTabs-indicator": {
    backgroundColor: "#3b82f6",
    height: 3,
    borderRadius: 2,
  },
}));

const ExpenseChip = styled(Chip)(({ color }) => ({
  fontFamily: '"Poppins", sans-serif',
  fontWeight: 500,
  fontSize: "0.75rem",
  backgroundColor: `${color}15`,
  color: color,
  border: `1px solid ${color}40`,
}));

const Expenses = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState(0); // 0 = User, 1 = Admin

  const {
    expenses,
    adminExpenses,
    loading,
    meta,
    page,
    setPage,
    search,
    setSearch,
    filterMonth,
    setFilterMonth,
    filterYear,
    setFilterYear,
    getMonthByNumber,
    setLimit,
    limit,
    handleOpen,
  } = useExpenses();

  const isUserTab = tab === 0;
  const isAdminTab = tab === 1;

  // Stats source based on selected tab
  const statsSource = isUserTab ? expenses : adminExpenses;
  const safeExpenses = statsSource || [];

  // Calculate statistics
  const totalExpenses = safeExpenses.reduce(
    (acc, e) => acc + Number(e.amount || 0),
    0,
  );

  const salesExpenses = safeExpenses
    .filter((e) => e?.department?.name === "Sales")
    .reduce((acc, e) => acc + Number(e.amount || 0), 0);

  const dataExpenses = safeExpenses
    .filter((e) => e?.department?.name === "Data")
    .reduce((acc, e) => acc + Number(e.amount || 0), 0);

  const itExpenses = safeExpenses
    .filter((e) => e?.department?.name === "IT")
    .reduce((acc, e) => acc + Number(e.amount || 0), 0);

  const officeExpenses = safeExpenses
    .filter((e) => e?.department?.name === "Office")
    .reduce((acc, e) => acc + Number(e.amount || 0), 0);

  // Count expenses per status
  const pendingExpenses = safeExpenses.filter((e) => !e.isReimbursed).length;
  const reimbursedExpenses = safeExpenses.filter((e) => e.isReimbursed).length;

  const expenseStats = [
    {
      title: "Total Expenses",
      value: `₹${totalExpenses.toLocaleString()}`,
      color: "#3b82f6",
      icon: <MonetizationOnIcon />,
      subtitle: isUserTab ? "User Expenses" : "Admin Expenses",
      trend: `${safeExpenses.length} records`,
      trendColor: "#64748b",
    },
    {
      title: "Sales Department",
      value: `₹${salesExpenses.toLocaleString()}`,
      color: "#10b981",
      icon: <ReceiptIcon />,
      subtitle: "Sales related expenses",
      trend: salesExpenses > 0 ? "Active" : "No expenses",
      trendColor: salesExpenses > 0 ? "#10b981" : "#64748b",
    },
    {
      title: "Data Department",
      value: `₹${dataExpenses.toLocaleString()}`,
      color: "#8b5cf6",
      icon: <PendingActionsIcon />,
      subtitle: "Data related expenses",
      trend: dataExpenses > 0 ? "Active" : "No expenses",
      trendColor: dataExpenses > 0 ? "#8b5cf6" : "#64748b",
    },
    {
      title: "IT Department",
      value: `₹${itExpenses.toLocaleString()}`,
      color: "#f59e0b",
      icon: <AttachMoneyIcon />,
      subtitle: "IT related expenses",
      trend: itExpenses > 0 ? "Active" : "No expenses",
      trendColor: itExpenses > 0 ? "#f59e0b" : "#64748b",
    },
    {
      title: "Office Department",
      value: `₹${officeExpenses.toLocaleString()}`,
      color: "#ef4444",
      icon: <BusinessIcon />,
      subtitle: "Office related expenses",
      trend: officeExpenses > 0 ? "Active" : "No expenses",
      trendColor: officeExpenses > 0 ? "#ef4444" : "#64748b",
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

  const handleTabChange = (event, newValue) => {
    setTab(newValue);
    setPage(1); // Reset pagination when switching tabs
  };

  return (
    <PageContainer maxWidth="xl">
      <div initial="hidden" animate="visible" variants={containerVariants}>
        {/* Page Header */}
        <PageHeader>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              mb: 2,
            }}
          >
            <Box>
              <GradientTypography variant="h4" sx={{ mb: 1 }}>
                Expense Management
              </GradientTypography>
              <Typography
                variant="h6"
                sx={{
                  color: "#64748b",
                  fontWeight: 400,
                  fontSize: "1.1rem",
                }}
              >
                Track and manage expenses across departments
              </Typography>
            </Box>

            {/* Show Upload Button only for Admin Expenses tab */}
            {isAdminTab && (
              <div
                variants={itemVariants}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => navigate("/admin/expenses/add")}
                  sx={{
                    borderRadius: 2,
                    px: 3,
                    py: 1.5,
                    background:
                      "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
                    boxShadow: "0 4px 15px rgba(59, 130, 246, 0.3)",
                    fontWeight: 600,
                    fontFamily: '"Poppins", sans-serif',
                    textTransform: "none",
                    "&:hover": {
                      background:
                        "linear-gradient(135deg, #2563eb 0%, #1e40af 100%)",
                      boxShadow: "0 6px 20px rgba(59, 130, 246, 0.4)",
                    },
                  }}
                >
                  Upload New Expense
                </Button>
              </div>
            )}
          </Box>

          {/* Tabs with Status */}
          <Box sx={{ mt: 3 }}>
            <StyledTabs
              value={tab}
              onChange={handleTabChange}
              sx={{
                borderBottom: 1,
                borderColor: "divider",
                mb: 2,
              }}
            >
              <Tab
                label={
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <PersonIcon sx={{ fontSize: 20 }} />
                    User Expenses
                    {isUserTab && (
                      <ExpenseChip
                        label={`${pendingExpenses} Pending`}
                        color="#f59e0b"
                        size="small"
                      />
                    )}
                  </Box>
                }
              />
              <Tab
                label={
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <AdminPanelSettingsIcon sx={{ fontSize: 20 }} />
                    Admin Expenses
                    {isAdminTab && (
                      <ExpenseChip
                        label={`${reimbursedExpenses} Reimbursed`}
                        color="#10b981"
                        size="small"
                      />
                    )}
                  </Box>
                }
              />
            </StyledTabs>
          </Box>
        </PageHeader>

        {/* Stats Overview */}
        <div variants={itemVariants}>
          <ContentCard sx={{ mb: 3 }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
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
                <ReceiptIcon /> Expense Overview
              </Typography>
              <Stack direction="row" spacing={1.5}>
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
                    Total Records
                  </Typography>
                  <Typography
                    variant="h6"
                    sx={{
                      color: "#3b82f6",
                      fontWeight: 700,
                    }}
                  >
                    {safeExpenses.length}
                  </Typography>
                </Box>
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
                    Average
                  </Typography>
                  <Typography
                    variant="h6"
                    sx={{
                      color: "#10b981",
                      fontWeight: 700,
                    }}
                  >
                    ₹
                    {safeExpenses.length > 0
                      ? (totalExpenses / safeExpenses.length).toLocaleString(
                          undefined,
                          { maximumFractionDigits: 0 },
                        )
                      : 0}
                  </Typography>
                </Box>
              </Stack>
            </Box>

            {/* Stats Grid */}
            <Grid container spacing={2.5}>
              {expenseStats.map((stat, index) => (
                <Grid item xs={12} sm={6} md={2.4} key={index}>
                  <StatCard stat={stat} />
                </Grid>
              ))}
            </Grid>
          </ContentCard>
        </div>

        {/* Expense Table Section */}
        <div variants={itemVariants}>
          <ContentCard>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 3,
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
                <BusinessIcon /> {isUserTab ? "User" : "Admin"} Expense Records
              </Typography>
              <Box sx={{ display: "flex", gap: 1.5 }}>
                <ExpenseChip
                  label={`Total: ₹${totalExpenses.toLocaleString()}`}
                  color="#3b82f6"
                />
                <ExpenseChip
                  label={`${pendingExpenses} Pending`}
                  color="#f59e0b"
                />
                <ExpenseChip
                  label={`${reimbursedExpenses} Reimbursed`}
                  color="#10b981"
                />
              </Box>
            </Box>

            <ExpenseTable
              expenses={isUserTab ? expenses : adminExpenses}
              loading={loading}
              meta={meta}
              page={page}
              setPage={setPage}
              limit={limit}
              setLimit={setLimit}
              search={search}
              setSearch={setSearch}
              filterMonth={filterMonth}
              setFilterMonth={setFilterMonth}
              filterYear={filterYear}
              setFilterYear={setFilterYear}
              getMonthByNumber={getMonthByNumber}
              handleOpen={handleOpen}
              disableFilters={isAdminTab}
            />
          </ContentCard>
        </div>

        {/* Additional Info Section */}
        <div variants={itemVariants}>
          <ContentCard sx={{ mt: 3 }}>
            <Typography
              variant="subtitle1"
              sx={{
                color: "#1e293b",
                fontWeight: 600,
                mb: 2,
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
            >
              <InfoIcon /> Quick Insights
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <Paper
                  sx={{ p: 2, borderRadius: 2, backgroundColor: "#f8fafc" }}
                >
                  <Typography
                    variant="caption"
                    sx={{ color: "#64748b", display: "block" }}
                  >
                    Most Active Department
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{ fontWeight: 600, color: "#1e293b" }}
                  >
                    {salesExpenses > dataExpenses &&
                    salesExpenses > itExpenses &&
                    salesExpenses > officeExpenses
                      ? "Sales"
                      : dataExpenses > itExpenses &&
                          dataExpenses > officeExpenses
                        ? "Data"
                        : itExpenses > officeExpenses
                          ? "IT"
                          : "Office"}
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Paper
                  sx={{ p: 2, borderRadius: 2, backgroundColor: "#f8fafc" }}
                >
                  <Typography
                    variant="caption"
                    sx={{ color: "#64748b", display: "block" }}
                  >
                    Highest Expense
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{ fontWeight: 600, color: "#1e293b" }}
                  >
                    ₹
                    {safeExpenses.length > 0
                      ? Math.max(
                          ...safeExpenses.map((e) => e.amount || 0),
                        ).toLocaleString()
                      : 0}
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Paper
                  sx={{ p: 2, borderRadius: 2, backgroundColor: "#f8fafc" }}
                >
                  <Typography
                    variant="caption"
                    sx={{ color: "#64748b", display: "block" }}
                  >
                    Lowest Expense
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{ fontWeight: 600, color: "#1e293b" }}
                  >
                    ₹
                    {safeExpenses.length > 0
                      ? Math.min(
                          ...safeExpenses.map((e) => e.amount || 0),
                        ).toLocaleString()
                      : 0}
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Paper
                  sx={{ p: 2, borderRadius: 2, backgroundColor: "#f8fafc" }}
                >
                  <Typography
                    variant="caption"
                    sx={{ color: "#64748b", display: "block" }}
                  >
                    Records This Month
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{ fontWeight: 600, color: "#1e293b" }}
                  >
                    {
                      safeExpenses.filter((e) => {
                        const expenseDate = new Date(e.createdAt);
                        const now = new Date();
                        return (
                          expenseDate.getMonth() === now.getMonth() &&
                          expenseDate.getFullYear() === now.getFullYear()
                        );
                      }).length
                    }
                  </Typography>
                </Paper>
              </Grid>
            </Grid>
          </ContentCard>
        </div>
      </div>
    </PageContainer>
  );
};

// Add missing import

export default Expenses;
