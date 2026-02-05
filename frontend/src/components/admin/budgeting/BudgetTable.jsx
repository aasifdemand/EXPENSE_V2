import {
  Box,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Pagination,
  Typography,
  Avatar,
  Modal,
  Paper,
  Select,
  MenuItem,
  InputLabel,
  Popover,
  Chip,
  IconButton,
  Tooltip,
  Stack,
  CircularProgress,
  TextField,
  InputAdornment,
} from "@mui/material";
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  MoreVert as MoreVertIcon,
  Visibility as VisibilityIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  AccountBalance as AccountBalanceIcon,
  AttachMoney as AttachMoneyIcon,
  Savings as SavingsIcon,
  Business as BusinessIcon,
  CalendarToday as CalendarTodayIcon,
} from "@mui/icons-material";
import { useState } from "react";
import { useSelector } from "react-redux";

import { styled } from "@mui/material/styles";
import Grid from "@mui/material/Grid";

// Styled Components
const EnhancedSectionCard = styled(Paper)(() => ({
  borderRadius: 16,
  boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
  border: "1px solid rgba(226, 232, 240, 0.8)",
  backgroundColor: "white",
  overflow: "hidden",
  transition: "all 0.3s ease",
  "&:hover": {
    boxShadow: "0 8px 30px rgba(0,0,0,0.08)",
  },
  fontFamily: '"Poppins", sans-serif !important',
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

const StyledTableRow = styled(TableRow)(() => ({
  transition: "all 0.2s ease",
  "&:hover": {
    backgroundColor: "#f8fafc",
    transform: "translateY(-1px)",
    boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
  },
  "&:last-child td, &:last-child th": {
    borderBottom: 0,
  },
}));

const SearchField = styled(TextField)(() => ({
  "& .MuiOutlinedInput-root": {
    borderRadius: 12,
    backgroundColor: "#f8fafc",
    fontFamily: '"Poppins", sans-serif',
    "&:hover .MuiOutlinedInput-notchedOutline": {
      borderColor: "#3b82f6",
    },
    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
      borderColor: "#3b82f6",
      borderWidth: 2,
    },
  },
  "& .MuiInputBase-input": {
    fontFamily: '"Poppins", sans-serif',
    fontSize: "0.875rem",
  },
}));

const StyledSelect = styled(Select)(() => ({
  borderRadius: 12,
  fontFamily: '"Poppins", sans-serif',
  "& .MuiOutlinedInput-notchedOutline": {
    borderColor: "#e2e8f0",
  },
  "&:hover .MuiOutlinedInput-notchedOutline": {
    borderColor: "#3b82f6",
  },
  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
    borderColor: "#3b82f6",
    borderWidth: 2,
  },
}));

const AmountTypography = styled(Typography)(({ color }) => ({
  fontWeight: 600,
  fontSize: "0.875rem",
  fontFamily: '"Poppins", sans-serif',
  color: color || "#1e293b",
}));

const BudgetTable = ({
  budgets,
  loading,
  meta,
  page = 1,
  setPage,
  search,
  setSearch,
  limit = 5,
  setLimit,
  showPagination = false,
}) => {
  const { role } = useSelector((state) => state?.auth);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedBudget, setSelectedBudget] = useState(null);

  const handleCloseModal = () => {
    setIsOpen(false);
    setSelectedBudget(null);
  };

  const getSpentPercentage = (spent, allocated) => {
    if (!allocated || allocated === 0) return 0;
    return Math.min(Math.round((spent / allocated) * 100), 100);
  };

  const getStatusColor = (percentage) => {
    if (percentage <= 70) return "#10b981"; // Green
    if (percentage <= 90) return "#f59e0b"; // Amber
    return "#ef4444"; // Red
  };

  const getStatusText = (percentage) => {
    if (percentage <= 70) return "Under Budget";
    if (percentage <= 90) return "Approaching Limit";
    return "Over Budget";
  };

  return (
    <EnhancedSectionCard>
      {/* Header and Filters */}
      <Box sx={{ p: 3 }}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          alignItems="center"
          justifyContent="space-between"
        >
          <Box>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 600,
                color: "#1e293b",
                fontFamily: '"Poppins", sans-serif',
              }}
            >
              Budget Overview
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: "#64748b",
                fontFamily: '"Poppins", sans-serif',
              }}
            >
              {meta?.total || 0} total budgets • Showing {budgets?.length || 0}{" "}
              entries
            </Typography>
          </Box>

          <Stack
            direction="row"
            spacing={2}
            alignItems="center"
            sx={{ width: { xs: "100%", sm: "auto" } }}
          >
            {role === "superadmin" && (
              <SearchField
                placeholder="Search by name..."
                size="small"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                sx={{ width: { xs: "100%", sm: 200 } }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" sx={{ color: "#94a3b8" }} />
                    </InputAdornment>
                  ),
                }}
              />
            )}

            {setLimit && showPagination && (
              <Box sx={{ minWidth: 120 }}>
                <InputLabel
                  sx={{
                    fontSize: "0.75rem",
                    color: "#64748b",
                    fontFamily: '"Poppins", sans-serif',
                  }}
                >
                  Rows per page
                </InputLabel>
                <StyledSelect
                  value={limit}
                  onChange={(e) => setLimit(Number(e.target.value))}
                  size="small"
                  fullWidth
                >
                  {[5, 10, 20, 50, 70].map((val) => (
                    <MenuItem
                      key={val}
                      value={val}
                      sx={{ fontFamily: '"Poppins", sans-serif' }}
                    >
                      {val}
                    </MenuItem>
                  ))}
                </StyledSelect>
              </Box>
            )}
          </Stack>
        </Stack>
      </Box>

      <Divider />

      {/* Table */}
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              {role === "superadmin" && <StyledTableCell>User</StyledTableCell>}
              <StyledTableCell>Allocated</StyledTableCell>
              <StyledTableCell>Spent</StyledTableCell>
              <StyledTableCell>Remaining</StyledTableCell>
              <StyledTableCell>Status</StyledTableCell>
              <StyledTableCell>Company</StyledTableCell>
              <StyledTableCell>Date</StyledTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <StyledTableCell
                  colSpan={role === "superadmin" ? 7 : 6}
                  align="center"
                  sx={{ py: 6 }}
                >
                  <CircularProgress
                    size={24}
                    sx={{ color: "#3b82f6", mb: 2 }}
                  />
                  <Typography
                    sx={{
                      color: "#64748b",
                      fontFamily: '"Poppins", sans-serif',
                    }}
                  >
                    Loading budgets...
                  </Typography>
                </StyledTableCell>
              </TableRow>
            ) : budgets?.length > 0 ? (
              budgets.map((row) => {
                const spentPercentage = getSpentPercentage(
                  row?.spentAmount,
                  row?.allocatedAmount,
                );
                const statusColor = getStatusColor(spentPercentage);
                const statusText = getStatusText(spentPercentage);

                return (
                  //   <motion.div
                  //     key={row._id}
                  //     initial={{ opacity: 0, y: 20 }}
                  //     animate={{ opacity: 1, y: 0 }}
                  //     transition={{ delay: index * 0.05 }}
                  //   >
                  <StyledTableRow hover>
                    {role === "superadmin" && (
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
                            {row?.user?.name?.charAt(0).toUpperCase()}
                          </Avatar>
                          <Box>
                            <Typography
                              sx={{
                                fontWeight: 500,
                                fontSize: "0.875rem",
                                color: "#1e293b",
                                fontFamily: '"Poppins", sans-serif',
                              }}
                            >
                              {row?.user?.name}
                            </Typography>
                            <Typography
                              sx={{
                                fontSize: "0.75rem",
                                color: "#64748b",
                                fontFamily: '"Poppins", sans-serif',
                              }}
                            >
                              {row?.user?.email}
                            </Typography>
                          </Box>
                        </Stack>
                      </StyledTableCell>
                    )}
                    <StyledTableCell>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <AccountBalanceIcon
                          sx={{ color: "#10b981", fontSize: 16 }}
                        />
                        <AmountTypography color="#10b981">
                          ₹{row?.allocatedAmount?.toLocaleString()}
                        </AmountTypography>
                      </Stack>
                    </StyledTableCell>
                    <StyledTableCell>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <AttachMoneyIcon
                          sx={{ color: "#ef4444", fontSize: 16 }}
                        />
                        <AmountTypography color="#ef4444">
                          ₹{row?.spentAmount?.toLocaleString()}
                        </AmountTypography>
                      </Stack>
                    </StyledTableCell>
                    <StyledTableCell>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <SavingsIcon sx={{ color: "#3b82f6", fontSize: 16 }} />
                        <AmountTypography color="#3b82f6">
                          ₹{row?.remainingAmount?.toLocaleString()}
                        </AmountTypography>
                      </Stack>
                    </StyledTableCell>
                    <StyledTableCell>
                      <Chip
                        label={statusText}
                        size="small"
                        sx={{
                          backgroundColor: `${statusColor}15`,
                          color: statusColor,
                          fontWeight: 500,
                          fontFamily: '"Poppins", sans-serif',
                          fontSize: "0.75rem",
                        }}
                      />
                      <Typography
                        sx={{
                          fontSize: "0.75rem",
                          color: "#64748b",
                          mt: 0.5,
                          fontFamily: '"Poppins", sans-serif',
                        }}
                      >
                        {spentPercentage}% spent
                      </Typography>
                    </StyledTableCell>
                    <StyledTableCell>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <BusinessIcon sx={{ color: "#8b5cf6", fontSize: 16 }} />
                        <Typography
                          sx={{
                            fontSize: "0.875rem",
                            fontFamily: '"Poppins", sans-serif',
                          }}
                        >
                          {row?.company}
                        </Typography>
                      </Stack>
                    </StyledTableCell>
                    <StyledTableCell>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <CalendarTodayIcon
                          sx={{ color: "#f59e0b", fontSize: 16 }}
                        />
                        <Box>
                          <Typography
                            sx={{
                              fontSize: "0.875rem",
                              fontWeight: 500,
                              fontFamily: '"Poppins", sans-serif',
                            }}
                          >
                            {row?.createdAt
                              ? new Date(row.createdAt).toLocaleDateString(
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
                              fontFamily: '"Poppins", sans-serif',
                            }}
                          >
                            {row?.createdAt
                              ? new Date(row.createdAt).toLocaleTimeString(
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
                      </Stack>
                    </StyledTableCell>
                  </StyledTableRow>
                  //   </motion.div>
                );
              })
            ) : (
              <TableRow>
                <StyledTableCell
                  colSpan={role === "superadmin" ? 7 : 6}
                  align="center"
                  sx={{ py: 6 }}
                >
                  <Box sx={{ textAlign: "center" }}>
                    <AccountBalanceIcon
                      sx={{ fontSize: 48, color: "#cbd5e1", mb: 2 }}
                    />
                    <Typography
                      sx={{
                        color: "#64748b",
                        fontFamily: '"Poppins", sans-serif',
                        mb: 1,
                      }}
                    >
                      No budgets found
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: "0.875rem",
                        color: "#94a3b8",
                        fontFamily: '"Poppins", sans-serif',
                      }}
                    >
                      {search
                        ? "Try adjusting your search"
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
      {showPagination && meta?.total > 0 && setPage && (
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
                fontFamily: '"Poppins", sans-serif',
                fontSize: "0.875rem",
              }}
            >
              Showing {(page - 1) * limit + 1}–
              {Math.min(page * limit, meta.total)} of {meta.total} entries
            </Typography>
            <Pagination
              count={Math.ceil(meta.total / limit)}
              page={page}
              onChange={(e, val) => setPage(val)}
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

      {/* Budget Details Modal */}
      <Modal
        open={isOpen}
        onClose={handleCloseModal}
        sx={{ fontFamily: '"Poppins", sans-serif' }}
      >
        <Paper
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: { xs: "90%", sm: 500 },
            maxWidth: "95vw",
            p: 4,
            borderRadius: 3,
            boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
            outline: "none",
          }}
        >
          {selectedBudget ? (
            <Box>
              <Stack direction="row" alignItems="center" spacing={2} mb={3}>
                <Avatar
                  sx={{
                    bgcolor: "#3b82f6",
                    width: 56,
                    height: 56,
                    fontSize: "1.25rem",
                    fontWeight: 600,
                  }}
                >
                  {selectedBudget?.user?.name?.charAt(0).toUpperCase()}
                </Avatar>
                <Box>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 600,
                      color: "#1e293b",
                      fontFamily: '"Poppins", sans-serif',
                    }}
                  >
                    {selectedBudget?.user?.name}
                  </Typography>
                  <Typography
                    sx={{
                      color: "#64748b",
                      fontFamily: '"Poppins", sans-serif',
                      fontSize: "0.875rem",
                    }}
                  >
                    {selectedBudget?.user?.email}
                  </Typography>
                </Box>
              </Stack>

              <Divider sx={{ my: 3 }} />

              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <Paper
                    sx={{ p: 2, borderRadius: 2, backgroundColor: "#f8fafc" }}
                  >
                    <Typography
                      sx={{
                        fontSize: "0.875rem",
                        color: "#64748b",
                        mb: 1,
                        fontFamily: '"Poppins", sans-serif',
                      }}
                    >
                      Allocated Amount
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: "1.5rem",
                        fontWeight: 700,
                        color: "#10b981",
                        fontFamily: '"Poppins", sans-serif',
                      }}
                    >
                      ₹{selectedBudget?.allocatedAmount?.toLocaleString()}
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Paper
                    sx={{ p: 2, borderRadius: 2, backgroundColor: "#f8fafc" }}
                  >
                    <Typography
                      sx={{
                        fontSize: "0.875rem",
                        color: "#64748b",
                        mb: 1,
                        fontFamily: '"Poppins", sans-serif',
                      }}
                    >
                      Spent Amount
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: "1.5rem",
                        fontWeight: 700,
                        color: "#ef4444",
                        fontFamily: '"Poppins", sans-serif',
                      }}
                    >
                      ₹{selectedBudget?.spentAmount?.toLocaleString()}
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Paper
                    sx={{ p: 2, borderRadius: 2, backgroundColor: "#f8fafc" }}
                  >
                    <Typography
                      sx={{
                        fontSize: "0.875rem",
                        color: "#64748b",
                        mb: 1,
                        fontFamily: '"Poppins", sans-serif',
                      }}
                    >
                      Remaining
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: "1.5rem",
                        fontWeight: 700,
                        color: "#3b82f6",
                        fontFamily: '"Poppins", sans-serif',
                      }}
                    >
                      ₹{selectedBudget?.remainingAmount?.toLocaleString()}
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Paper
                    sx={{ p: 2, borderRadius: 2, backgroundColor: "#f8fafc" }}
                  >
                    <Typography
                      sx={{
                        fontSize: "0.875rem",
                        color: "#64748b",
                        mb: 1,
                        fontFamily: '"Poppins", sans-serif',
                      }}
                    >
                      Company
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: "1.25rem",
                        fontWeight: 600,
                        color: "#1e293b",
                        fontFamily: '"Poppins", sans-serif',
                      }}
                    >
                      {selectedBudget?.company}
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>

              <Box sx={{ mt: 3, pt: 3, borderTop: "1px solid #e2e8f0" }}>
                <Typography
                  sx={{
                    fontSize: "0.875rem",
                    color: "#64748b",
                    fontFamily: '"Poppins", sans-serif',
                  }}
                >
                  Created on{" "}
                  {new Date(selectedBudget?.createdAt).toLocaleString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: true,
                  })}
                </Typography>
              </Box>
            </Box>
          ) : (
            <Box sx={{ textAlign: "center", py: 4 }}>
              <Typography
                sx={{
                  color: "#64748b",
                  fontFamily: '"Poppins", sans-serif',
                }}
              >
                No budget details available
              </Typography>
            </Box>
          )}
        </Paper>
      </Modal>
    </EnhancedSectionCard>
  );
};

// Add Grid import at the top

export default BudgetTable;
