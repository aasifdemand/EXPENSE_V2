import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Card,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
  Snackbar,
  Avatar,
  IconButton,
  Chip,
  Tooltip,
  Pagination,
  Stack,
  InputLabel,
  MenuItem,
  Grid,
  Paper,
  Button,
  CircularProgress,
} from "@mui/material";
import { useExpenses } from "../../hooks/useExpenses";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchReimbursements,
  markAsReimbursed,
} from "../../store/reimbursementSlice";
import {
  DoneAll,
  AccountBalance,
  MonetizationOn,
  CreditCard,
  Payment,
  PendingActions,
  CheckCircle,
  HourglassEmpty,
  Download,
  FilterList,
} from "@mui/icons-material";
import { fetchBudgets } from "../../store/budgetSlice";
import { useLocation } from "../../contexts/LocationContext";
import { fetchExpenses } from "../../store/expenseSlice";
import { useBudgeting } from "../../hooks/useBudgeting";
import StatCard from "../../components/general/StatCard";
import { StyledFormControl, StyledSelect } from "../../styles/budgeting.styles";
import { styled } from "@mui/material/styles";
import Container from "@mui/material/Container";

// Styled Components
const PageContainer = styled(Container)(({ theme }) => ({
  padding: theme.spacing(4),
  minHeight: "100vh",
  backgroundColor: "#f8fafc",
  fontFamily: '"Poppins", sans-serif !important',
}));

const GradientTypography = styled(Typography)(() => ({
  background: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
  fontWeight: 700,
  fontFamily: '"Poppins", sans-serif',
}));

const ContentCard = styled(Card)(() => ({
  borderRadius: 16,
  boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
  border: "1px solid rgba(226, 232, 240, 0.8)",
  backgroundColor: "white",
  overflow: "hidden",
  fontFamily: '"Poppins", sans-serif',
}));

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  fontFamily: '"Poppins", sans-serif',
  padding: theme.spacing(2),
  "&.MuiTableCell-head": {
    fontWeight: 600,
    color: "#1e293b",
    backgroundColor: "#f8fafc",
    fontSize: "0.875rem",
    borderBottom: "2px solid #e2e8f0",
  },
  "&.MuiTableCell-body": {
    fontSize: "0.875rem",
    color: "#334155",
  },
}));

const StatusChip = styled(Chip)(({ status }) => ({
  fontWeight: 500,
  fontSize: "0.75rem",
  fontFamily: '"Poppins", sans-serif',
  backgroundColor: status === "reimbursed" ? "#10b98115" : "#f59e0b15",
  color: status === "reimbursed" ? "#10b981" : "#f59e0b",
  border: `1px solid ${status === "reimbursed" ? "#10b98140" : "#f59e0b40"}`,
}));

const ReimbursementManagement = () => {
  const { currentLoc } = useLocation();
  const dispatch = useDispatch();
  const { reimbursements, loading, pagination } = useSelector(
    (state) => state.reimbursement,
  );

  const [errorMessage, setErrorMessage] = useState("");
  const [success, setSuccess] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [statusFilter, setStatusFilter] = useState("all");

  const { allExpenses } = useExpenses();
  const { allBudgets } = useBudgeting();

  const totalAllocated =
    allBudgets?.reduce((acc, b) => acc + Number(b?.allocatedAmount), 0) || 0;
  const totalExpenses =
    allExpenses?.reduce((acc, b) => acc + Number(b?.amount), 0) || 0;
  const totalPendingReimbursed = reimbursements
    .filter((r) => !r.isReimbursed)
    .reduce((acc, r) => acc + Number(r.amount || 0), 0);

  const totalReimbursed = reimbursements
    .filter((r) => r.isReimbursed)
    .reduce((acc, r) => acc + Number(r.amount || 0), 0);

  const pendingCount =
    reimbursements?.filter((item) => !item?.isReimbursed).length || 0;
  const reimbursedCount =
    reimbursements?.filter((item) => item?.isReimbursed).length || 0;

  useEffect(() => {
    dispatch(
      fetchReimbursements({
        location: currentLoc,
        limit: itemsPerPage,
        page: currentPage,
        status: statusFilter === "all" ? undefined : statusFilter,
      }),
    );
  }, [dispatch, currentLoc, currentPage, itemsPerPage, statusFilter]);

  const handleMarkReimbursed = async (id) => {
    const res = await dispatch(markAsReimbursed({ id, isReimbursed: true }));

    if (markAsReimbursed.fulfilled.match(res)) {
      dispatch(
        fetchReimbursements({
          location: currentLoc,
          page: currentPage,
          limit: itemsPerPage,
          status: statusFilter === "all" ? undefined : statusFilter,
        }),
      );
      await Promise.all([
        dispatch(
          fetchBudgets({
            page: 1,
            limit: 10,
            month: "",
            year: "",
            all: false,
            location: currentLoc,
          }),
        ),
        dispatch(fetchExpenses({ page: 1, limit: 20, location: currentLoc })),
      ]);
      setSuccess("Reimbursement marked as paid successfully!");
    } else {
      setErrorMessage("Failed to mark reimbursement as paid");
    }
  };

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  const handleItemsPerPageChange = (event) => {
    setItemsPerPage(event.target.value);
    setCurrentPage(1);
  };

  const handleStatusFilterChange = (event) => {
    setStatusFilter(event.target.value);
    setCurrentPage(1);
  };

  const reimbursementStats = [
    {
      title: "Total Allocated",
      value: `₹${totalAllocated?.toLocaleString()}`,
      color: "#3b82f6",
      icon: <AccountBalance />,
      subtitle: "Total budget allocation",
      trend: `${allBudgets?.length || 0} budgets`,
      trendColor: "#64748b",
    },
    {
      title: "Total Expenses",
      value: `₹${totalExpenses?.toLocaleString()}`,
      color: "#ef4444",
      icon: <MonetizationOn />,
      subtitle: "Total expenses incurred",
      trend: `${allExpenses?.length || 0} expenses`,
      trendColor: "#64748b",
    },
    {
      title: "Paid Reimbursements",
      value: `₹${totalReimbursed?.toLocaleString()}`,
      color: "#10b981",
      icon: <CheckCircle />,
      subtitle: "Successfully reimbursed",
      trend: `${reimbursedCount} completed`,
      trendColor: "#10b981",
    },
    {
      title: "Pending Reimbursements",
      value: `₹${totalPendingReimbursed?.toLocaleString()}`,
      color: "#f59e0b",
      icon: <PendingActions />,
      subtitle: "Awaiting payment",
      trend: `${pendingCount} pending`,
      trendColor: "#f59e0b",
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

  // Add Container import

  return (
    <Container
      maxWidth="xl"
      sx={{ py: 4, fontFamily: '"Poppins", sans-serif' }}
    >
      <div initial="hidden" animate="visible" variants={containerVariants}>
        {/* Page Header */}
        <Box sx={{ mb: 4 }}>
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
                Reimbursement Management
              </GradientTypography>
              <Typography
                variant="h6"
                sx={{
                  color: "#64748b",
                  fontWeight: 400,
                  fontSize: "1.1rem",
                }}
              >
                Track and process expense reimbursements
              </Typography>
            </Box>
            <Button
              variant="outlined"
              startIcon={<Download />}
              sx={{
                borderRadius: 2,
                borderColor: "#e2e8f0",
                color: "#64748b",
                fontWeight: 500,
                fontFamily: '"Poppins", sans-serif',
              }}
            >
              Export Report
            </Button>
          </Box>

          {currentLoc !== "OVERALL" && (
            <Chip
              label={`Location: ${currentLoc}`}
              size="small"
              sx={{
                backgroundColor: "#dbeafe",
                color: "#1d4ed8",
                fontWeight: 500,
                fontFamily: '"Poppins", sans-serif',
              }}
            />
          )}
        </Box>

        {/* Stats Grid */}
        <div variants={itemVariants}>
          <Grid container spacing={3} sx={{ mb: 4 }}>
            {reimbursementStats.map((stat, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <StatCard stat={stat} />
              </Grid>
            ))}
          </Grid>
        </div>

        {/* Summary Card */}
        <div variants={itemVariants}>
          <ContentCard sx={{ mb: 3, p: 3 }}>
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
                <Payment /> Reimbursement Overview
              </Typography>
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
                  Allocated: ₹{totalAllocated?.toLocaleString()}
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
                  Spent: ₹{totalExpenses?.toLocaleString()}
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
                  Paid: ₹{totalReimbursed?.toLocaleString()}
                </Typography>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Box
                  sx={{
                    width: 12,
                    height: 12,
                    borderRadius: "50%",
                    backgroundColor: "#f59e0b",
                  }}
                />
                <Typography variant="body2" sx={{ color: "#64748b" }}>
                  Pending: ₹{totalPendingReimbursed?.toLocaleString()}
                </Typography>
              </Box>
            </Box>
          </ContentCard>
        </div>

        {/* Filters */}
        <div variants={itemVariants}>
          <ContentCard sx={{ mb: 3, p: 3 }}>
            <Box
              sx={{
                display: "flex",
                flexDirection: { xs: "column", md: "row" },
                gap: 3,
                alignItems: "center",
              }}
            >
              <Box
                sx={{ display: "flex", alignItems: "right", gap: 2, flex: 1 }}
              >
                <FilterList sx={{ color: "#64748b" }} />
                <Typography
                  variant="body2"
                  sx={{ color: "#64748b", fontWeight: 500 }}
                >
                  Filters
                </Typography>
              </Box>

              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={2}
                sx={{
                  flex: 2,
                  justifyContent: "flex-end", // ✅ pushes to right
                }}
              >
                <StyledFormControl size="small" sx={{ minWidth: 150 }}>
                  <InputLabel>Status</InputLabel>
                  <StyledSelect
                    value={statusFilter}
                    label="Status"
                    onChange={handleStatusFilterChange}
                  >
                    <MenuItem value="all">All Status</MenuItem>
                    <MenuItem value="pending">Pending</MenuItem>
                    <MenuItem value="reimbursed">Reimbursed</MenuItem>
                  </StyledSelect>
                </StyledFormControl>

                <StyledFormControl size="small" sx={{ minWidth: 150 }}>
                  <InputLabel>Rows Per Page</InputLabel>
                  <StyledSelect
                    value={itemsPerPage}
                    label="Rows Per Page"
                    onChange={handleItemsPerPageChange}
                  >
                    {[10, 20, 50, 100].map((num) => (
                      <MenuItem key={num} value={num}>
                        {num}
                      </MenuItem>
                    ))}
                  </StyledSelect>
                </StyledFormControl>
              </Stack>

              <Box sx={{ flex: 1, textAlign: { xs: "left", md: "right" } }}>
                <Typography variant="body2" sx={{ color: "#64748b" }}>
                  Showing {reimbursements.length} of {pagination.totalItems}{" "}
                  reimbursements
                </Typography>
              </Box>
            </Box>
          </ContentCard>
        </div>

        {/* Reimbursements Table */}
        <div variants={itemVariants}>
          <ContentCard>
            <Box sx={{ p: 3 }}>
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
                <CreditCard /> Reimbursement Requests
              </Typography>
            </Box>

            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <StyledTableCell>User</StyledTableCell>
                    <StyledTableCell>Amount Allocated</StyledTableCell>
                    <StyledTableCell>Total Expenses</StyledTableCell>
                    <StyledTableCell>To Be Reimbursed</StyledTableCell>
                    <StyledTableCell>Date</StyledTableCell>
                    <StyledTableCell>Status</StyledTableCell>
                    <StyledTableCell align="center">Actions</StyledTableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <StyledTableCell
                        colSpan={7}
                        align="center"
                        sx={{ py: 6 }}
                      >
                        <CircularProgress
                          size={24}
                          sx={{ color: "#3b82f6", mb: 2 }}
                        />
                        <Typography sx={{ color: "#64748b" }}>
                          Loading reimbursements...
                        </Typography>
                      </StyledTableCell>
                    </TableRow>
                  ) : reimbursements?.length > 0 ? (
                    reimbursements.map((item, index) => (
                      <tr
                        key={item?.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <StyledTableCell>
                          <Stack
                            direction="row"
                            alignItems="center"
                            spacing={1.5}
                          >
                            <Avatar
                              sx={{
                                bgcolor: "#3b82f6",
                                width: 36,
                                height: 36,
                                fontSize: "0.875rem",
                                fontWeight: 600,
                              }}
                            >
                              {item?.requestedBy?.name?.charAt(0).toUpperCase()}
                            </Avatar>
                            <Box>
                              <Typography
                                sx={{
                                  fontWeight: 500,
                                  fontSize: "0.875rem",
                                  color: "#1e293b",
                                }}
                              >
                                {item?.requestedBy?.name}
                              </Typography>
                              <Typography
                                sx={{
                                  fontSize: "0.75rem",
                                  color: "#64748b",
                                }}
                              >
                                {item?.requestedBy?.userLoc}
                              </Typography>
                            </Box>
                          </Stack>
                        </StyledTableCell>
                        <StyledTableCell>
                          <Typography
                            sx={{
                              fontWeight: 600,
                              fontSize: "0.875rem",
                              color: "#3b82f6",
                            }}
                          >
                            ₹
                            {Number(
                              item?.expense?.fromAllocation || 0,
                            )?.toLocaleString()}
                          </Typography>
                        </StyledTableCell>
                        <StyledTableCell>
                          <Typography
                            sx={{
                              fontWeight: 600,
                              fontSize: "0.875rem",
                              color: "#ef4444",
                            }}
                          >
                            ₹
                            {Number(
                              item?.expense?.amount || 0,
                            )?.toLocaleString()}
                          </Typography>
                        </StyledTableCell>
                        <StyledTableCell>
                          <Typography
                            sx={{
                              fontWeight: 600,
                              fontSize: "0.875rem",
                              color: item?.isReimbursed ? "#64748b" : "#f59e0b",
                            }}
                          >
                            ₹
                            {item?.isReimbursed
                              ? 0
                              : Number(
                                  item?.expense?.fromReimbursement || 0,
                                )?.toLocaleString()}
                          </Typography>
                        </StyledTableCell>
                        <StyledTableCell>
                          <Box>
                            <Typography
                              sx={{
                                fontSize: "0.875rem",
                                fontWeight: 500,
                              }}
                            >
                              {item?.createdAt
                                ? new Date(item.createdAt).toLocaleDateString(
                                    "en-US",
                                    {
                                      month: "short",
                                      day: "numeric",
                                    },
                                  )
                                : "-"}
                            </Typography>
                            <Typography
                              sx={{
                                fontSize: "0.75rem",
                                color: "#64748b",
                              }}
                            >
                              {item?.createdAt
                                ? new Date(item.createdAt).toLocaleTimeString(
                                    "en-US",
                                    {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                      hour12: true,
                                    },
                                  )
                                : ""}
                            </Typography>
                          </Box>
                        </StyledTableCell>
                        <StyledTableCell>
                          <StatusChip
                            size="small"
                            label={
                              item?.isReimbursed ? "Reimbursed" : "Pending"
                            }
                            status={
                              item?.isReimbursed ? "reimbursed" : "pending"
                            }
                            icon={
                              item?.isReimbursed ? (
                                <CheckCircle fontSize="small" />
                              ) : (
                                <HourglassEmpty fontSize="small" />
                              )
                            }
                          />
                        </StyledTableCell>
                        <StyledTableCell align="center">
                          <Tooltip
                            title={
                              item?.isReimbursed
                                ? "Already reimbursed"
                                : "Mark as reimbursed"
                            }
                          >
                            <span>
                              <IconButton
                                onClick={() =>
                                  !item?.isReimbursed &&
                                  handleMarkReimbursed(item.id)
                                }
                                disabled={item?.isReimbursed}
                                sx={{
                                  backgroundColor: item?.isReimbursed
                                    ? "#10b98115"
                                    : "transparent",
                                  color: item?.isReimbursed
                                    ? "#10b981"
                                    : "#3b82f6",
                                  border: `1px solid ${
                                    item?.isReimbursed
                                      ? "#10b98140"
                                      : "#3b82f640"
                                  }`,
                                  borderRadius: 2,
                                  width: 36,
                                  height: 36,
                                  "&:hover:not(:disabled)": {
                                    backgroundColor: "#3b82f615",
                                    transform: "scale(1.05)",
                                  },
                                  "&:disabled": {
                                    opacity: 0.6,
                                  },
                                }}
                              >
                                <DoneAll fontSize="small" />
                              </IconButton>
                            </span>
                          </Tooltip>
                        </StyledTableCell>
                      </tr>
                    ))
                  ) : (
                    <TableRow>
                      <StyledTableCell
                        colSpan={7}
                        align="center"
                        sx={{ py: 6 }}
                      >
                        <Box sx={{ textAlign: "center" }}>
                          <Payment
                            sx={{ fontSize: 48, color: "#cbd5e1", mb: 2 }}
                          />
                          <Typography
                            sx={{
                              color: "#64748b",
                              mb: 1,
                            }}
                          >
                            No reimbursement requests found
                          </Typography>
                          <Typography
                            sx={{
                              fontSize: "0.875rem",
                              color: "#94a3b8",
                            }}
                          >
                            {statusFilter !== "all"
                              ? `No ${statusFilter} reimbursements`
                              : "No data available"}
                          </Typography>
                        </Box>
                      </StyledTableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Pagination */}
            {pagination?.totalPages > 1 && (
              <Box
                sx={{
                  p: 3,
                  borderTop: "1px solid #e2e8f0",
                  backgroundColor: "#f8fafc",
                }}
              >
                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  spacing={2}
                  alignItems="center"
                  justifyContent="space-between"
                >
                  <Typography
                    variant="body2"
                    sx={{
                      color: "#64748b",
                      fontSize: "0.875rem",
                    }}
                  >
                    Showing{" "}
                    {(pagination.currentPage - 1) * pagination.itemsPerPage + 1}
                    –
                    {Math.min(
                      pagination.currentPage * pagination.itemsPerPage,
                      pagination.totalItems,
                    )}{" "}
                    of {pagination.totalItems} reimbursements
                  </Typography>
                  <Pagination
                    count={pagination.totalPages}
                    page={pagination.currentPage}
                    onChange={handlePageChange}
                    color="primary"
                    size="medium"
                    sx={{
                      "& .MuiPaginationItem-root": {
                        fontFamily: '"Poppins", sans-serif',
                        fontWeight: 500,
                      },
                    }}
                  />
                </Stack>
              </Box>
            )}
          </ContentCard>
        </div>

        {/* Notifications */}
        <Snackbar
          open={!!errorMessage}
          autoHideDuration={6000}
          onClose={() => setErrorMessage("")}
          anchorOrigin={{ vertical: "top", horizontal: "right" }}
        >
          <Alert
            onClose={() => setErrorMessage("")}
            severity="error"
            sx={{
              width: "100%",
              borderRadius: 2,
              fontFamily: '"Poppins", sans-serif',
            }}
          >
            {errorMessage}
          </Alert>
        </Snackbar>

        <Snackbar
          open={!!success}
          autoHideDuration={4000}
          onClose={() => setSuccess("")}
          anchorOrigin={{ vertical: "top", horizontal: "right" }}
        >
          <Alert
            onClose={() => setSuccess("")}
            severity="success"
            sx={{
              width: "100%",
              borderRadius: 2,
              fontFamily: '"Poppins", sans-serif',
            }}
          >
            {success}
          </Alert>
        </Snackbar>
      </div>
    </Container>
  );
};

export default ReimbursementManagement;
