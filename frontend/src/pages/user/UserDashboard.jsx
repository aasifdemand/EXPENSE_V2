import {
  Box,
  Card,
  CardContent,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  alpha,
  Avatar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Pagination,
  Divider,
  IconButton,
  Tooltip,
  Modal,
  Button,
  Stack,
  InputLabel as MuiInputLabel,
  Select as MuiSelect,
  TextField,
  Chip,
  Alert,
  Paper,
} from "@mui/material";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  DoneAll,
  Edit,
  Visibility,
  Download,
  PictureAsPdf,
  InsertDriveFile,
  Image,
  Description,
  Close,
} from "@mui/icons-material";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import TimelineIcon from "@mui/icons-material/Timeline";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import { fetchReimbursementsForUser } from "../../store/reimbursementSlice";
import { fetchExpensesForUser } from "../../store/expenseSlice";
import { fetchUserBudgets } from "../../store/budgetSlice";
import ListItemButton from "@mui/material/ListItemButton";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from "recharts";

// Custom styled components
const SectionCard = ({ children, sx }) => (
  <Card
    sx={{
      borderRadius: 2,
      boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
      border: "1px solid rgba(0,0,0,0.05)",
      overflow: "hidden",
      ...sx,
    }}
  >
    {children}
  </Card>
);

const StyledTextField = ({ sx, ...props }) => (
  <TextField
    sx={{
      "& .MuiOutlinedInput-root": {
        borderRadius: 1,
        backgroundColor: "white",
        "&:hover .MuiOutlinedInput-notchedOutline": {
          borderColor: "#3b82f6",
        },
      },
      ...sx,
    }}
    {...props}
  />
);

const StyledFormControl = ({ sx, ...props }) => (
  <FormControl
    sx={{
      "& .MuiOutlinedInput-root": {
        borderRadius: 1,
        backgroundColor: "white",
      },
      ...sx,
    }}
    {...props}
  />
);

const StyledSelect = ({ sx, ...props }) => (
  <MuiSelect
    sx={{
      borderRadius: 1,
      "& .MuiOutlinedInput-notchedOutline": {
        borderColor: "rgba(0,0,0,0.15)",
      },
      "&:hover .MuiOutlinedInput-notchedOutline": {
        borderColor: "#3b82f6",
      },
      ...sx,
    }}
    {...props}
  />
);

// Stats Cards Section
const StatsCardsSection = ({ budgetStats }) => {
  return (
    <Box sx={{ mb: 4 }}>
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          gap: 2,
          justifyContent: "flex-start",
        }}
      >
        {budgetStats.map((stat, index) => (
          <Box
            key={index}
            sx={{
              flex: { xs: "1 1 100%", sm: "1 1 calc(50% - 10px)", md: "1 1 0" },
              minWidth: { xs: "100%", sm: "240px" },
            }}
          >
            <StatCard stat={stat} />
          </Box>
        ))}
      </Box>
    </Box>
  );
};

// StatCard Component
const StatCard = ({ stat }) => (
  <Card
    sx={{
      background: "#ffffff",
      borderRadius: "16px",
      boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
      border: "1px solid rgba(226, 232, 240, 0.8)",
      height: { xs: "140px", sm: "150px", md: "160px" },
      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
      position: "relative",
      overflow: "hidden",
      flex: 1,
      minWidth: 0,
      maxWidth: "100%",
      "&:hover": {
        transform: { xs: "none", sm: "translateY(-4px)" },
        boxShadow: {
          xs: "0 4px 20px rgba(0, 0, 0, 0.08)",
          sm: "0 8px 32px rgba(0, 0, 0, 0.12)",
        },
      },
      "&::before": {
        content: '""',
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        height: "3px",
        background: `linear-gradient(90deg, ${stat.color} 0%, ${alpha(
          stat.color,
          0.7,
        )} 100%)`,
      },
    }}
  >
    <CardContent
      sx={{
        p: { xs: 2.5, sm: 3 },
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}
    >
      {/* Top Section - Icon and Amount */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          mb: { xs: 2, sm: 2.5 },
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, flex: 1 }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: { xs: 44, sm: 48, md: 52 },
              height: { xs: 44, sm: 48, md: 52 },
              borderRadius: "12px",
              backgroundColor: alpha(stat.color, 0.1),
              color: stat.color,
              flexShrink: 0,
            }}
          >
            {stat.icon}
          </Box>

          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              variant="h4"
              sx={{
                color: "#1e293b",
                fontWeight: 700,
                fontSize: {
                  xs: "1.3rem",
                  sm: "1.5rem",
                  md: "1.7rem",
                  lg: "1.9rem",
                },
                lineHeight: 1.1,
                wordBreak: "break-word",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {stat.value}
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Bottom Section - Title and Subtitle */}
      <Box sx={{ minWidth: 0 }}>
        <Typography
          variant="h6"
          sx={{
            color: "#1e293b",
            fontWeight: 700,
            fontSize: { xs: "0.9rem", sm: "1rem", md: "1.1rem" },
            lineHeight: 1.2,
            mb: 1,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {stat.title}
        </Typography>

        <Typography
          variant="body2"
          sx={{
            color: "#6b7280",
            fontSize: { xs: "0.75rem", sm: "0.8rem", md: "0.85rem" },
            fontWeight: 500,
            lineHeight: 1.3,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {stat.subtitle}
        </Typography>
      </Box>
    </CardContent>
  </Card>
);

// TabButtonsWithReport Component
const TabButtonsWithReport = ({ activeTab, setActiveTab }) => {
  return (
    <Paper
      elevation={1}
      sx={{
        p: 3,
        mb: 1,
        borderRadius: 2,
        backgroundColor: "white",
        boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
        width: "100%",
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          justifyContent: "space-between",
          alignItems: { xs: "stretch", md: "center" },
          gap: 3,
          width: "100%",
        }}
      >
        {/* Tabs Section */}
        <Box sx={{ flex: { xs: "1 1 100%", md: "0 0 40%" } }}>
          <Typography
            variant="h5"
            sx={{ mb: 2, color: "text.primary", fontWeight: "700" }}
          >
            Recent Activities
          </Typography>
          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
            <Button
              variant={activeTab === "budget" ? "contained" : "outlined"}
              color="primary"
              sx={{
                borderRadius: "8px",
                px: 3,
                py: 1,
                textTransform: "none",
                fontWeight: "600",
                fontSize: "0.975rem",
                boxShadow:
                  activeTab === "budget"
                    ? "0 2px 8px rgba(59, 130, 246, 0.3)"
                    : 0,
                minWidth: "100px",
                backgroundColor:
                  activeTab === "budget" ? "#3b82f6" : "transparent",
                borderColor: "#3b82f6",
                color: activeTab === "budget" ? "white" : "#3b82f6",
                "&:hover": {
                  backgroundColor:
                    activeTab === "budget"
                      ? "#2563eb"
                      : "rgba(59, 130, 246, 0.08)",
                },
              }}
              onClick={() => setActiveTab("budget")}
            >
              Budgets
            </Button>
            <Button
              variant={activeTab === "expense" ? "contained" : "outlined"}
              color="primary"
              sx={{
                borderRadius: "8px",
                px: 3,
                py: 1,
                textTransform: "none",
                fontWeight: "600",
                fontSize: "0.975rem",
                boxShadow:
                  activeTab === "expense"
                    ? "0 2px 8px rgba(239, 68, 68, 0.3)"
                    : 0,
                minWidth: "100px",
                backgroundColor:
                  activeTab === "expense" ? "#ef4444" : "transparent",
                borderColor: "#ef4444",
                color: activeTab === "expense" ? "white" : "#ef4444",
                "&:hover": {
                  backgroundColor:
                    activeTab === "expense"
                      ? "#dc2626"
                      : "rgba(239, 68, 68, 0.08)",
                },
              }}
              onClick={() => setActiveTab("expense")}
            >
              Expenses
            </Button>
          </Box>
        </Box>
      </Box>
    </Paper>
  );
};

// BudgetTable Component
const BudgetTable = ({
  budgets,
  loading,
  meta,
  page = 1,
  setPage,
  limit = 5,
  setLimit,
}) => {
  const { role } = useSelector((state) => state?.auth);

  return (
    <SectionCard>
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 2,
          width: "100%",
          p: 2,
        }}
      >
        {setLimit && (
          <StyledFormControl
            size="medium"
            sx={{
              flex: 1,
              width: "100%",
            }}
          >
            <InputLabel>Rows per page</InputLabel>
            <StyledSelect
              value={limit}
              onChange={(e) => setLimit(Number(e.target.value))}
              label="Rows per page"
            >
              {[5, 10, 20, 50, 70].map((val) => (
                <MenuItem key={val} value={val}>
                  {val}
                </MenuItem>
              ))}
            </StyledSelect>
          </StyledFormControl>
        )}
      </Box>

      <Divider />

      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              {role === "superadmin" && (
                <TableCell
                  sx={{
                    fontWeight: "bold",
                    fontSize: "0.95rem",
                    color: "#1e293b",
                  }}
                >
                  User Name
                </TableCell>
              )}
              <TableCell
                sx={{
                  fontWeight: "bold",
                  fontSize: "0.95rem",
                  color: "#1e293b",
                }}
              >
                Allocated
              </TableCell>
              <TableCell
                sx={{
                  fontWeight: "bold",
                  fontSize: "0.95rem",
                  color: "#1e293b",
                }}
              >
                Spent
              </TableCell>
              <TableCell
                sx={{
                  fontWeight: "bold",
                  fontSize: "0.95rem",
                  color: "#1e293b",
                }}
              >
                Remaining
              </TableCell>
              <TableCell
                sx={{
                  fontWeight: "bold",
                  fontSize: "0.95rem",
                  color: "#1e293b",
                }}
              >
                Company
              </TableCell>
              <TableCell
                sx={{
                  fontWeight: "bold",
                  fontSize: "0.95rem",
                  color: "#1e293b",
                }}
              >
                Date
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell
                  colSpan={role === "superadmin" ? 7 : 6}
                  align="center"
                >
                  <Typography sx={{ py: 2, color: "#6b7280" }}>
                    Loading...
                  </Typography>
                </TableCell>
              </TableRow>
            ) : budgets?.length > 0 ? (
              budgets.map((row) => (
                <TableRow
                  key={row.id}
                  hover
                  sx={{
                    transition: "all 0.2s",
                    "&:hover": { backgroundColor: "#f8fafc" },
                  }}
                >
                  {role === "superadmin" && (
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Avatar
                          sx={{
                            bgcolor: "#3b82f6",
                            width: 32,
                            height: 32,
                            fontSize: 14,
                            fontWeight: 600,
                          }}
                        >
                          {row?.user?.name?.charAt(0).toUpperCase()}
                        </Avatar>
                        <Typography
                          fontWeight={500}
                          sx={{ fontSize: "0.9rem", color: "#1e293b" }}
                        >
                          {row?.user?.name}
                        </Typography>
                      </Box>
                    </TableCell>
                  )}
                  <TableCell
                    sx={{
                      fontWeight: "bold",
                      fontSize: "0.9rem",
                      color: "#059669",
                    }}
                  >
                    ₹{row?.allocatedAmount?.toLocaleString()}
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: "bold",
                      fontSize: "0.9rem",
                      color: "#dc2626",
                    }}
                  >
                    ₹{row?.spentAmount?.toLocaleString()}
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: "bold",
                      fontSize: "0.9rem",
                      color: "#3b82f6",
                    }}
                  >
                    ₹{row?.remainingAmount?.toLocaleString()}
                  </TableCell>
                  <TableCell sx={{ fontSize: "0.9rem", color: "#6b7280" }}>
                    {row?.company}
                  </TableCell>
                  <TableCell sx={{ fontSize: "0.85rem", color: "#6b7280" }}>
                    {row?.createdAt
                      ? new Date(row.createdAt).toLocaleString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: true,
                          timeZone: "Asia/Kolkata",
                        })
                      : "-"}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={role === "superadmin" ? 7 : 6}
                  align="center"
                >
                  <Typography sx={{ py: 2, color: "#6b7280" }}>
                    No budgets found
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {meta?.total > 0 && setPage && (
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          flexWrap="wrap"
          gap={1.5}
          p={2}
        >
          <Typography
            variant="body2"
            color="#6b7280"
            sx={{ fontSize: "0.85rem" }}
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
          />
        </Box>
      )}
    </SectionCard>
  );
};

// ExpenseTable Component
const ExpenseTable = ({
  expenses,
  loading,
  meta,
  page,
  setPage,
  limit,
  setLimit,
}) => {
  const location = useLocation();
  const { role } = useSelector((state) => state?.auth);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [previewing, setPreviewing] = useState(false);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState("");

  const isBudgetingPage = location.pathname.includes("/budgeting");
  const isExpensesPage = location.pathname.includes("/expenses");
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
      const proofUrl = expense?.proofUrl || expense?.proof;
      if (proofUrl) {
        window.open(proofUrl, "_blank");
      }
    } catch (error) {
      console.error("Error downloading:", error);
    } finally {
      setTimeout(() => setDownloading(false), 1000);
    }
  };

  const handlePreviewProof = async (expense) => {
    if (previewing) return;
    setPreviewing(true);
    try {
      const proofUrl = expense?.proofUrl || expense?.proof;
      if (proofUrl) {
        setPreviewUrl(proofUrl);
        setPreviewModalOpen(true);
      }
    } catch (error) {
      console.error("Error previewing:", error);
    } finally {
      setTimeout(() => setPreviewing(false), 500);
    }
  };

  const hasProof = (expense) => !!(expense?.proofUrl || expense?.proof);

  const handleClosePreviewModal = () => {
    setPreviewModalOpen(false);
    setPreviewUrl("");
  };

  const renderPreviewContent = () => {
    if (!previewUrl) return null;
    const fileName = previewUrl.split("/").pop() || "document";

    if (fileName.match(/\.(jpg|jpeg|png|gif|bmp|webp|svg)$/i)) {
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
    } else if (fileName.match(/\.pdf$/i)) {
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

  return (
    <>
      <SectionCard>
        {setLimit && (
          <Box sx={{ p: 2 }}>
            <StyledFormControl sx={{ width: "100%" }}>
              <InputLabel>Rows per page</InputLabel>
              <StyledSelect
                value={limit}
                onChange={(e) => setLimit(Number(e.target.value))}
              >
                {[5, 10, 20, 50].map((n) => (
                  <MenuItem key={n} value={n}>
                    {n}
                  </MenuItem>
                ))}
              </StyledSelect>
            </StyledFormControl>
          </Box>
        )}

        <Divider />

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                {role === "superadmin" && (
                  <TableCell
                    sx={{
                      fontWeight: "bold",
                      fontSize: "0.95rem",
                      color: "#1e293b",
                    }}
                  >
                    User
                  </TableCell>
                )}
                <TableCell
                  sx={{
                    fontWeight: "bold",
                    fontSize: "0.95rem",
                    color: "#1e293b",
                  }}
                >
                  Amount
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: "bold",
                    fontSize: "0.95rem",
                    color: "#1e293b",
                  }}
                >
                  Department
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: "bold",
                    fontSize: "0.95rem",
                    color: "#1e293b",
                  }}
                >
                  Sub-Department
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: "bold",
                    fontSize: "0.95rem",
                    color: "#1e293b",
                  }}
                >
                  Vendor
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: "bold",
                    fontSize: "0.95rem",
                    color: "#1e293b",
                  }}
                >
                  Date
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: "bold",
                    fontSize: "0.95rem",
                    color: "#1e293b",
                  }}
                >
                  Description
                </TableCell>
                {showViewDetails && (
                  <TableCell
                    sx={{
                      fontWeight: "bold",
                      fontSize: "0.95rem",
                      color: "#1e293b",
                      textAlign: "center",
                    }}
                  >
                    View Details
                  </TableCell>
                )}
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={showViewDetails ? 7 : 6} align="center">
                    <Typography sx={{ py: 2, color: "#6b7280" }}>
                      Loading...
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : expenses?.length > 0 ? (
                expenses.map((row) => (
                  <TableRow
                    key={row.id}
                    hover
                    sx={{
                      transition: "all 0.2s",
                      "&:hover": { backgroundColor: "#f8fafc" },
                    }}
                  >
                    {role === "superadmin" && (
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={1}>
                          <Avatar
                            sx={{
                              bgcolor: "#3b82f6",
                              width: 32,
                              height: 32,
                              fontSize: 14,
                              fontWeight: 600,
                            }}
                          >
                            {row?.user?.name?.charAt(0).toUpperCase()}
                          </Avatar>
                          <Typography
                            fontWeight={500}
                            sx={{ fontSize: "0.9rem", color: "#1e293b" }}
                          >
                            {row?.user?.name}
                          </Typography>
                        </Box>
                      </TableCell>
                    )}
                    <TableCell
                      sx={{
                        fontWeight: "bold",
                        fontSize: "0.9rem",
                        color: "#dc2626",
                      }}
                    >
                      ₹{row?.amount?.toLocaleString()}
                    </TableCell>
                    <TableCell
                      sx={{
                        fontSize: "0.9rem",
                        color: "#6b7280",
                        textTransform: "capitalize",
                      }}
                    >
                      {row?.department?.name || "-"}
                    </TableCell>
                    <TableCell
                      sx={{
                        fontSize: "0.9rem",
                        color: "#6b7280",
                        textTransform: "capitalize",
                      }}
                    >
                      {row?.subDepartment?.name || "-"}
                    </TableCell>
                    <TableCell
                      sx={{
                        fontSize: "0.9rem",
                        color: "#6b7280",
                        textTransform: "capitalize",
                      }}
                    >
                      {row?.vendor || "-"}
                    </TableCell>
                    <TableCell sx={{ fontSize: "0.85rem", color: "#6b7280" }}>
                      {row?.createdAt
                        ? new Date(row.createdAt).toLocaleString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: true,
                            timeZone: "Asia/Kolkata",
                          })
                        : "-"}
                    </TableCell>
                    <TableCell sx={{ fontSize: "0.85rem", color: "#6b7280" }}>
                      {row?.description || "-"}
                    </TableCell>
                    {showViewDetails && (
                      <TableCell align="center">
                        <Tooltip title="View Details">
                          <IconButton
                            onClick={() => handleViewDetails(row)}
                            sx={{ color: "#3b82f6" }}
                            size="small"
                          >
                            <Visibility fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    )}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={showViewDetails ? 7 : 6} align="center">
                    <Typography sx={{ py: 2, color: "#6b7280" }}>
                      No expenses found
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {meta?.total > 0 && (
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            p={2}
            flexWrap="wrap"
            gap={2}
          >
            <Typography
              variant="body2"
              color="#6b7280"
              sx={{ fontSize: "0.85rem" }}
            >
              Showing {(page - 1) * limit + 1}–
              {Math.min(page * limit, meta.total)} of {meta.total} entries
            </Typography>
            <Pagination
              count={Math.ceil(meta.total / meta.limit)}
              page={page}
              onChange={(e, val) => setPage(val)}
              color="primary"
              size="medium"
            />
          </Box>
        )}
      </SectionCard>

      {/* View Details Modal */}
      {showViewDetails && selectedExpense && (
        <Modal
          open={viewModalOpen}
          onClose={handleCloseModal}
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Box
            sx={{
              width: "500px",
              maxWidth: "95vw",
              bgcolor: "background.paper",
              borderRadius: 2,
              boxShadow: 24,
              overflow: "hidden",
            }}
          >
            <Card sx={{ maxHeight: "85vh" }}>
              <CardContent sx={{ p: 0 }}>
                <Box
                  sx={{
                    p: 2,
                    borderBottom: "1px solid",
                    borderColor: "divider",
                    backgroundColor: "#3b82f6",
                    color: "white",
                  }}
                >
                  <Typography variant="h6" component="h2" fontWeight="bold">
                    Expense Details
                  </Typography>
                </Box>

                <Box sx={{ p: 2.5 }}>
                  <Stack spacing={2.5}>
                    <Box>
                      <Typography
                        variant="subtitle1"
                        gutterBottom
                        fontWeight="bold"
                        color="primary"
                      >
                        Basic Information
                      </Typography>
                      <Stack spacing={1.5}>
                        <Box display="flex" justifyContent="space-between">
                          <Typography variant="body2" fontWeight="500">
                            Amount:
                          </Typography>
                          <Typography
                            variant="body2"
                            fontWeight="bold"
                            color="primary.main"
                          >
                            ₹{selectedExpense.amount?.toLocaleString()}
                          </Typography>
                        </Box>
                        <Box display="flex" justifyContent="space-between">
                          <Typography variant="body2" fontWeight="500">
                            Department:
                          </Typography>
                          <Typography
                            variant="body2"
                            textTransform="capitalize"
                          >
                            {selectedExpense.department?.name || "-"}
                          </Typography>
                        </Box>
                        <Box display="flex" justifyContent="space-between">
                          <Typography variant="body2" fontWeight="500">
                            Sub-Department:
                          </Typography>
                          <Typography
                            variant="body2"
                            textTransform="capitalize"
                          >
                            {selectedExpense.subDepartment?.name || "-"}
                          </Typography>
                        </Box>
                        <Box display="flex" justifyContent="space-between">
                          <Typography variant="body2" fontWeight="500">
                            Vendor:
                          </Typography>
                          <Typography
                            variant="body2"
                            textTransform="capitalize"
                          >
                            {selectedExpense.vendor || "-"}
                          </Typography>
                        </Box>
                      </Stack>
                    </Box>

                    {hasProof(selectedExpense) && (
                      <Box>
                        <Typography
                          variant="subtitle1"
                          gutterBottom
                          fontWeight="bold"
                          color="primary"
                        >
                          Proof Document
                        </Typography>
                        <Box
                          sx={{
                            p: 2,
                            border: "1px solid",
                            borderColor: "#e5e7eb",
                            borderRadius: 1,
                            backgroundColor: "#f8fafc",
                          }}
                        >
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 2,
                              mb: 2,
                            }}
                          >
                            <Box sx={{ color: "#3b82f6", fontSize: "2rem" }}>
                              {getFileIcon(
                                selectedExpense.proof ||
                                  selectedExpense.proofUrl,
                              )}
                            </Box>
                            <Box sx={{ flex: 1 }}>
                              <Chip
                                label={getFileType(
                                  selectedExpense.proof ||
                                    selectedExpense.proofUrl,
                                )}
                                color="primary"
                                variant="outlined"
                                size="small"
                                sx={{ mb: 0.5 }}
                              />
                            </Box>
                          </Box>

                          <Stack
                            direction="row"
                            spacing={1}
                            justifyContent="center"
                          >
                            <Button
                              variant="contained"
                              startIcon={<Download />}
                              onClick={() =>
                                handleDownloadProof(selectedExpense)
                              }
                              size="small"
                              fullWidth
                              disabled={downloading}
                            >
                              {downloading ? "Downloading..." : "Download"}
                            </Button>
                            <Button
                              variant="outlined"
                              startIcon={<Visibility />}
                              onClick={() =>
                                handlePreviewProof(selectedExpense)
                              }
                              size="small"
                              fullWidth
                              disabled={previewing}
                            >
                              {previewing ? "Opening..." : "Preview"}
                            </Button>
                          </Stack>
                        </Box>
                      </Box>
                    )}

                    {selectedExpense.description && (
                      <Box>
                        <Typography
                          variant="subtitle1"
                          gutterBottom
                          fontWeight="bold"
                          color="primary"
                        >
                          Description
                        </Typography>
                        <Box
                          sx={{
                            p: 1.5,
                            backgroundColor: "#f8fafc",
                            borderRadius: 1,
                            border: "1px solid",
                            borderColor: "#e5e7eb",
                          }}
                        >
                          <Typography variant="body2">
                            {selectedExpense.description}
                          </Typography>
                        </Box>
                      </Box>
                    )}
                  </Stack>
                </Box>

                <Box
                  sx={{
                    p: 2,
                    borderTop: "1px solid",
                    borderColor: "divider",
                    display: "flex",
                    justifyContent: "flex-end",
                  }}
                >
                  <Button
                    onClick={handleCloseModal}
                    variant="contained"
                    size="small"
                  >
                    Close
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Box>
        </Modal>
      )}

      {/* Preview Modal */}
      <Modal
        open={previewModalOpen}
        onClose={handleClosePreviewModal}
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Box
          sx={{
            width: "90vw",
            height: "90vh",
            maxWidth: "1200px",
            maxHeight: "800px",
            bgcolor: "background.paper",
            borderRadius: 2,
            boxShadow: 24,
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Box
            sx={{
              p: 2,
              borderBottom: "1px solid",
              borderColor: "divider",
              backgroundColor: "#3b82f6",
              color: "white",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography variant="h6" component="h2" fontWeight="bold">
              Document Preview
            </Typography>
            <IconButton
              onClick={handleClosePreviewModal}
              sx={{ color: "white" }}
              size="small"
            >
              <Close />
            </IconButton>
          </Box>

          <Box
            sx={{
              flex: 1,
              p: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {renderPreviewContent()}
          </Box>

          <Box
            sx={{
              p: 2,
              borderTop: "1px solid",
              borderColor: "divider",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography variant="body2" color="#6b7280">
              {previewUrl.split("/").pop()}
            </Typography>
            <Button
              variant="contained"
              startIcon={<Download />}
              onClick={() => window.open(previewUrl, "_blank")}
              size="small"
            >
              Download
            </Button>
          </Box>
        </Box>
      </Modal>
    </>
  );
};

// Legend Component
const LegendItem = ({ color, label }) => (
  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
    <Box
      sx={{ width: 12, height: 12, backgroundColor: color, borderRadius: 1 }}
    />
    <Typography variant="body2" color="#6b7280">
      {label}
    </Typography>
  </Box>
);

// Main Dashboard Component
const Dashboard = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state?.auth);
  const [activeTab, setActiveTab] = useState("budget");
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [budgetPage, setBudgetPage] = useState(1);
  const [expensePage, setExpensePage] = useState(1);
  const [budgetLimit, setBudgetLimit] = useState(5);
  const [expenseLimit, setExpenseLimit] = useState(10);

  const { userReimbursements } = useSelector((state) => state?.reimbursement);
  const {
    budgets,
    loading: budgetLoading,
    meta: budgetMeta,
  } = useSelector((state) => state?.budget);
  const {
    allExpenses = [],
    loading: expenseLoading = false,
    meta: expenseMeta = { total: 0, limit: expenseLimit },
  } = useSelector((state) => state?.expense ?? {});

  useEffect(() => {
    if (!user?.id) return;
    dispatch(fetchExpensesForUser({ userId: user.id, page: 1, limit: 20 }));
    dispatch(fetchReimbursementsForUser({ id: user.id }));
    dispatch(fetchUserBudgets({ userId: user.id }));
  }, [dispatch, user]);

  const getDaysInMonth = (month, year) =>
    new Date(year, month + 1, 0).getDate();

  const parseDate = (dateString) => {
    if (!dateString) return null;
    try {
      if (dateString.includes("T")) {
        const date = new Date(dateString);
        return new Date(
          date.getUTCFullYear(),
          date.getUTCMonth(),
          date.getUTCDate(),
        );
      }
      return new Date(dateString);
    } catch (error) {
      console.warn("Invalid date:", dateString, error?.message);
      return null;
    }
  };

  const getDailyAreaChartData = () => {
    const daysInMonth = getDaysInMonth(selectedMonth, selectedYear);
    const dailyData = [];

    for (let day = 1; day <= daysInMonth; day++) {
      dailyData.push({
        day: day.toString(),
        date: `${day}/${selectedMonth + 1}/${selectedYear}`,
        fromAllocation: 0,
        fromReimbursement: 0,
        totalAmount: 0,
      });
    }

    const monthlyExpenses =
      allExpenses?.filter((expense) => {
        if (!expense?.createdAt) return false;
        const expenseDate = parseDate(expense.createdAt);
        if (!expenseDate) return false;
        const expenseMonth = expenseDate.getMonth();
        const expenseYear = expenseDate.getFullYear();
        return expenseMonth === selectedMonth && expenseYear === selectedYear;
      }) || [];

    monthlyExpenses.forEach((expense) => {
      const expenseDate = parseDate(expense.createdAt);
      if (!expenseDate) return;
      const day = expenseDate.getDate();
      const dayIndex = day - 1;
      if (dailyData[dayIndex]) {
        const fromAllocation = Number(expense.fromAllocation || 0);
        const fromReimbursement = Number(expense.fromReimbursement || 0);
        const totalAmount = Number(expense.amount || 0);
        dailyData[dayIndex].fromAllocation += fromAllocation;
        dailyData[dayIndex].fromReimbursement += fromReimbursement;
        dailyData[dayIndex].totalAmount += totalAmount;
      }
    });

    return dailyData;
  };

  const dailyAreaChartData = getDailyAreaChartData();

  const totalAllocated = Number(
    budgets?.reduce((acc, b) => acc + Number(b?.allocatedAmount), 0),
  );
  const totalExpenses =
    allExpenses?.reduce((acc, e) => acc + Number(e?.amount || 0), 0) || 0;
  const totalPendingReimbursed =
    userReimbursements &&
    userReimbursements
      ?.filter((item) => !item?.isReimbursed)
      .reduce((acc, b) => acc + Number(b.amount), 0);
  const totalReimbursed =
    userReimbursements &&
    userReimbursements
      ?.filter((item) => item?.isReimbursed)
      .reduce((acc, b) => acc + Number(b.amount), 0);

  const budgetStats = [
    {
      title: "Total Allocated",
      value: `₹${totalAllocated || 0}`,
      icon: <AccountBalanceIcon />,
      color: "#3b82f6",
      subtitle: "Total budget allocation",
    },
    {
      title: "Total Expenses",
      value: `₹${totalExpenses || 0}`,
      icon: <MonetizationOnIcon />,
      color: "#ef4444",
      subtitle: "Total expenses amount",
    },
    {
      title: "Pending Reimbursement",
      value: `₹${totalPendingReimbursed || 0}`,
      icon: <CreditCardIcon />,
      color: "#f59e0b",
      subtitle: "Awaiting processing",
    },
    {
      title: "Reimbursement Received",
      value: `₹${totalReimbursed || 0}`,
      icon: <TimelineIcon />,
      color: "#10b981",
      subtitle: "Total received",
    },
  ];

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const currentYear = new Date().getFullYear();
  const years = [currentYear - 1, currentYear, currentYear + 1];

  return (
    <Box
      sx={{
        py: 4,
        px: { xs: 2, sm: 3, md: 4 },
        backgroundColor: "#f8fafc",
        minHeight: "100vh",
      }}
    >
      <StatsCardsSection budgetStats={budgetStats} />

      {/* Chart Section */}
      <Box sx={{ mb: { xs: 3, sm: 4 } }}>
        <Card
          sx={{ borderRadius: 2, boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}
        >
          <CardContent>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 2,
                flexWrap: "wrap",
                gap: 2,
              }}
            >
              <Typography
                variant="h6"
                sx={{ fontWeight: 600, color: "#1e293b" }}
              >
                Expense Overview - {months[selectedMonth]} {selectedYear}
              </Typography>
              <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                <FormControl size="small" sx={{ minWidth: 120 }}>
                  <InputLabel>Month</InputLabel>
                  <Select
                    value={selectedMonth}
                    label="Month"
                    onChange={(e) => setSelectedMonth(e.target.value)}
                  >
                    {months.map((month, index) => (
                      <MenuItem key={month} value={index}>
                        {month}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl size="small" sx={{ minWidth: 100 }}>
                  <InputLabel>Year</InputLabel>
                  <Select
                    value={selectedYear}
                    label="Year"
                    onChange={(e) => setSelectedYear(e.target.value)}
                  >
                    {years.map((year) => (
                      <MenuItem key={year} value={year}>
                        {year}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
            </Box>

            <Box sx={{ width: "100%", height: 400 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={dailyAreaChartData}
                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="day" tick={{ fill: "#6b7280" }} />
                  <YAxis
                    tick={{ fill: "#6b7280" }}
                    tickFormatter={(v) => `₹${v}`}
                  />
                  <RechartsTooltip
                    formatter={(v, n) => {
                      const labelMap = {
                        fromAllocation: "From Allocation",
                        fromReimbursement: "From Reimbursement",
                        totalAmount: "Total Amount",
                      };
                      return [`₹${v}`, labelMap[n] || n];
                    }}
                    contentStyle={{
                      backgroundColor: "white",
                      border: "1px solid #e5e7eb",
                      borderRadius: "6px",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="fromAllocation"
                    stroke="#3b82f6"
                    fill="#93c5fd"
                    fillOpacity={0.6}
                    strokeWidth={2}
                  />
                  <Area
                    type="monotone"
                    dataKey="fromReimbursement"
                    stroke="#f59e0b"
                    fill="#fde68a"
                    fillOpacity={0.6}
                    strokeWidth={2}
                  />
                  <Area
                    type="monotone"
                    dataKey="totalAmount"
                    stroke="#10b981"
                    fill="#6ee7b7"
                    fillOpacity={0.4}
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </Box>

            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                gap: 3,
                mt: 2,
                flexWrap: "wrap",
              }}
            >
              <LegendItem color="#3b82f6" label="From Allocation" />
              <LegendItem color="#f59e0b" label="From Reimbursement" />
              <LegendItem color="#10b981" label="Total Amount" />
            </Box>
          </CardContent>
        </Card>
      </Box>

      <Box sx={{ my: { xs: 2, sm: 3 } }}>
        <TabButtonsWithReport
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />
      </Box>

      <Box sx={{ mt: { xs: 2, sm: 3 }, overflowX: "auto" }}>
        {activeTab === "budget" && (
          <BudgetTable
            budgets={budgets}
            loading={budgetLoading}
            meta={budgetMeta}
            page={budgetPage}
            setPage={setBudgetPage}
            limit={budgetLimit}
            setLimit={setBudgetLimit}
            showPagination={true}
          />
        )}

        {activeTab === "expense" && (
          <ExpenseTable
            expenses={allExpenses}
            loading={expenseLoading}
            meta={expenseMeta}
            page={expensePage}
            setPage={setExpensePage}
            limit={expenseLimit}
            setLimit={setExpenseLimit}
          />
        )}
      </Box>
    </Box>
  );
};

export default Dashboard;
