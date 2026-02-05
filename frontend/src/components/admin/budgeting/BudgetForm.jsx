import {
  Box,
  InputLabel,
  MenuItem,
  Paper,
  Typography,
  Grid,
  Chip,
  CircularProgress,
  Stack,
  Avatar,
} from "@mui/material";
import {
  Add as AddIcon,
  Person as PersonIcon,
  Business as BusinessIcon,
  AttachMoney as AttachMoneyIcon,
  AddCircle as AddCircleIcon,
} from "@mui/icons-material";
import { motion } from "framer-motion";
import { styled } from "@mui/material/styles";

// Styled Components
const FormCard = styled(Paper)(({ theme }) => ({
  borderRadius: 16,
  boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
  border: "1px solid rgba(226, 232, 240, 0.8)",
  backgroundColor: "white",
  padding: theme.spacing(3),
  transition: "all 0.3s ease",
  "&:hover": {
    boxShadow: "0 8px 30px rgba(0,0,0,0.08)",
  },
  fontFamily: '"Poppins", sans-serif !important',
}));

const FormTitle = styled(Typography)(({ theme }) => ({
  fontWeight: 600,
  color: "#1e293b",
  fontSize: "1.25rem",
  marginBottom: theme.spacing(3),
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(1),
  fontFamily: '"Poppins", sans-serif',
}));

const StyledFormControl = styled(Box)(({ theme }) => ({
  "& .MuiFormControl-root": {
    width: "100%",
    "& .MuiInputLabel-root": {
      fontFamily: '"Poppins", sans-serif',
      fontSize: "0.875rem",
      color: "#64748b",
    },
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
    "& .MuiSelect-select": {
      fontFamily: '"Poppins", sans-serif',
      padding: theme.spacing(1.75, 2),
    },
  },
}));

const StyledTextField = styled(Box)(({ theme }) => ({
  "& .MuiTextField-root": {
    width: "100%",
    "& .MuiInputLabel-root": {
      fontFamily: '"Poppins", sans-serif',
      fontSize: "0.875rem",
      color: "#64748b",
    },
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
      padding: theme.spacing(1.75, 2),
    },
  },
}));

const AddButton = styled(motion.button)(({ theme, disabled }) => ({
  borderRadius: 12,
  padding: theme.spacing(1.75, 3),
  border: "none",
  cursor: disabled ? "not-allowed" : "pointer",
  fontFamily: '"Poppins", sans-serif',
  fontWeight: 600,
  fontSize: "0.875rem",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: theme.spacing(1),
  minWidth: 140,
  background: disabled
    ? "#cbd5e1"
    : "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
  color: "white",
  boxShadow: disabled ? "none" : "0 4px 15px rgba(59, 130, 246, 0.3)",
  transition: "all 0.3s ease",
  "&:hover": {
    background: disabled
      ? "#cbd5e1"
      : "linear-gradient(135deg, #2563eb 0%, #1e40af 100%)",
    boxShadow: disabled ? "none" : "0 6px 20px rgba(59, 130, 246, 0.4)",
    transform: disabled ? "none" : "translateY(-1px)",
  },
}));

const UserMenuItem = styled(MenuItem)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(2),
  padding: theme.spacing(1.5, 2),
  fontFamily: '"Poppins", sans-serif',
  "&:hover": {
    backgroundColor: "#f1f5f9",
  },
}));

const AmountInputAdornment = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  paddingLeft: theme.spacing(2),
  color: "#64748b",
  fontSize: "0.875rem",
  fontWeight: 500,
  fontFamily: '"Poppins", sans-serif',
}));

const BudgetForm = ({
  users,
  formData,
  setFormData,
  handleChange,
  handleAdd,
  loading,
}) => {
  const isFormValid =
    formData.userId &&
    formData.company &&
    formData.amount &&
    formData.amount > 0;

  const handleAmountChange = (e) => {
    const value = e.target.value;
    // Allow only positive numbers
    if (value === "" || (parseFloat(value) >= 0 && !isNaN(value))) {
      handleChange(e);
    }
  };

  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  return (
    <FormCard>
      <FormTitle>
        <AddCircleIcon sx={{ color: "#3b82f6" }} />
        Allocate Budget
      </FormTitle>

      <Grid container spacing={3} alignItems="flex-end">
        {/* User Selection */}
        <Grid item xs={12} md={4}>
          <StyledFormControl>
            <InputLabel>Select User</InputLabel>
            <Box sx={{ position: "relative" }}>
              <PersonIcon
                sx={{
                  position: "absolute",
                  left: 12,
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "#64748b",
                  zIndex: 1,
                }}
              />
              <select
                value={formData.userId}
                onChange={(e) =>
                  setFormData({ ...formData, userId: e.target.value })
                }
                style={{
                  width: "100%",
                  height: "56px",
                  padding: "0 14px 0 44px",
                  borderRadius: "12px",
                  border: "1px solid #cbd5e1",
                  backgroundColor: "#f8fafc",
                  fontFamily: '"Poppins", sans-serif',
                  fontSize: "0.875rem",
                  appearance: "none",
                  cursor: "pointer",
                  outline: "none",
                }}
              >
                <option value="">Select a user</option>
                {users?.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name} • {user.email}
                  </option>
                ))}
              </select>
            </Box>
          </StyledFormControl>

          {formData.userId && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Paper
                sx={{
                  p: 1.5,
                  mt: 1.5,
                  borderRadius: 2,
                  backgroundColor: "#f8fafc",
                  border: "1px solid #e2e8f0",
                }}
              >
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <Avatar
                    sx={{
                      width: 32,
                      height: 32,
                      fontSize: "0.75rem",
                      bgcolor: "#3b82f6",
                      fontWeight: 600,
                    }}
                  >
                    {getInitials(
                      users?.find((u) => u.id === formData.userId)?.name,
                    )}
                  </Avatar>
                  <Box>
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 500,
                        color: "#1e293b",
                        fontFamily: '"Poppins", sans-serif',
                      }}
                    >
                      {users?.find((u) => u.id === formData.userId)?.name}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        color: "#64748b",
                        fontFamily: '"Poppins", sans-serif',
                      }}
                    >
                      {users?.find((u) => u.id === formData.userId)?.email}
                    </Typography>
                  </Box>
                </Stack>
              </Paper>
            </motion.div>
          )}
        </Grid>

        {/* Company Selection */}
        <Grid item xs={12} md={3}>
          <StyledFormControl>
            <InputLabel>Company</InputLabel>
            <Box sx={{ position: "relative" }}>
              <BusinessIcon
                sx={{
                  position: "absolute",
                  left: 12,
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "#64748b",
                  zIndex: 1,
                }}
              />
              <select
                value={formData.company}
                onChange={(e) =>
                  setFormData({ ...formData, company: e.target.value })
                }
                style={{
                  width: "100%",
                  padding: "16.5px 14px 16.5px 44px",
                  borderRadius: "12px",
                  border: "1px solid #cbd5e1",
                  backgroundColor: "#f8fafc",
                  fontFamily: '"Poppins", sans-serif',
                  fontSize: "0.875rem",
                  appearance: "none",
                  cursor: "pointer",
                  outline: "none",
                }}
              >
                <option value="">Select company</option>
                <option value="Demand Curve Marketing">
                  Demand Curve Marketing
                </option>
                <option value="Stackio">Stacko.io</option>
              </select>
            </Box>
          </StyledFormControl>

          {formData.company && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Chip
                label={formData.company}
                size="small"
                sx={{
                  mt: 1.5,
                  backgroundColor:
                    formData.company === "Demand Curve Marketing"
                      ? "rgba(16, 185, 129, 0.1)"
                      : "rgba(139, 92, 246, 0.1)",
                  color:
                    formData.company === "Demand Curve Marketing"
                      ? "#10b981"
                      : "#8b5cf6",
                  fontWeight: 500,
                  fontFamily: '"Poppins", sans-serif',
                }}
              />
            </motion.div>
          )}
        </Grid>

        {/* Amount Input */}
        <Grid item xs={12} md={3}>
          <StyledTextField>
            <Box sx={{ position: "relative" }}>
              <AttachMoneyIcon
                sx={{
                  position: "absolute",
                  left: 12,
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "#64748b",
                  zIndex: 1,
                }}
              />
              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleAmountChange}
                placeholder="Enter amount"
                min="0"
                step="0.01"
                style={{
                  width: "100%",
                  padding: "16.5px 14px 16.5px 44px",
                  borderRadius: "12px",
                  border: "1px solid #cbd5e1",
                  backgroundColor: "#f8fafc",
                  fontFamily: '"Poppins", sans-serif',
                  fontSize: "0.875rem",
                  outline: "none",
                }}
              />
            </Box>
          </StyledTextField>

          {formData.amount && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Typography
                variant="caption"
                sx={{
                  mt: 1.5,
                  display: "block",
                  color: "#64748b",
                  fontFamily: '"Poppins", sans-serif',
                }}
              >
                Amount: ₹{parseFloat(formData.amount).toLocaleString("en-IN")}
              </Typography>
            </motion.div>
          )}
        </Grid>

        {/* Add Button */}
        <Grid item xs={12} md={2}>
          <Box
            sx={{
              display: "flex",
              justifyContent: { xs: "center", md: "flex-end" },
              alignItems: "flex-end",
              height: "56px",
            }}
          >
            <AddButton
              onClick={handleAdd}
              disabled={!isFormValid || loading}
              whileHover={{ scale: !isFormValid || loading ? 1 : 1.05 }}
              whileTap={{ scale: !isFormValid || loading ? 1 : 0.95 }}
            >
              {loading ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                <>
                  <AddIcon />
                  Add Budget
                </>
              )}
            </AddButton>
          </Box>
        </Grid>
      </Grid>

      {/* Form Status */}
      {!isFormValid && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Paper
            sx={{
              p: 2,
              mt: 2.5,
              borderRadius: 2,
              backgroundColor: "#fef3c7",
              border: "1px solid #fcd34d",
            }}
          >
            <Typography
              variant="body2"
              sx={{
                color: "#92400e",
                fontFamily: '"Poppins", sans-serif',
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
            >
              Please fill in all required fields to allocate a budget
            </Typography>
          </Paper>
        </motion.div>
      )}
    </FormCard>
  );
};

export default BudgetForm;
