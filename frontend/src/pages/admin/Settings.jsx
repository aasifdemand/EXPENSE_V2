import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { updateUserProfile, fetchUser } from "../../store/authSlice";
import { useToastMessage } from "../../hooks/useToast";
import {
  Box,
  Typography,
  TextField,
  Button,
  Avatar,
  Paper,
  CircularProgress,
  useTheme,
  useMediaQuery,
  Grid,
  Card,
  CardContent,
  Divider,
  IconButton,
  Chip,
  Alert,
} from "@mui/material";
import {
  Edit as EditIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  AdminPanelSettings as AdminIcon,
  Person as PersonIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  VerifiedUser as VerifiedIcon,
  CalendarToday as CalendarIcon,
  Security as SecurityIcon,
  Badge as BadgeIcon,
} from "@mui/icons-material";
import { motion, AnimatePresence } from "framer-motion";
import { styled } from "@mui/material/styles";

const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: 16,
  boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
  border: "1px solid rgba(226, 232, 240, 0.8)",
  backgroundColor: "white",
  transition: "all 0.3s ease",
  height: "100%",
  display: "flex",
  flexDirection: "column",
  "&:hover": {
    boxShadow: "0 8px 30px rgba(0,0,0,0.08)",
  },
}));

const ProfileAvatar = styled(Avatar)(({ theme }) => ({
  width: 100,
  height: 100,
  border: "4px solid white",
  boxShadow: "0 4px 20px rgba(59, 130, 246, 0.3)",
  fontSize: "2.5rem",
  fontWeight: 600,
}));

const InfoItem = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(1.5),
  padding: theme.spacing(1.5),
  borderRadius: 12,
  backgroundColor: "#f8fafc",
  border: "1px solid #e2e8f0",
  marginBottom: theme.spacing(1),
  transition: "all 0.2s ease",
  "&:hover": {
    backgroundColor: "#f1f5f9",
    borderColor: "#cbd5e0",
  },
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  "& .MuiOutlinedInput-root": {
    borderRadius: 12,
    backgroundColor: "#f8fafc",
    "&:hover .MuiOutlinedInput-notchedOutline": {
      borderColor: "#3b82f6",
    },
    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
      borderColor: "#3b82f6",
      borderWidth: 2,
    },
  },
  "& .MuiInputLabel-root": {
    fontFamily: '"Poppins", sans-serif',
  },
  "& .MuiInputBase-input": {
    fontFamily: '"Poppins", sans-serif',
  },
}));

const PrimaryButton = styled(Button)(({ theme }) => ({
  borderRadius: 12,
  padding: theme.spacing(1.25, 3),
  textTransform: "none",
  fontWeight: 600,
  fontSize: "0.875rem",
  fontFamily: '"Poppins", sans-serif',
  background: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
  boxShadow: "0 4px 15px rgba(59, 130, 246, 0.3)",
  "&:hover": {
    background: "linear-gradient(135deg, #2563eb 0%, #1e40af 100%)",
    boxShadow: "0 6px 20px rgba(59, 130, 246, 0.4)",
  },
  "&.Mui-disabled": {
    background: "#94a3b8",
  },
}));

const SecondaryButton = styled(Button)(({ theme }) => ({
  borderRadius: 12,
  padding: theme.spacing(1.25, 3),
  textTransform: "none",
  fontWeight: 600,
  fontSize: "0.875rem",
  fontFamily: '"Poppins", sans-serif',
  borderColor: "#e2e8f0",
  color: "#64748b",
  "&:hover": {
    backgroundColor: "#f1f5f9",
    borderColor: "#cbd5e0",
  },
}));

const SettingsPage = () => {
  const dispatch = useDispatch();
  const { user, updateProfileLoading } = useSelector((state) => state.auth);
  const { success, error: catchError } = useToastMessage();
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const [userProfile, setUserProfile] = useState({
    name: "",
    email: "",
    phone: "",
  });

  useEffect(() => {
    dispatch(fetchUser());
  }, [dispatch]);

  // Initialize user profile from Redux state
  useEffect(() => {
    if (user) {
      setUserProfile({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
      });
    }
  }, [user]);

  // Event Handlers
  const handleProfileChange = (key, value) => {
    setUserProfile((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  // Action Functions
  const saveProfile = async () => {
    if (!user?._id) {
      catchError("User ID is missing. Please log in again.");
      return;
    }

    try {
      const result = await dispatch(
        updateUserProfile({
          ...userProfile,
          userId: user._id,
        })
      ).unwrap();

      setIsEditingProfile(false);

      if (updateUserProfile.fulfilled.matches(result)) {
        success("Profile updated successfully");
        setTimeout(() => {
          dispatch(fetchUser());
        }, 5000);
      }
    } catch (error) {
      catchError("Error in updating the profile: " + error?.message);
      console.log(error);
    }
  };

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

  const getFormattedDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getInitials = (name) => {
    if (!name) return "👤";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundColor: "#f8fafc",
        py: 4,
        px: { xs: 2, sm: 3, md: 4 },
        fontFamily: '"Poppins", sans-serif',
        width: "100%",
        maxWidth: "100%",
      }}
    >
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              color: "#1e293b",
              mb: 1,
              background: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              fontSize: { xs: "1.75rem", md: "2.125rem" },
            }}
          >
            Account Settings
          </Typography>
          <Typography
            variant="h6"
            sx={{
              color: "#64748b",
              fontWeight: 400,
              fontSize: { xs: "1rem", md: "1.25rem" },
            }}
          >
            Manage your account preferences and profile information
          </Typography>
        </Box>

        <Grid container spacing={3} alignItems="stretch">
          {/* Profile Overview Card */}
          <Grid item xs={12} md={5}>
            <motion.div variants={itemVariants}>
              <StyledCard>
                <CardContent
                  sx={{
                    p: 10,
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    width: "600px",
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      mb: 1,
                    }}
                  >
                    <ProfileAvatar
                      sx={{
                        mb: 2,
                        background:
                          "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
                      }}
                    >
                      {getInitials(user?.name)}
                    </ProfileAvatar>

                    <Typography
                      variant="h5"
                      sx={{
                        fontWeight: 700,
                        color: "#1e293b",
                        textAlign: "center",
                        mb: 0.5,
                      }}
                    >
                      {user?.name || "User Name"}
                    </Typography>

                    <Chip
                      icon={<BadgeIcon />}
                      label={
                        user?.role === "superadmin" ? "Super Admin" : "User"
                      }
                      color={
                        user?.role === "superadmin" ? "primary" : "default"
                      }
                      size="small"
                      sx={{ fontWeight: 600, mb: 2 }}
                    />

                    {!isEditingProfile && (
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <PrimaryButton
                          variant="contained"
                          startIcon={<EditIcon />}
                          onClick={() => setIsEditingProfile(true)}
                          fullWidth
                        >
                          Edit Profile
                        </PrimaryButton>
                      </motion.div>
                    )}
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  {/* Account Details */}
                  <Box sx={{ mt: 2 }}>
                    <InfoItem>
                      <VerifiedIcon sx={{ color: "#10b981", fontSize: 20 }} />
                      <Box>
                        <Typography
                          variant="caption"
                          sx={{ color: "#64748b", display: "block" }}
                        >
                          Account Status
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{ fontWeight: 600, color: "#10b981" }}
                        >
                          Active
                        </Typography>
                      </Box>
                    </InfoItem>

                    <InfoItem>
                      <CalendarIcon sx={{ color: "#f59e0b", fontSize: 20 }} />
                      <Box>
                        <Typography
                          variant="caption"
                          sx={{ color: "#64748b", display: "block" }}
                        >
                          Member Since
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{ fontWeight: 600, color: "#1e293b" }}
                        >
                          {getFormattedDate(user?.createdAt)}
                        </Typography>
                      </Box>
                    </InfoItem>

                    <InfoItem>
                      <SecurityIcon sx={{ color: "#8b5cf6", fontSize: 20 }} />
                      <Box>
                        <Typography
                          variant="caption"
                          sx={{ color: "#64748b", display: "block" }}
                        >
                          Security Level
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{ fontWeight: 600, color: "#1e293b" }}
                        >
                          Standard
                        </Typography>
                      </Box>
                    </InfoItem>
                  </Box>
                </CardContent>
              </StyledCard>
            </motion.div>
          </Grid>

          {/* Profile Information Card */}
          <Grid item xs={12} md={9.5}>
            <AnimatePresence mode="wait">
              <motion.div
                key={isEditingProfile ? "edit" : "view"}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <StyledCard>
                  <CardContent
                    sx={{
                      p: 3,
                      flex: 1,
                      display: "flex",
                      flexDirection: "column",
                      width: "600px",
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        mb: 3,
                      }}
                    >
                      <Typography
                        variant="h5"
                        sx={{
                          fontWeight: 600,
                          color: "#1e293b",
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                        }}
                      >
                        <PersonIcon /> Profile Information
                      </Typography>

                      {isEditingProfile ? (
                        <Chip
                          label="Editing"
                          color="warning"
                          size="small"
                          icon={<EditIcon />}
                        />
                      ) : (
                        <Chip
                          label="Viewing"
                          color="success"
                          size="small"
                          icon={<VerifiedIcon />}
                        />
                      )}
                    </Box>

                    {!isEditingProfile ? (
                      // View Mode
                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          gap: 2,
                        }}
                      >
                        <InfoItem>
                          <EmailIcon sx={{ color: "#3b82f6", fontSize: 20 }} />
                          <Box sx={{ flex: 1 }}>
                            <Typography
                              variant="caption"
                              sx={{ color: "#64748b", display: "block" }}
                            >
                              Email Address
                            </Typography>
                            <Typography
                              variant="body1"
                              sx={{ fontWeight: 500, color: "#1e293b" }}
                            >
                              {user?.email}
                            </Typography>
                          </Box>
                        </InfoItem>

                        {user?.phone && (
                          <InfoItem>
                            <PhoneIcon
                              sx={{ color: "#ef4444", fontSize: 20 }}
                            />
                            <Box sx={{ flex: 1 }}>
                              <Typography
                                variant="caption"
                                sx={{ color: "#64748b", display: "block" }}
                              >
                                Phone Number
                              </Typography>
                              <Typography
                                variant="body1"
                                sx={{ fontWeight: 500, color: "#1e293b" }}
                              >
                                {user?.phone}
                              </Typography>
                            </Box>
                          </InfoItem>
                        )}

                        {user?.userLoc && (
                          <InfoItem>
                            <LocationIcon
                              sx={{ color: "#10b981", fontSize: 20 }}
                            />
                            <Box sx={{ flex: 1 }}>
                              <Typography
                                variant="caption"
                                sx={{ color: "#64748b", display: "block" }}
                              >
                                Location
                              </Typography>
                              <Typography
                                variant="body1"
                                sx={{ fontWeight: 500, color: "#1e293b" }}
                              >
                                {user?.userLoc}
                              </Typography>
                            </Box>
                          </InfoItem>
                        )}

                        <InfoItem>
                          <AdminIcon sx={{ color: "#8b5cf6", fontSize: 20 }} />
                          <Box sx={{ flex: 1 }}>
                            <Typography
                              variant="caption"
                              sx={{ color: "#64748b", display: "block" }}
                            >
                              Account Role
                            </Typography>
                            <Typography
                              variant="body1"
                              sx={{ fontWeight: 500, color: "#1e293b" }}
                            >
                              {user?.role === "superadmin"
                                ? "Super Administrator"
                                : "Standard User"}
                            </Typography>
                          </Box>
                        </InfoItem>
                      </Box>
                    ) : (
                      // Edit Mode
                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          gap: 3,
                        }}
                      >
                        <Box>
                          <Typography
                            variant="body2"
                            sx={{ fontWeight: 600, color: "#334155", mb: 1 }}
                          >
                            Full Name
                          </Typography>
                          <StyledTextField
                            fullWidth
                            value={userProfile.name}
                            onChange={(e) =>
                              handleProfileChange("name", e.target.value)
                            }
                            placeholder="Enter your full name"
                            variant="outlined"
                            size="medium"
                          />
                        </Box>

                        <Box>
                          <Typography
                            variant="body2"
                            sx={{ fontWeight: 600, color: "#334155", mb: 1 }}
                          >
                            Email Address
                          </Typography>
                          <StyledTextField
                            fullWidth
                            type="email"
                            value={userProfile.email}
                            onChange={(e) =>
                              handleProfileChange("email", e.target.value)
                            }
                            placeholder="Enter your email address"
                            variant="outlined"
                            size="medium"
                          />
                        </Box>

                        <Box>
                          <Typography
                            variant="body2"
                            sx={{ fontWeight: 600, color: "#334155", mb: 1 }}
                          >
                            Phone Number
                          </Typography>
                          <StyledTextField
                            fullWidth
                            type="tel"
                            value={userProfile.phone}
                            onChange={(e) =>
                              handleProfileChange("phone", e.target.value)
                            }
                            placeholder="Enter your phone number"
                            variant="outlined"
                            size="medium"
                          />
                        </Box>

                        {updateProfileLoading && (
                          <Alert severity="info" sx={{ borderRadius: 2 }}>
                            <Typography variant="body2">
                              Saving your changes...
                            </Typography>
                          </Alert>
                        )}

                        <Box
                          sx={{
                            display: "flex",
                            gap: 2,
                            flexWrap: "wrap",
                            mt: 2,
                          }}
                        >
                          <motion.div
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <PrimaryButton
                              variant="contained"
                              startIcon={
                                updateProfileLoading ? (
                                  <CircularProgress size={16} />
                                ) : (
                                  <SaveIcon />
                                )
                              }
                              onClick={saveProfile}
                              disabled={updateProfileLoading}
                            >
                              {updateProfileLoading
                                ? "Saving..."
                                : "Save Changes"}
                            </PrimaryButton>
                          </motion.div>

                          <motion.div
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <SecondaryButton
                              variant="outlined"
                              startIcon={<CancelIcon />}
                              onClick={() => setIsEditingProfile(false)}
                              disabled={updateProfileLoading}
                            >
                              Cancel
                            </SecondaryButton>
                          </motion.div>
                        </Box>
                      </Box>
                    )}
                  </CardContent>
                </StyledCard>
              </motion.div>
            </AnimatePresence>
          </Grid>
        </Grid>
      </motion.div>
    </Box>
  );
};

export default SettingsPage;
