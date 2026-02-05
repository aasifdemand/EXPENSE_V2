import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  createUser,
  fetchAllUsers,
  resetUserPassword,
} from "../../store/authSlice";
import { useToastMessage } from "../../hooks/useToast";

// Material-UI Components
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  MenuItem,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Card,
  CardContent,
  useTheme,
  useMediaQuery,
  InputAdornment,
  FormControl,
  Select,
  Avatar,
  Stack,
  Tooltip,
  CircularProgress,
  InputLabel,
  Container,
  Alert,
  Snackbar,
  Pagination,
  Fade,
} from "@mui/material";

// Material-UI Icons
import {
  Person as PersonIcon,
  Lock as LockIcon,
  Business as BusinessIcon,
  Add as AddIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  LockReset as LockResetIcon,
  Search as SearchIcon,
  Close as CloseIcon,
  CheckCircle as CheckCircleIcon,
  Key as KeyIcon,
  Email as EmailIcon,
  People as PeopleIcon,
  Shield as ShieldIcon,
  RecentActors as RecentActorsIcon,
  FilterList as FilterListIcon,
  Download as DownloadIcon,
} from "@mui/icons-material";
import {
  PrimaryButton,
  StyledFormControl,
  StyledSelect,
  StyledTextField,
} from "../../styles/budgeting.styles";
import { motion } from "framer-motion";
import { styled } from "@mui/material/styles";

// Styled Components
const PageContainer = styled(Container)(({ theme }) => ({
  padding: theme.spacing(4),
  minHeight: "100vh",
  backgroundColor: "#f8fafc",
  fontFamily: '"Poppins", sans-serif !important',
}));

const GradientTypography = styled(Typography)(({ theme }) => ({
  background: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
  fontWeight: 700,
  fontFamily: '"Poppins", sans-serif',
}));

const ContentCard = styled(Card)(({ theme }) => ({
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

const UserAvatar = styled(Avatar)(({ theme }) => ({
  backgroundColor: "#3b82f6",
  color: "white",
  fontWeight: 600,
  fontSize: "1rem",
  width: 40,
  height: 40,
}));

const StatusChip = styled(Chip)(({ theme, status }) => ({
  fontWeight: 500,
  fontSize: "0.75rem",
  fontFamily: '"Poppins", sans-serif',
  backgroundColor:
    status === "active"
      ? "#10b98115"
      : status === "inactive"
      ? "#ef444415"
      : "#3b82f615",
  color:
    status === "active"
      ? "#10b981"
      : status === "inactive"
      ? "#ef4444"
      : "#3b82f6",
  border: `1px solid ${
    status === "active"
      ? "#10b98140"
      : status === "inactive"
      ? "#ef444440"
      : "#3b82f640"
  }`,
}));

const UserDashboard = () => {
  const departments = [
    { value: "GENERAL", label: "General", color: "#3b82f6" },
    { value: "HR", label: "HR", color: "#10b981" },
    { value: "IT", label: "IT", color: "#8b5cf6" },
    { value: "DATA", label: "Data", color: "#f59e0b" },
    { value: "SALES", label: "Sales", color: "#ef4444" },
  ];

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  // State management
  const dispatch = useDispatch();
  const { users, loading } = useSelector((state) => state.auth);
  const [toast, setToast] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  useEffect(() => {
    dispatch(fetchAllUsers());
  }, [dispatch]);

  const [newUser, setNewUser] = useState({
    name: "",
    password: "",
    department: departments[0].value,
  });

  const [passwordVisible, setPasswordVisible] = useState({
    createPassword: false,
    newPassword: false,
    confirmPassword: false,
  });

  const [resetPasswordModal, setResetPasswordModal] = useState({
    isOpen: false,
    userId: null,
    userName: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

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

  // Filter users
  const filteredUsers = users?.filter((user) => {
    const matchesSearch =
      user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user?.email?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDepartment =
      departmentFilter === "all" || user?.department === departmentFilter;

    return matchesSearch && matchesDepartment;
  });

  // Paginate users
  const paginatedUsers = filteredUsers?.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredUsers?.length / itemsPerPage) || 1;

  const showToast = (message, severity = "success") => {
    setToast({ open: true, message, severity });
  };

  const handleCloseToast = () => {
    setToast({ ...toast, open: false });
  };

  // Toggle password visibility
  const togglePasswordVisibility = (field) => {
    setPasswordVisible((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  // Handle adding a new user
  const handleAddUser = async (e) => {
    e.preventDefault();
    try {
      const res = await dispatch(createUser(newUser));

      if (createUser.fulfilled.match(res)) {
        showToast("User has been created successfully!", "success");
        dispatch(fetchAllUsers());
        // Reset form
        setNewUser({
          name: "",
          password: "",
          department: "",
        });
      } else {
        showToast("Error in creating the user", "error");
      }
    } catch (err) {
      console.log(err);
      showToast("Error in creating the user", "error");
    }
  };

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewUser({ ...newUser, [name]: value });
  };

  // Handle reset password modal input changes
  const handleResetPasswordInputChange = (e) => {
    const { name, value } = e.target;
    setResetPasswordModal((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Open reset password modal
  const openResetPasswordModal = (userId, userName) => {
    setResetPasswordModal({
      isOpen: true,
      userId: userId,
      userName: userName,
      newPassword: "",
      confirmPassword: "",
    });
  };

  // Close reset password modal
  const closeResetPasswordModal = () => {
    setResetPasswordModal({
      isOpen: false,
      userId: null,
      userName: "",
      newPassword: "",
      confirmPassword: "",
    });
  };

  // Handle reset password submission
  const handleResetPassword = async (e) => {
    e.preventDefault();

    // Validate passwords
    if (resetPasswordModal.newPassword !== resetPasswordModal.confirmPassword) {
      showToast("New password and confirm password do not match!", "error");
      return;
    }

    if (resetPasswordModal.newPassword.length < 6) {
      showToast("Password must be at least 6 characters long!", "error");
      return;
    }

    try {
      await dispatch(
        resetUserPassword({
          userId: resetPasswordModal.userId,
          password: resetPasswordModal.newPassword,
        })
      ).unwrap();

      showToast("Password has been updated successfully!", "success");
      closeResetPasswordModal();
    } catch (err) {
      const errorMessage =
        err?.message ||
        err?.toString() ||
        "Failed to update password. Please try again.";
      showToast(errorMessage, "error");
    }
  };

  // Format last login date
  const formatLastLogin = (user) => {
    if (!user?.sessions?.length) return "-";

    const lastSession = user.sessions[user.sessions.length - 1];
    return new Date(lastSession?.lastLogin).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  // Get department color
  const getDepartmentColor = (department) => {
    const dept = departments.find((d) => d.value === department);
    return dept?.color || "#64748b";
  };

  // Handle page change
  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  // Handle items per page change
  const handleItemsPerPageChange = (event) => {
    setItemsPerPage(event.target.value);
    setCurrentPage(1);
  };

  // User statistics
  const userStats = [
    {
      title: "Total Users",
      value: users?.length || 0,
      color: "#3b82f6",
      icon: <PeopleIcon />,
      subtitle: "Registered users",
    },
    {
      title: "Active Sessions",
      value: users?.filter((user) => user?.sessions?.length > 0).length || 0,
      color: "#10b981",
      icon: <RecentActorsIcon />,
      subtitle: "Currently active",
    },
    {
      title: "Departments",
      value: new Set(users?.map((user) => user?.department)).size || 0,
      color: "#8b5cf6",
      icon: <BusinessIcon />,
      subtitle: "Active departments",
    },
    {
      title: "HR Admins",
      value: users?.filter((user) => user?.department === "HR").length || 0,
      color: "#ef4444",
      icon: <ShieldIcon />,
      subtitle: "HR department users",
    },
  ];

  return (
    <Container
      maxWidth="xl"
      sx={{ py: 4, fontFamily: '"Poppins", sans-serif' }}
    >
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        {/* Page Header */}
        <Box sx={{ mb: 4 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              mb: 2,
              flexDirection: isMobile ? "column" : "row",
              gap: 2,
            }}
          >
            <Box>
              <GradientTypography variant="h4" sx={{ mb: 1 }}>
                User Management
              </GradientTypography>
              <Typography
                variant="h6"
                sx={{
                  color: "#64748b",
                  fontWeight: 400,
                  fontSize: "1.1rem",
                }}
              >
                Manage user accounts and permissions
              </Typography>
            </Box>
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              sx={{
                borderRadius: 2,
                borderColor: "#e2e8f0",
                color: "#64748b",
                fontWeight: 500,
                fontFamily: '"Poppins", sans-serif',
              }}
            >
              Export Users
            </Button>
          </Box>
        </Box>

        {/* User Stats */}
        <motion.div variants={itemVariants}>
          <Grid container spacing={3} sx={{ mb: 4 }}>
            {userStats.map((stat, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <ContentCard sx={{ p: 3 }}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      mb: 2,
                      width: "250px",
                    }}
                  >
                    <Box>
                      <Typography
                        variant="subtitle2"
                        sx={{
                          color: "#64748b",
                          fontWeight: 500,
                          fontSize: "0.75rem",
                        }}
                      >
                        {stat.title}
                      </Typography>
                      <Typography
                        variant="h4"
                        sx={{
                          color: stat.color,
                          fontWeight: 700,
                          mt: 1,
                        }}
                      >
                        {stat.value}
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        backgroundColor: `${stat.color}15`,
                        borderRadius: "8px",
                        p: 1,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {stat.icon}
                    </Box>
                  </Box>
                  <Typography
                    variant="caption"
                    sx={{
                      color: "#94a3b8",
                    }}
                  >
                    {stat.subtitle}
                  </Typography>
                </ContentCard>
              </Grid>
            ))}
          </Grid>
        </motion.div>

        {/* Add User Card */}
        <motion.div variants={itemVariants}>
          <ContentCard sx={{ mb: 3, p: 5 }}>
            <Typography
              variant="h6"
              sx={{
                color: "#1e293b",
                fontWeight: 600,
                display: "flex",
                alignItems: "center",
                gap: 1,
                mb: 3,
              }}
            >
              <AddIcon /> Create New User
            </Typography>

            <Box component="form" onSubmit={handleAddUser}>
              <Grid container spacing={3}>
                {/* Full Name */}
                <Grid item xs={12} md={4}>
                  <StyledTextField
                    fullWidth
                    label="Full Name"
                    name="name"
                    value={newUser.name}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter full name"
                    size="small"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PersonIcon color="action" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>

                {/* Password */}
                <Grid item xs={12} md={4}>
                  <StyledTextField
                    fullWidth
                    label="Password"
                    name="password"
                    type={passwordVisible.createPassword ? "text" : "password"}
                    value={newUser.password}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter password"
                    inputProps={{ minLength: 6 }}
                    size="small"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LockIcon color="action" />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() =>
                              togglePasswordVisibility("createPassword")
                            }
                            edge="end"
                            size="small"
                          >
                            {passwordVisible.createPassword ? (
                              <VisibilityOffIcon />
                            ) : (
                              <VisibilityIcon />
                            )}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>

                {/* Department */}
                <Grid item xs={12} md={4}>
                  <StyledFormControl fullWidth size="small">
                    <InputLabel>Department</InputLabel>
                    <StyledSelect
                      label="Department"
                      name="department"
                      value={newUser.department || ""}
                      onChange={handleInputChange}
                      required
                    >
                      {departments.map((dept) => (
                        <MenuItem key={dept.value} value={dept.value}>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                            }}
                          >
                            <Box
                              sx={{
                                width: 8,
                                height: 8,
                                borderRadius: "50%",
                                backgroundColor: dept.color,
                              }}
                            />
                            {dept.label}
                          </Box>
                        </MenuItem>
                      ))}
                    </StyledSelect>
                  </StyledFormControl>
                </Grid>

                {/* Submit Button */}
                <Grid item xs={12}>
                  <Box sx={{ display: "flex", justifyContent: "center" }}>
                    <PrimaryButton
                      type="submit"
                      variant="contained"
                      size="large"
                      startIcon={<AddIcon />}
                      sx={{
                        px: 4,
                        py: 1,
                        borderRadius: 2,
                        background:
                          "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
                        boxShadow: "0 4px 14px 0 rgba(59, 130, 246, 0.4)",
                        "&:hover": {
                          transform: "translateY(-1px)",
                          boxShadow: "0 6px 20px 0 rgba(59, 130, 246, 0.6)",
                        },
                      }}
                    >
                      Create User
                    </PrimaryButton>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          </ContentCard>
        </motion.div>

        {/* Filters Card */}
        <motion.div variants={itemVariants}>
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
                <FilterListIcon sx={{ color: "#64748b" }} />
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
                sx={{ flex: -300 }}
              >
                <StyledTextField
                  size="small"
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon color="action" />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ minWidth: 200 }}
                />

                <StyledFormControl size="small" sx={{ minWidth: 150 }}>
                  <InputLabel>Department</InputLabel>
                  <StyledSelect
                    value={departmentFilter}
                    label="Department"
                    onChange={(e) => setDepartmentFilter(e.target.value)}
                  >
                    <MenuItem value="all">All Departments</MenuItem>
                    {departments.map((dept) => (
                      <MenuItem key={dept.value} value={dept.value}>
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <Box
                            sx={{
                              width: 8,
                              height: 8,
                              borderRadius: "50%",
                              backgroundColor: dept.color,
                            }}
                          />
                          {dept.label}
                        </Box>
                      </MenuItem>
                    ))}
                  </StyledSelect>
                </StyledFormControl>
              </Stack>

              <Box sx={{ flex: 1, textAlign: { xs: "left", md: "right" } }}>
                <Typography variant="body2" sx={{ color: "#64748b" }}>
                  Showing {paginatedUsers?.length || 0} of{" "}
                  {filteredUsers?.length || 0} users
                </Typography>
              </Box>
            </Box>
          </ContentCard>
        </motion.div>

        {/* Users Table Card */}
        <motion.div variants={itemVariants}>
          <ContentCard>
            <Box sx={{ p: 3, borderBottom: "1px solid #e2e8f0" }}>
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
                <PeopleIcon /> User Directory
              </Typography>
            </Box>

            {loading ? (
              <Box sx={{ p: 6, textAlign: "center" }}>
                <CircularProgress size={40} sx={{ color: "#3b82f6", mb: 2 }} />
                <Typography sx={{ color: "#64748b" }}>
                  Loading users...
                </Typography>
              </Box>
            ) : filteredUsers?.length === 0 ? (
              <Box sx={{ p: 6, textAlign: "center" }}>
                <SearchIcon sx={{ fontSize: 48, color: "#cbd5e1", mb: 2 }} />
                <Typography sx={{ color: "#64748b", mb: 1 }}>
                  No users found
                </Typography>
                <Typography
                  sx={{
                    fontSize: "0.875rem",
                    color: "#94a3b8",
                  }}
                >
                  {searchTerm || departmentFilter !== "all"
                    ? "Try adjusting your filters"
                    : "No users in the system"}
                </Typography>
              </Box>
            ) : (
              <>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <StyledTableCell>User</StyledTableCell>
                        <StyledTableCell>Contact Information</StyledTableCell>
                        <StyledTableCell>Department</StyledTableCell>
                        <StyledTableCell>Last Activity</StyledTableCell>
                        <StyledTableCell align="center">
                          Actions
                        </StyledTableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {paginatedUsers?.map((user, index) => (
                        <motion.tr
                          key={user?._id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                        >
                          <StyledTableCell>
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 2,
                              }}
                            >
                              <UserAvatar>
                                {user?.name?.charAt(0).toUpperCase()}
                              </UserAvatar>
                              <Box>
                                <Typography
                                  sx={{
                                    fontWeight: 500,
                                    fontSize: "0.875rem",
                                    color: "#1e293b",
                                  }}
                                >
                                  {user?.name}
                                </Typography>
                                <StatusChip
                                  size="small"
                                  label={
                                    user?.sessions?.length > 0
                                      ? "Active"
                                      : "Inactive"
                                  }
                                  status={
                                    user?.sessions?.length > 0
                                      ? "active"
                                      : "inactive"
                                  }
                                />
                              </Box>
                            </Box>
                          </StyledTableCell>
                          <StyledTableCell>
                            <Box>
                              <Typography
                                sx={{
                                  fontWeight: 500,
                                  fontSize: "0.875rem",
                                  color: "#3b82f6",
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 0.5,
                                  mb: 0.5,
                                }}
                              >
                                <EmailIcon fontSize="small" />
                                {user?.email}
                              </Typography>
                              <Typography
                                sx={{
                                  fontSize: "0.75rem",
                                  color: "#64748b",
                                }}
                              >
                                Created:{" "}
                                {new Date(user?.createdAt).toLocaleDateString()}
                              </Typography>
                            </Box>
                          </StyledTableCell>
                          <StyledTableCell>
                            <Chip
                              size="small"
                              label={user?.department}
                              sx={{
                                backgroundColor: `${getDepartmentColor(
                                  user?.department
                                )}15`,
                                color: getDepartmentColor(user?.department),
                                fontWeight: 500,
                              }}
                            />
                          </StyledTableCell>
                          <StyledTableCell>
                            <Box>
                              <Typography
                                sx={{
                                  fontSize: "0.875rem",
                                  fontWeight: 500,
                                }}
                              >
                                {formatLastLogin(user)}
                              </Typography>
                              <Typography
                                sx={{
                                  fontSize: "0.75rem",
                                  color: "#64748b",
                                }}
                              >
                                {user?.sessions?.length > 0
                                  ? `${user?.sessions?.length} sessions`
                                  : "No sessions"}
                              </Typography>
                            </Box>
                          </StyledTableCell>
                          <StyledTableCell align="center">
                            <Tooltip title="Reset Password">
                              <IconButton
                                onClick={() =>
                                  openResetPasswordModal(user?._id, user?.name)
                                }
                                sx={{
                                  backgroundColor: "#3b82f615",
                                  color: "#3b82f6",
                                  border: "1px solid #3b82f640",
                                  borderRadius: 2,
                                  width: 36,
                                  height: 36,
                                  "&:hover": {
                                    backgroundColor: "#3b82f630",
                                    transform: "scale(1.05)",
                                  },
                                }}
                              >
                                <LockResetIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </StyledTableCell>
                        </motion.tr>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>

                {/* Pagination */}
                {filteredUsers?.length > itemsPerPage && (
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
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 2 }}
                      >
                        <Typography
                          variant="body2"
                          sx={{
                            color: "#64748b",
                            fontSize: "0.875rem",
                          }}
                        >
                          Rows per page:
                        </Typography>
                        <StyledFormControl size="small" sx={{ minWidth: 80 }}>
                          <StyledSelect
                            value={itemsPerPage}
                            onChange={handleItemsPerPageChange}
                          >
                            {[5, 10, 25, 50].map((num) => (
                              <MenuItem key={num} value={num}>
                                {num}
                              </MenuItem>
                            ))}
                          </StyledSelect>
                        </StyledFormControl>
                      </Box>

                      <Typography
                        variant="body2"
                        sx={{
                          color: "#64748b",
                          fontSize: "0.875rem",
                        }}
                      >
                        Showing {(currentPage - 1) * itemsPerPage + 1}–
                        {Math.min(
                          currentPage * itemsPerPage,
                          filteredUsers.length
                        )}{" "}
                        of {filteredUsers.length} users
                      </Typography>

                      <Pagination
                        count={totalPages}
                        page={currentPage}
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
              </>
            )}
          </ContentCard>
        </motion.div>
      </motion.div>

      {/* Reset Password Modal */}
      <Dialog
        open={resetPasswordModal.isOpen}
        onClose={closeResetPasswordModal}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            fontFamily: '"Poppins", sans-serif',
          },
        }}
      >
        <DialogTitle
          sx={{
            display: "flex",
            alignItems: "center",
            borderBottom: "1px solid #e2e8f0",
            pb: 2,
            fontWeight: 600,
          }}
        >
          <LockResetIcon sx={{ mr: 1, color: "#3b82f6" }} />
          Reset Password
          <IconButton
            aria-label="close"
            onClick={closeResetPasswordModal}
            sx={{
              position: "absolute",
              right: 8,
              top: 8,
              color: "#64748b",
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ mt: 3 }}>
          {/* User Info */}
          <ContentCard sx={{ mb: 3 }}>
            <Box sx={{ p: 2 }}>
              <Stack spacing={1}>
                <Box
                  sx={{ display: "flex", alignItems: "center", gap: 2, mb: 1 }}
                >
                  <UserAvatar>
                    {resetPasswordModal.userName?.charAt(0).toUpperCase()}
                  </UserAvatar>
                  <Box>
                    <Typography variant="subtitle1" fontWeight={600}>
                      {resetPasswordModal.userName}
                    </Typography>
                    <Typography variant="caption" color="#64748b">
                      Reset user password
                    </Typography>
                  </Box>
                </Box>
              </Stack>
            </Box>
          </ContentCard>

          <Box component="form" onSubmit={handleResetPassword}>
            <Stack spacing={3}>
              {/* New Password Field */}
              <StyledTextField
                fullWidth
                label="New Password"
                name="newPassword"
                type={passwordVisible.newPassword ? "text" : "password"}
                value={resetPasswordModal.newPassword}
                onChange={handleResetPasswordInputChange}
                required
                placeholder="Enter new password"
                inputProps={{ minLength: 6 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon color="action" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => togglePasswordVisibility("newPassword")}
                        edge="end"
                      >
                        {passwordVisible.newPassword ? (
                          <VisibilityOffIcon />
                        ) : (
                          <VisibilityIcon />
                        )}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              {/* Confirm Password Field */}
              <StyledTextField
                fullWidth
                label="Confirm New Password"
                name="confirmPassword"
                type={passwordVisible.confirmPassword ? "text" : "password"}
                value={resetPasswordModal.confirmPassword}
                onChange={handleResetPasswordInputChange}
                required
                placeholder="Confirm new password"
                inputProps={{ minLength: 6 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <CheckCircleIcon color="action" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() =>
                          togglePasswordVisibility("confirmPassword")
                        }
                        edge="end"
                      >
                        {passwordVisible.confirmPassword ? (
                          <VisibilityOffIcon />
                        ) : (
                          <VisibilityIcon />
                        )}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <Alert severity="info" sx={{ borderRadius: 1 }}>
                Password must be at least 6 characters long
              </Alert>
            </Stack>
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button
            onClick={closeResetPasswordModal}
            size="large"
            sx={{
              color: "#64748b",
              fontWeight: 500,
            }}
          >
            Cancel
          </Button>
          <PrimaryButton
            onClick={handleResetPassword}
            variant="contained"
            size="large"
            startIcon={<LockResetIcon />}
            sx={{
              background: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
              "&:hover": {
                background: "linear-gradient(135deg, #2563eb 0%, #1e40af 100%)",
              },
            }}
          >
            Update Password
          </PrimaryButton>
        </DialogActions>
      </Dialog>

      {/* Toast Notification */}
      <Snackbar
        open={toast.open}
        autoHideDuration={4000}
        onClose={handleCloseToast}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
        TransitionComponent={Fade}
      >
        <Alert
          onClose={handleCloseToast}
          severity={toast.severity}
          sx={{
            width: "100%",
            borderRadius: 2,
            fontFamily: '"Poppins", sans-serif',
          }}
        >
          {toast.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default UserDashboard;
