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
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Tooltip,
  Modal,
  Button,
  Chip,
  Alert,
  Grid,
  CircularProgress,
  TextField,
  InputAdornment,
  Paper,
} from "@mui/material";
import {
  Visibility,
  Download,
  PictureAsPdf,
  InsertDriveFile,
  Image,
  Description,
  Close,
  FilterList,
  AttachMoney,
  Business,
  Category,
  Person,
  CalendarToday,
  Receipt,
  Search as SearchIcon,
} from "@mui/icons-material";
import { useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { useState } from "react";
import { useExpenses } from "../../../hooks/useExpenses";
import { styled } from "@mui/material/styles";

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
  backgroundColor: "#f8fafc",
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

const StatusChip = styled(Chip)(({ status }) => ({
  fontWeight: 500,
  fontSize: "0.75rem",
  fontFamily: '"Poppins", sans-serif',
  backgroundColor:
    status === "reimbursed"
      ? "#10b98115"
      : status === "pending"
        ? "#f59e0b15"
        : "#3b82f615",
  color:
    status === "reimbursed"
      ? "#10b981"
      : status === "pending"
        ? "#f59e0b"
        : "#3b82f6",
  border: `1px solid ${
    status === "reimbursed"
      ? "#10b98140"
      : status === "pending"
        ? "#f59e0b40"
        : "#3b82f640"
  }`,
}));

const ExpenseTable = ({
  expenses,
  loading,
  meta,
  page,
  setPage,
  search,
  setSearch,
  setLimit,
  limit,
  disableFilters = false,
}) => {
  const { pathname } = useLocation();
  const { role } = useSelector((state) => state?.auth);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [previewing, setPreviewing] = useState(false);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState("");

  const {
    currentDepartment,
    setCurrentDepartment,
    currentSubDepartment,
    setCurrentSubDepartment,
  } = useExpenses();
  const { departments, subDepartments } = useSelector(
    (state) => state.department,
  );

  const isBudgetingPage = pathname.includes("/budgeting");
  const isExpensesPage = pathname.includes("/expenses");
  const showViewDetails = isBudgetingPage || isExpensesPage;

  const handleViewDetails = (expense) => {
    setSelectedExpense(expense);
    setViewModalOpen(true);
  };

  const handleCloseModal = () => {
    setViewModalOpen(false);
    setSelectedExpense(null);
    setDownloading(false);
    setPreviewing(false);
  };

  const handlePreviewProof = async (expense) => {
    if (previewing) return;
    setPreviewing(true);
    try {
      const proofUrl = getProofUrl(expense);
      if (proofUrl) {
        setPreviewUrl(proofUrl);
        setPreviewModalOpen(true);
      }
    } catch (error) {
      console.error("Error previewing proof:", error);
    } finally {
      setTimeout(() => setPreviewing(false), 500);
    }
  };

  const handleClosePreviewModal = () => {
    setPreviewModalOpen(false);
    setPreviewUrl("");
    setPreviewing(false);
  };

  const getFileIcon = (fileName) => {
    if (!fileName) return <InsertDriveFile />;
    const extension = fileName.split(".").pop()?.toLowerCase();
    switch (extension) {
      case "pdf":
        return <PictureAsPdf />;
      case "jpg":
      case "jpeg":
      case "png":
      case "gif":
      case "bmp":
      case "webp":
      case "svg":
        return <Image />;
      default:
        return <InsertDriveFile />;
    }
  };

  const getFileType = (fileName) => {
    if (!fileName) return "Document";
    const extension = fileName.split(".").pop()?.toLowerCase();
    switch (extension) {
      case "pdf":
        return "PDF Document";
      case "jpg":
      case "jpeg":
        return "JPEG Image";
      case "png":
        return "PNG Image";
      default:
        return `${extension?.toUpperCase()} File`;
    }
  };

  const handleDownloadProof = async (expense) => {
    if (downloading) return;
    setDownloading(true);
    try {
      const proofUrl = getProofUrl(expense);
      if (proofUrl) {
        window.open(proofUrl, "_blank");
      }
    } catch (error) {
      console.error("Error downloading:", error);
    } finally {
      setTimeout(() => setDownloading(false), 1000);
    }
  };

  const hasProof = (expense) => !!(expense?.proofUrl || expense?.proof);

  const getProofUrl = (expense) => {
    if (expense?.proofUrl) {
      return expense.proofUrl;
    } else if (expense?.proof) {
      if (expense.proof.startsWith("http")) {
        return expense.proof;
      }
      return `${
        import.meta.env.REACT_APP_API_URL || window.location.origin
      }/uploads/${expense.proof}`;
    }
    return null;
  };

  const getDisplayFileName = (expense) => {
    if (expense?.proof) {
      if (!expense.proof.startsWith("http")) {
        return expense.proof;
      }
    }
    if (expense?.proofUrl) {
      return expense.proofUrl.split("/").pop() || `expense-proof-${expense.id}`;
    }
    return "Document";
  };

  const isImageFile = (fileName) => {
    if (!fileName) return false;
    const extension = fileName.split(".").pop()?.toLowerCase();
    return ["jpg", "jpeg", "png", "gif", "bmp", "webp", "svg"].includes(
      extension,
    );
  };

  const isPdfFile = (fileName) => {
    if (!fileName) return false;
    const extension = fileName.split(".").pop()?.toLowerCase();
    return extension === "pdf";
  };

  const renderPreviewContent = () => {
    if (!previewUrl) return null;
    const fileName = previewUrl.split("/").pop() || "document";

    if (isImageFile(fileName)) {
      return (
        <Box sx={{ textAlign: "center", p: 2 }}>
          <img
            src={previewUrl}
            alt="Proof"
            style={{
              maxWidth: "100%",
              maxHeight: "70vh",
              objectFit: "contain",
              borderRadius: "8px",
            }}
          />
        </Box>
      );
    } else if (isPdfFile(fileName)) {
      return (
        <Box sx={{ width: "100%", height: "70vh" }}>
          <iframe
            src={previewUrl}
            width="100%"
            height="100%"
            style={{ border: "none", borderRadius: "8px" }}
            title="PDF Preview"
          />
        </Box>
      );
    } else {
      return (
        <Box sx={{ textAlign: "center", p: 4 }}>
          <Description sx={{ fontSize: 64, color: "primary.main", mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            Preview Not Available
          </Typography>
          <Button
            variant="contained"
            startIcon={<Download />}
            onClick={() => window.open(previewUrl, "_blank")}
          >
            Download File
          </Button>
        </Box>
      );
    }
  };

  // const getStatus = (expense) => {
  //   if (expense?.isReimbursed) return "reimbursed";
  //   if (expense?.fromReimbursement) return "pending";
  //   return "allocated";
  // };

  // const getStatusText = (expense) => {
  //   const status = getStatus(expense);
  //   switch (status) {
  //     case "reimbursed":
  //       return "Reimbursed";
  //     case "pending":
  //       return "Pending";
  //     default:
  //       return "Allocated";
  //   }
  // };

  return (
    <>
      <EnhancedSectionCard>
        {/* Filters Section */}
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
                Expense Management
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: "#64748b",
                  fontFamily: '"Poppins", sans-serif',
                }}
              >
                {meta?.total || 0} total expenses • Showing{" "}
                {expenses?.length || 0} entries
              </Typography>
            </Box>

            <Stack
              direction="row"
              spacing={2}
              alignItems="center"
              sx={{ width: { xs: "100%", sm: "auto" } }}
            >
              {role === "superadmin" && !disableFilters && (
                <SearchField
                  placeholder="Search expenses..."
                  size="small"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  sx={{ width: { xs: "100%", sm: 200 } }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon
                          fontSize="small"
                          sx={{ color: "#94a3b8" }}
                        />
                      </InputAdornment>
                    ),
                  }}
                />
              )}

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
                  {[5, 10, 20, 50].map((n) => (
                    <MenuItem
                      key={n}
                      value={n}
                      sx={{ fontFamily: '"Poppins", sans-serif' }}
                    >
                      {n}
                    </MenuItem>
                  ))}
                </StyledSelect>
              </Box>
            </Stack>
          </Stack>

          {role === "superadmin" && !disableFilters && (
            <Stack direction="row" spacing={2} sx={{ mt: 2, flexWrap: "wrap" }}>
              <Box sx={{ minWidth: 200, flex: 1 }}>
                <InputLabel
                  sx={{
                    fontSize: "0.75rem",
                    color: "#64748b",
                    fontFamily: '"Poppins", sans-serif',
                  }}
                >
                  Department
                </InputLabel>
                <StyledSelect
                  value={currentDepartment?.id || ""}
                  onChange={(e) => {
                    const value = e.target.value;

                    if (!value) {
                      // All Departments (DEFAULT)
                      setCurrentDepartment(null);
                      setCurrentSubDepartment(null);
                    } else {
                      const dept = departments.find((d) => d.id === value);
                      setCurrentDepartment(dept || null);
                      setCurrentSubDepartment(null);
                    }

                    setPage(1); // 🔥 CRITICAL: force API refetch
                  }}
                  size="small"
                  fullWidth
                >
                  <MenuItem value="">All Departments</MenuItem>
                  {departments?.map((dept) => (
                    <MenuItem
                      key={dept.id}
                      value={dept.id}
                      sx={{ fontFamily: '"Poppins", sans-serif' }}
                    >
                      {dept.name}
                    </MenuItem>
                  ))}
                </StyledSelect>
              </Box>

              <Box sx={{ minWidth: 200, flex: 1 }}>
                <InputLabel
                  sx={{
                    fontSize: "0.75rem",
                    color: "#64748b",
                    fontFamily: '"Poppins", sans-serif',
                  }}
                >
                  Sub-Department
                </InputLabel>
                <StyledSelect
                  value={currentSubDepartment?.id || ""}
                  onChange={(e) => {
                    const value = e.target.value;

                    if (!value) {
                      // All Sub-Departments selected
                      setCurrentSubDepartment(null);
                    } else {
                      const sub = subDepartments.find((s) => s.id === value);
                      setCurrentSubDepartment(sub || null);
                    }

                    setPage(1); // 🔥 force refetch
                  }}
                  size="small"
                  fullWidth
                  disabled={!currentDepartment}
                >
                  <MenuItem value="">All Sub-Departments</MenuItem>

                  {subDepartments?.map((sub) => (
                    <MenuItem
                      key={sub.id}
                      value={sub.id}
                      sx={{ fontFamily: '"Poppins", sans-serif' }}
                    >
                      {sub.name}
                    </MenuItem>
                  ))}
                </StyledSelect>
              </Box>
            </Stack>
          )}
        </Box>

        <Divider />

        {/* Table Section */}
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                {role === "superadmin" && (
                  <StyledTableCell>User</StyledTableCell>
                )}
                <StyledTableCell>Amount</StyledTableCell>
                <StyledTableCell>Department</StyledTableCell>
                <StyledTableCell>Sub-Department</StyledTableCell>
                <StyledTableCell>Vendor</StyledTableCell>
                <StyledTableCell>Date</StyledTableCell>
                {showViewDetails && (
                  <StyledTableCell align="center">Actions</StyledTableCell>
                )}
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <StyledTableCell
                    colSpan={showViewDetails ? 8 : 7}
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
                      Loading expenses...
                    </Typography>
                  </StyledTableCell>
                </TableRow>
              ) : expenses?.length > 0 ? (
                expenses.map((row) => (
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
                        <AttachMoney sx={{ color: "#ef4444", fontSize: 16 }} />
                        <Typography
                          sx={{
                            fontWeight: 600,
                            fontSize: "0.875rem",
                            color: "#ef4444",
                            fontFamily: '"Poppins", sans-serif',
                          }}
                        >
                          ₹{row?.amount?.toLocaleString()}
                        </Typography>
                      </Stack>
                    </StyledTableCell>
                    <StyledTableCell>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Category sx={{ color: "#8b5cf6", fontSize: 16 }} />
                        <Typography
                          sx={{
                            fontSize: "0.875rem",
                            fontFamily: '"Poppins", sans-serif',
                            textTransform: "capitalize",
                          }}
                        >
                          {row?.department?.name || "-"}
                        </Typography>
                      </Stack>
                    </StyledTableCell>
                    <StyledTableCell>
                      <Typography
                        sx={{
                          fontSize: "0.875rem",
                          color: "#64748b",
                          fontFamily: '"Poppins", sans-serif',
                          textTransform: "capitalize",
                        }}
                      >
                        {row?.subDepartment?.name || "-"}
                      </Typography>
                    </StyledTableCell>
                    <StyledTableCell>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Business sx={{ color: "#f59e0b", fontSize: 16 }} />
                        <Typography
                          sx={{
                            fontSize: "0.875rem",
                            fontFamily: '"Poppins", sans-serif',
                            textTransform: "capitalize",
                          }}
                        >
                          {row?.vendor || "-"}
                        </Typography>
                      </Stack>
                    </StyledTableCell>
                    <StyledTableCell>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <CalendarToday
                          sx={{ color: "#10b981", fontSize: 16 }}
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

                    {showViewDetails && (
                      <StyledTableCell align="center">
                        <Tooltip title="View Details">
                          <IconButton
                            onClick={() => handleViewDetails(row)}
                            sx={{
                              color: "#3b82f6",
                              "&:hover": {
                                backgroundColor: "rgba(59, 130, 246, 0.1)",
                              },
                            }}
                            size="small"
                          >
                            <Visibility fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </StyledTableCell>
                    )}
                  </StyledTableRow>
                ))
              ) : (
                <TableRow>
                  <StyledTableCell
                    colSpan={showViewDetails ? 8 : 7}
                    align="center"
                    sx={{ py: 6 }}
                  >
                    <Box sx={{ textAlign: "center" }}>
                      <Receipt sx={{ fontSize: 48, color: "#cbd5e1", mb: 2 }} />
                      <Typography
                        sx={{
                          color: "#64748b",
                          fontFamily: '"Poppins", sans-serif',
                          mb: 1,
                        }}
                      >
                        No expenses found
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
        {meta?.total > 0 && (
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
      </EnhancedSectionCard>

      {/* View Details Modal */}
      {showViewDetails && selectedExpense && (
        <Modal
          open={viewModalOpen}
          onClose={handleCloseModal}
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: '"Poppins", sans-serif',
            p: 2,
          }}
        >
          <Paper
            sx={{
              width: 700,
              maxWidth: "95vw",
              maxHeight: "90vh",
              borderRadius: 3,
              boxShadow: "0 24px 80px rgba(0,0,0,0.2)",
              outline: "none",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {/* Header */}
            <Box
              sx={{
                p: 3,
                backgroundColor: "#3b82f6",
                color: "white",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexShrink: 0,
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 2,
                    backgroundColor: "rgba(255, 255, 255, 0.2)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Receipt sx={{ fontSize: 28 }} />
                </Box>
                <Box>
                  <Typography
                    variant="h5"
                    component="h2"
                    fontWeight="700"
                    fontFamily='"Poppins", sans-serif'
                    sx={{ lineHeight: 1.2 }}
                  >
                    Expense Details
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{ opacity: 0.9, display: "block", mt: 0.5 }}
                  >
                    ID: {selectedExpense.id?.slice(-8) || "N/A"}
                  </Typography>
                </Box>
              </Box>
              <IconButton
                onClick={handleCloseModal}
                sx={{
                  color: "white",
                  "&:hover": { backgroundColor: "rgba(255, 255, 255, 0.1)" },
                }}
                size="small"
              >
                <Close />
              </IconButton>
            </Box>

            {/* Content - Scrollable */}
            <Box
              sx={{
                p: 3,
                overflowY: "auto",
                flex: 1,
                backgroundColor: "#f8fafc",
              }}
            >
              <Grid container spacing={3}>
                {/* Amount Card - Full Width */}
                <Grid item xs={12}>
                  <Paper
                    sx={{
                      p: 3,
                      borderRadius: 2,
                      background:
                        "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
                      border: "1px solid #e2e8f0",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <Box>
                        <Typography
                          variant="caption"
                          sx={{
                            color: "#64748b",
                            fontWeight: 500,
                            fontSize: "0.875rem",
                            textTransform: "uppercase",
                            letterSpacing: "0.5px",
                          }}
                        >
                          Total Amount
                        </Typography>
                        <Typography
                          variant="h2"
                          sx={{
                            fontWeight: 700,
                            color: "#ef4444",
                            mt: 0.5,
                            fontSize: { xs: "2rem", sm: "2.5rem" },
                          }}
                        >
                          ₹{selectedExpense.amount?.toLocaleString()}
                        </Typography>
                      </Box>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          width: 64,
                          height: 64,
                          borderRadius: "50%",
                          backgroundColor: "#fee2e2",
                          color: "#ef4444",
                        }}
                      >
                        <AttachMoney sx={{ fontSize: 32 }} />
                      </Box>
                    </Box>
                  </Paper>
                </Grid>

                {/* Details Section */}
                <Grid item xs={12}>
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
                    <Business sx={{ fontSize: 20 }} />
                    Expense Information
                  </Typography>

                  <Grid container spacing={2.5}>
                    {/* Department */}
                    <Grid item xs={12} sm={6}>
                      <Paper
                        sx={{
                          p: 2.5,
                          borderRadius: 2,
                          backgroundColor: "white",
                          border: "1px solid #e2e8f0",
                          height: "100%",
                          transition: "all 0.2s ease",
                          "&:hover": {
                            borderColor: "#cbd5e0",
                            boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                          },
                        }}
                      >
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 2,
                            mb: 1.5,
                          }}
                        >
                          <Box
                            sx={{
                              width: 40,
                              height: 40,
                              borderRadius: 1,
                              backgroundColor: "#e0f2fe",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              color: "#0369a1",
                            }}
                          >
                            <Category sx={{ fontSize: 20 }} />
                          </Box>
                          <Box sx={{ flex: 1 }}>
                            <Typography
                              variant="caption"
                              sx={{
                                color: "#64748b",
                                fontWeight: 500,
                                fontSize: "0.75rem",
                                display: "block",
                              }}
                            >
                              Department
                            </Typography>
                            <Typography
                              variant="body1"
                              sx={{
                                fontWeight: 600,
                                color: "#1e293b",
                                fontSize: "1rem",
                                textTransform: "capitalize",
                              }}
                            >
                              {selectedExpense.department?.name || "-"}
                            </Typography>
                          </Box>
                        </Box>
                      </Paper>
                    </Grid>

                    {/* Sub-Department */}
                    <Grid item xs={12} sm={6}>
                      <Paper
                        sx={{
                          p: 2.5,
                          borderRadius: 2,
                          backgroundColor: "white",
                          border: "1px solid #e2e8f0",
                          height: "100%",
                          transition: "all 0.2s ease",
                          "&:hover": {
                            borderColor: "#cbd5e0",
                            boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                          },
                        }}
                      >
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 2,
                            mb: 1.5,
                          }}
                        >
                          <Box
                            sx={{
                              width: 40,
                              height: 40,
                              borderRadius: 1,
                              backgroundColor: "#f0f9ff",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              color: "#0ea5e9",
                            }}
                          >
                            <Business sx={{ fontSize: 20 }} />
                          </Box>
                          <Box sx={{ flex: 1 }}>
                            <Typography
                              variant="caption"
                              sx={{
                                color: "#64748b",
                                fontWeight: 500,
                                fontSize: "0.75rem",
                                display: "block",
                              }}
                            >
                              Sub-Department
                            </Typography>
                            <Typography
                              variant="body1"
                              sx={{
                                fontWeight: 600,
                                color: "#1e293b",
                                fontSize: "1rem",
                                textTransform: "capitalize",
                              }}
                            >
                              {selectedExpense.subDepartment?.name || "-"}
                            </Typography>
                          </Box>
                        </Box>
                      </Paper>
                    </Grid>

                    {/* Vendor */}
                    <Grid item xs={12} sm={6}>
                      <Paper
                        sx={{
                          p: 2.5,
                          borderRadius: 2,
                          backgroundColor: "white",
                          border: "1px solid #e2e8f0",
                          height: "100%",
                          transition: "all 0.2s ease",
                          "&:hover": {
                            borderColor: "#cbd5e0",
                            boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                          },
                        }}
                      >
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 2,
                            mb: 1.5,
                          }}
                        >
                          <Box
                            sx={{
                              width: 40,
                              height: 40,
                              borderRadius: 1,
                              backgroundColor: "#fef3c7",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              color: "#d97706",
                            }}
                          >
                            <Person sx={{ fontSize: 20 }} />
                          </Box>
                          <Box sx={{ flex: 1 }}>
                            <Typography
                              variant="caption"
                              sx={{
                                color: "#64748b",
                                fontWeight: 500,
                                fontSize: "0.75rem",
                                display: "block",
                              }}
                            >
                              Vendor
                            </Typography>
                            <Typography
                              variant="body1"
                              sx={{
                                fontWeight: 600,
                                color: "#1e293b",
                                fontSize: "1rem",
                                textTransform: "capitalize",
                              }}
                            >
                              {selectedExpense.vendor || "-"}
                            </Typography>
                          </Box>
                        </Box>
                      </Paper>
                    </Grid>

                    {/* Date */}
                    <Grid item xs={12} sm={6}>
                      <Paper
                        sx={{
                          p: 2.5,
                          borderRadius: 2,
                          backgroundColor: "white",
                          border: "1px solid #e2e8f0",
                          height: "100%",
                          transition: "all 0.2s ease",
                          "&:hover": {
                            borderColor: "#cbd5e0",
                            boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                          },
                        }}
                      >
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 2,
                            mb: 1.5,
                          }}
                        >
                          <Box
                            sx={{
                              width: 40,
                              height: 40,
                              borderRadius: 1,
                              backgroundColor: "#dcfce7",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              color: "#16a34a",
                            }}
                          >
                            <CalendarToday sx={{ fontSize: 20 }} />
                          </Box>
                          <Box sx={{ flex: 1 }}>
                            <Typography
                              variant="caption"
                              sx={{
                                color: "#64748b",
                                fontWeight: 500,
                                fontSize: "0.75rem",
                                display: "block",
                              }}
                            >
                              Date & Time
                            </Typography>
                            <Typography
                              variant="body2"
                              sx={{
                                fontWeight: 600,
                                color: "#1e293b",
                                fontSize: "0.875rem",
                              }}
                            >
                              {selectedExpense.createdAt
                                ? new Date(
                                    selectedExpense.createdAt,
                                  ).toLocaleDateString("en-US", {
                                    weekday: "short",
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                  })
                                : "-"}
                            </Typography>
                            <Typography
                              variant="caption"
                              sx={{
                                color: "#64748b",
                                display: "block",
                                mt: 0.25,
                              }}
                            >
                              {selectedExpense.createdAt
                                ? new Date(
                                    selectedExpense.createdAt,
                                  ).toLocaleTimeString("en-US", {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                    hour12: true,
                                  })
                                : ""}
                            </Typography>
                          </Box>
                        </Box>
                      </Paper>
                    </Grid>
                  </Grid>
                </Grid>

                {/* Proof Document Section */}
                {hasProof(selectedExpense) && (
                  <Grid item xs={12}>
                    <Paper
                      sx={{
                        p: 3,
                        borderRadius: 2,
                        backgroundColor: "white",
                        border: "1px solid #e2e8f0",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                      }}
                    >
                      <Typography
                        variant="subtitle1"
                        sx={{
                          color: "#1e293b",
                          fontWeight: 600,
                          mb: 3,
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                        }}
                      >
                        <Description sx={{ fontSize: 20 }} />
                        Proof Document
                      </Typography>

                      <Box
                        sx={{
                          p: 3,
                          borderRadius: 2,
                          backgroundColor: "#f8fafc",
                          border: "1px solid #e2e8f0",
                          mb: 3,
                        }}
                      >
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 3 }}
                        >
                          <Box
                            sx={{
                              width: 64,
                              height: 64,
                              borderRadius: 2,
                              backgroundColor: "#dbeafe",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              color: "#3b82f6",
                              flexShrink: 0,
                            }}
                          >
                            {getFileIcon(getDisplayFileName(selectedExpense))}
                          </Box>
                          <Box sx={{ flex: 1 }}>
                            <Typography
                              variant="body1"
                              sx={{
                                fontWeight: 600,
                                color: "#1e293b",
                                mb: 0.5,
                              }}
                            >
                              {getFileType(getDisplayFileName(selectedExpense))}
                            </Typography>
                            <Typography
                              variant="caption"
                              sx={{
                                color: "#64748b",
                                display: "block",
                                wordBreak: "break-all",
                              }}
                            >
                              {getDisplayFileName(selectedExpense)}
                            </Typography>
                            <Chip
                              label={`${
                                getFileType(
                                  getDisplayFileName(selectedExpense),
                                ).split(" ")[0]
                              } File`}
                              size="small"
                              sx={{
                                mt: 1.5,
                                backgroundColor: "rgba(59, 130, 246, 0.1)",
                                color: "#3b82f6",
                                fontWeight: 500,
                                fontSize: "0.75rem",
                              }}
                            />
                          </Box>
                        </Box>
                      </Box>

                      <Stack
                        direction="row"
                        spacing={2}
                        justifyContent="center"
                      >
                        <Button
                          variant="contained"
                          startIcon={<Download />}
                          onClick={() => handleDownloadProof(selectedExpense)}
                          disabled={downloading}
                          sx={{
                            borderRadius: 2,
                            px: 4,
                            py: 1.5,
                            background:
                              "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
                            boxShadow: "0 4px 15px rgba(59, 130, 246, 0.3)",
                            "&:hover": {
                              background:
                                "linear-gradient(135deg, #2563eb 0%, #1e40af 100%)",
                              boxShadow: "0 6px 20px rgba(59, 130, 246, 0.4)",
                            },
                          }}
                        >
                          {downloading ? "Downloading..." : "Download Document"}
                        </Button>
                        <Button
                          variant="outlined"
                          startIcon={<Visibility />}
                          onClick={() => handlePreviewProof(selectedExpense)}
                          disabled={previewing}
                          sx={{
                            borderRadius: 2,
                            px: 4,
                            py: 1.5,
                            borderColor: "#3b82f6",
                            color: "#3b82f6",
                            "&:hover": {
                              backgroundColor: "rgba(59, 130, 246, 0.08)",
                              borderColor: "#2563eb",
                            },
                          }}
                        >
                          {previewing ? "Opening..." : "Preview Document"}
                        </Button>
                      </Stack>
                    </Paper>
                  </Grid>
                )}

                {/* Description Section */}
                {selectedExpense.description && (
                  <Grid item xs={12}>
                    <Paper
                      sx={{
                        p: 3,
                        borderRadius: 2,
                        backgroundColor: "white",
                        border: "1px solid #e2e8f0",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                      }}
                    >
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
                        <Description sx={{ fontSize: 20 }} />
                        Description
                      </Typography>
                      <Box
                        sx={{
                          p: 2.5,
                          borderRadius: 1.5,
                          backgroundColor: "#f8fafc",
                          border: "1px solid #e2e8f0",
                        }}
                      >
                        <Typography
                          variant="body1"
                          sx={{
                            color: "#334155",
                            lineHeight: 1.7,
                            whiteSpace: "pre-wrap",
                          }}
                        >
                          {selectedExpense.description}
                        </Typography>
                      </Box>
                    </Paper>
                  </Grid>
                )}
              </Grid>
            </Box>

            {/* Footer */}
            <Box
              sx={{
                p: 2.5,
                borderTop: "1px solid #e2e8f0",
                backgroundColor: "white",
                display: "flex",
                justifyContent: "flex-end",
                gap: 2,
                flexShrink: 0,
              }}
            >
              <Button
                onClick={handleCloseModal}
                variant="outlined"
                sx={{
                  borderRadius: 2,
                  px: 4,
                  py: 1,
                  borderColor: "#e2e8f0",
                  color: "#64748b",
                  "&:hover": {
                    borderColor: "#cbd5e0",
                    backgroundColor: "#f8fafc",
                  },
                }}
              >
                Cancel
              </Button>
            </Box>
          </Paper>
        </Modal>
      )}

      {/* Preview Modal */}
      {/* Preview Modal */}
      <Modal
        open={previewModalOpen}
        onClose={handleClosePreviewModal}
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: '"Poppins", sans-serif',
          p: 2,
          backdropFilter: "blur(8px)",
        }}
      >
        <Paper
          sx={{
            width: "95vw",
            height: "95vh",
            maxWidth: "1400px",
            maxHeight: "900px",
            borderRadius: 3,
            boxShadow: "0 32px 100px rgba(0,0,0,0.25)",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            position: "relative",
            border: "1px solid rgba(226, 232, 240, 0.5)",
            backgroundColor: "#ffffff",
          }}
        >
          {/* Header */}
          <Box
            sx={{
              p: 3,
              background: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
              color: "white",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexShrink: 0,
              borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: 2,
                  backgroundColor: "rgba(255, 255, 255, 0.2)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  backdropFilter: "blur(10px)",
                }}
              >
                <Description sx={{ fontSize: 28 }} />
              </Box>
              <Box>
                <Typography
                  variant="h5"
                  component="h2"
                  fontWeight="700"
                  fontFamily='"Poppins", sans-serif'
                  sx={{ lineHeight: 1.2 }}
                >
                  Document Preview
                </Typography>
                <Typography
                  variant="caption"
                  sx={{ opacity: 0.9, display: "block", mt: 0.5 }}
                >
                  {previewUrl.split("/").pop() || "Document"}
                </Typography>
              </Box>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Chip
                label={getFileType(previewUrl.split("/").pop())}
                size="small"
                sx={{
                  backgroundColor: "rgba(255, 255, 255, 0.2)",
                  color: "white",
                  fontWeight: 500,
                  fontFamily: '"Poppins", sans-serif',
                  height: 28,
                }}
              />
              <IconButton
                onClick={handleClosePreviewModal}
                sx={{
                  color: "white",
                  backgroundColor: "rgba(255, 255, 255, 0.1)",
                  "&:hover": { backgroundColor: "rgba(255, 255, 255, 0.2)" },
                  transition: "all 0.2s ease",
                  width: 40,
                  height: 40,
                }}
              >
                <Close />
              </IconButton>
            </Box>
          </Box>

          {/* Content Container */}
          <Box
            sx={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
              backgroundColor: "#f8fafc",
              position: "relative",
            }}
          >
            {/* Preview Controls Bar */}
            <Box
              sx={{
                p: 2,
                backgroundColor: "white",
                borderBottom: "1px solid #e2e8f0",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexShrink: 0,
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    px: 2,
                    py: 1,
                    borderRadius: 2,
                    backgroundColor: "#f8fafc",
                    border: "1px solid #e2e8f0",
                  }}
                >
                  <Box
                    sx={{
                      width: 24,
                      height: 24,
                      borderRadius: 1,
                      backgroundColor: "#3b82f6",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "white",
                    }}
                  >
                    {getFileIcon(previewUrl.split("/").pop())}
                  </Box>
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: 500,
                      color: "#334155",
                      fontFamily: '"Poppins", sans-serif',
                    }}
                  >
                    Previewing: {previewUrl.split("/").pop()?.substring(0, 30)}
                    {previewUrl.split("/").pop()?.length > 30 ? "..." : ""}
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Tooltip title="Zoom In">
                  <IconButton
                    size="small"
                    sx={{
                      backgroundColor: "#f8fafc",
                      border: "1px solid #e2e8f0",
                      "&:hover": { backgroundColor: "#f1f5f9" },
                    }}
                  >
                    <Typography sx={{ fontWeight: 600, fontSize: "0.875rem" }}>
                      +
                    </Typography>
                  </IconButton>
                </Tooltip>
                <Tooltip title="Zoom Out">
                  <IconButton
                    size="small"
                    sx={{
                      backgroundColor: "#f8fafc",
                      border: "1px solid #e2e8f0",
                      "&:hover": { backgroundColor: "#f1f5f9" },
                    }}
                  >
                    <Typography sx={{ fontWeight: 600, fontSize: "0.875rem" }}>
                      -
                    </Typography>
                  </IconButton>
                </Tooltip>
                <Tooltip title="Rotate">
                  <IconButton
                    size="small"
                    sx={{
                      backgroundColor: "#f8fafc",
                      border: "1px solid #e2e8f0",
                      "&:hover": { backgroundColor: "#f1f5f9" },
                    }}
                  >
                    <Typography sx={{ fontWeight: 600, fontSize: "0.875rem" }}>
                      ↻
                    </Typography>
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>

            {/* Preview Content Area */}
            <Box
              sx={{
                flex: 1,
                p: 3,
                overflow: "auto",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                position: "relative",
                backgroundColor: "#f1f5f9",
              }}
            >
              <Paper
                sx={{
                  width: "100%",
                  height: "100%",
                  borderRadius: 2,
                  boxShadow: "0 8px 32px rgba(0,0,0,0.08)",
                  overflow: "hidden",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: "white",
                  position: "relative",
                }}
              >
                {renderPreviewContent()}

                {/* Loading Overlay */}
                {previewing && (
                  <Box
                    sx={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor: "rgba(255, 255, 255, 0.9)",
                      zIndex: 1,
                      borderRadius: 2,
                    }}
                  >
                    <Box sx={{ textAlign: "center" }}>
                      <CircularProgress
                        size={48}
                        sx={{ color: "#3b82f6", mb: 2 }}
                      />
                      <Typography
                        variant="body1"
                        sx={{
                          color: "#334155",
                          fontWeight: 500,
                          fontFamily: '"Poppins", sans-serif',
                        }}
                      >
                        Loading document...
                      </Typography>
                    </Box>
                  </Box>
                )}

                {/* Error State */}
                {!previewUrl && (
                  <Box sx={{ textAlign: "center", p: 6 }}>
                    <Box
                      sx={{
                        width: 80,
                        height: 80,
                        borderRadius: "50%",
                        backgroundColor: "#fee2e2",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        mx: "auto",
                        mb: 3,
                      }}
                    >
                      <Close sx={{ fontSize: 40, color: "#ef4444" }} />
                    </Box>
                    <Typography
                      variant="h6"
                      sx={{
                        color: "#1e293b",
                        fontWeight: 600,
                        mb: 1,
                        fontFamily: '"Poppins", sans-serif',
                      }}
                    >
                      Document Not Available
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color: "#64748b",
                        mb: 3,
                        fontFamily: '"Poppins", sans-serif',
                      }}
                    >
                      The document could not be loaded or is not available for
                      preview.
                    </Typography>
                  </Box>
                )}
              </Paper>
            </Box>

            {/* Footer Controls */}
            <Box
              sx={{
                p: 3,
                backgroundColor: "white",
                borderTop: "1px solid #e2e8f0",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexShrink: 0,
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 3 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: 2,
                      backgroundColor: "#f0f9ff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#0369a1",
                    }}
                  >
                    <Description sx={{ fontSize: 20 }} />
                  </Box>
                  <Box>
                    <Typography
                      variant="caption"
                      sx={{
                        color: "#64748b",
                        fontWeight: 500,
                        display: "block",
                        fontFamily: '"Poppins", sans-serif',
                      }}
                    >
                      File Details
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 600,
                        color: "#1e293b",
                        fontFamily: '"Poppins", sans-serif',
                      }}
                    >
                      {previewUrl.split("/").pop() || "Unknown"}
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      backgroundColor: "#10b981",
                    }}
                  />
                  <Typography
                    variant="caption"
                    sx={{
                      color: "#64748b",
                      fontFamily: '"Poppins", sans-serif',
                    }}
                  >
                    Preview Mode • Secure
                  </Typography>
                </Box>
              </Box>

              <Stack direction="row" spacing={2}>
                <Button
                  variant="outlined"
                  startIcon={<Close />}
                  onClick={handleClosePreviewModal}
                  sx={{
                    borderRadius: 2,
                    px: 3,
                    py: 1.25,
                    borderColor: "#e2e8f0",
                    color: "#64748b",
                    fontWeight: 500,
                    fontFamily: '"Poppins", sans-serif',
                    "&:hover": {
                      borderColor: "#cbd5e0",
                      backgroundColor: "#f8fafc",
                    },
                  }}
                >
                  Close Preview
                </Button>
                <Button
                  variant="contained"
                  startIcon={<Download />}
                  onClick={() => window.open(previewUrl, "_blank")}
                  sx={{
                    borderRadius: 2,
                    px: 3,
                    py: 1.25,
                    background:
                      "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
                    boxShadow: "0 4px 15px rgba(59, 130, 246, 0.3)",
                    fontWeight: 500,
                    fontFamily: '"Poppins", sans-serif',
                    "&:hover": {
                      background:
                        "linear-gradient(135deg, #2563eb 0%, #1e40af 100%)",
                      boxShadow: "0 6px 20px rgba(59, 130, 246, 0.4)",
                    },
                  }}
                >
                  Download Document
                </Button>
              </Stack>
            </Box>
          </Box>

          {/* Edge Decoration */}
          <Box
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: 4,
              background: "linear-gradient(90deg, #3b82f6, #8b5cf6, #ec4899)",
            }}
          />
        </Paper>
      </Modal>
    </>
  );
};

export default ExpenseTable;
