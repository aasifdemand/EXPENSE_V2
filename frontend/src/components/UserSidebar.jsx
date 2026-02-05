import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
  Box,
  Divider,
  useTheme,
  useMediaQuery,
  Chip,
  alpha,
} from "@mui/material";

import {
  Dashboard as DashboardIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  Autorenew,
} from "@mui/icons-material";

import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../store/authSlice";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import PieChartIcon from "@mui/icons-material/PieChart";
import { motion, AnimatePresence } from "framer-motion";
import ListItemButton from "@mui/material/ListItemButton";

const UserSidebar = ({ open, onClose }) => {
  const dispatch = useDispatch();
  const { csrf, loading: logoutLoader } = useSelector((state) => state?.auth);
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const isSmallMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [activeItem, setActiveItem] = useState("");

  // Menu items with their respective icons and paths
  const menuItems = [
    { text: "Dashboard", icon: <DashboardIcon />, path: "/user/dashboard" },
    { text: "Budgeting", icon: <PieChartIcon />, path: "/user/budgeting" },
    { text: "Expenses", icon: <AttachMoneyIcon />, path: "/user/expenses" },
    { text: "Settings", icon: <SettingsIcon />, path: "/user/settings" },
  ];

  useEffect(() => {
    setActiveItem(location.pathname);
  }, [location.pathname]);

  const handleMenuItemClick = (path) => {
    navigate(path);
    setActiveItem(path);
    if (isMobile) onClose();
  };

  const handleLogoutClick = async () => {
    await dispatch(logout(csrf));
  };

  // Framer Motion variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        duration: 0.4,
        ease: "easeOut",
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.3,
        ease: "easeOut",
      },
    },
  };

  const logoVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
  };

  // Enhanced Logo Component
  const Logo = () => (
    <motion.div variants={logoVariants} initial="hidden" animate="visible">
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          padding: isSmallMobile ? "12px 0" : "20px 0",
          position: "relative",
        }}
      >
        <Box
          sx={{
            width: isSmallMobile ? "160px" : isMobile ? "220px" : "280px",
            height: isSmallMobile ? "70px" : isMobile ? "70px" : "80px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
            borderRadius: "12px",
            backgroundColor: "white",
            padding: "8px",
            boxShadow: "0 4px 20px rgba(59, 130, 246, 0.1)",
            border: "1px solid rgba(59, 130, 246, 0.1)",
            transition: "all 0.3s ease",
            "&:hover": {
              boxShadow: "0 6px 24px rgba(59, 130, 246, 0.15)",
              transform: "translateY(-1px)",
            },
          }}
        >
          <img
            src="/image.png"
            alt="Company Logo"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "contain",
              transition: "transform 0.3s ease",
            }}
            onError={(e) => {
              e.target.src = "/image.svg";
              e.target.onerror = () => {
                e.target.src = "/vite.svg";
                e.target.onerror = () => {
                  e.target.style.display = "none";
                  const fallback =
                    e.target.parentElement.querySelector(".logo-fallback");
                  if (fallback) fallback.style.display = "flex";
                };
              };
            }}
          />
        </Box>
      </Box>
    </motion.div>
  );

  const SidebarContent = () => (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        background: "linear-gradient(180deg, #FFFFFF 0%, #F8FAFC 100%)",
        color: "#1E293B",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        position: "relative",
        overflow: "hidden",
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "4px",
          background:
            "linear-gradient(90deg, #3B82F6 0%, #60A5FA 50%, #93C5FD 100%)",
          zIndex: 1,
        },
      }}
    >
      {/* Header with Logo */}
      <Box
        sx={{
          p: isSmallMobile ? 2 : 3,
          pb: isSmallMobile ? 1.5 : 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          background: "white",
          borderBottom: "1px solid rgba(203, 213, 225, 0.3)",
          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
          fontFamily: "'Poppins', sans-serif",
        }}
      >
        <Logo />
      </Box>

      {/* Divider with gradient */}
      <Divider
        sx={{
          my: 0.5,
          mx: isSmallMobile ? 2 : 3,
          background:
            "linear-gradient(90deg, transparent 0%, rgba(59, 130, 246, 0.1) 50%, transparent 100%)",
          height: "1px",
        }}
      />

      {/* Navigation Menu */}
      <List
        component={motion.ul}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        sx={{
          flex: 1,
          px: isSmallMobile ? 1.5 : 2.5,
          py: 2,
        }}
      >
        {menuItems.map((item) => {
          const isActive = activeItem === item.path;

          return (
            <ListItem
              key={item.path}
              component={motion.li}
              variants={itemVariants}
              onClick={() => handleMenuItemClick(item.path)}
              sx={{
                borderRadius: "12px",
                mb: 1.5,
                mx: isSmallMobile ? 0.5 : 0,
                px: isSmallMobile ? 2 : 2.5,
                py: isSmallMobile ? 1.25 : 1.5,
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                position: "relative",
                overflow: "hidden",
                cursor: "pointer",
                background: isActive
                  ? "linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)"
                  : "transparent",

                border: isActive
                  ? "1.5px solid #3B82F6"
                  : "1px solid transparent",
                "&::before": isActive
                  ? {
                      content: '""',
                      position: "absolute",
                      left: 0,
                      top: "50%",
                      transform: "translateY(-50%)",
                      width: "4px",
                      height: "70%",
                      background:
                        "linear-gradient(180deg, #60A5FA 0%, #3B82F6 100%)",
                      borderRadius: "0 4px 4px 0",
                      boxShadow: "0 0 12px rgba(59, 130, 246, 0.4)",
                    }
                  : {},

                "&:hover": {
                  background: isActive
                    ? "linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)"
                    : "rgba(59, 130, 246, 0.06)",
                  boxShadow: "0 4px 16px rgba(59, 130, 246, 0.12)",
                },

                "&:hover": {
                  background: isActive
                    ? "linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)"
                    : "rgba(59, 130, 246, 0.06)",
                  boxShadow: "0 4px 16px rgba(59, 130, 246, 0.12)",
                },
              }}
            >
              <ListItemIcon
                sx={{
                  color: isActive ? "white" : "#64748B",
                  minWidth: isSmallMobile ? 36 : 44,
                  position: "relative",
                  zIndex: 1,
                  transition: "all 0.3s ease",
                  "& svg": {
                    fontSize: isSmallMobile ? "1.25rem" : "1.35rem",
                  },
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      width: "100%",
                      position: "relative",
                      zIndex: 1,
                    }}
                  >
                    <Typography
                      variant="body1"
                      sx={{
                        fontWeight: isActive ? 600 : 500,
                        color: isActive ? "white" : "#1E293B",
                        fontSize: isSmallMobile ? "0.85rem" : "0.95rem",
                        letterSpacing: "0.15px",
                        transition: "all 0.2s ease",
                      }}
                    >
                      {item.text}
                    </Typography>
                    {isActive && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.1 }}
                      >
                        <Box
                          sx={{
                            width: "8px",
                            height: "8px",
                            borderRadius: "50%",
                            backgroundColor: "white",
                            boxShadow: "0 0 8px rgba(255, 255, 255, 0.8)",
                          }}
                        />
                      </motion.div>
                    )}
                  </Box>
                }
              />
            </ListItem>
          );
        })}
      </List>

      {/* Logout Section */}
      <Box
        sx={{
          p: isSmallMobile ? 2 : 3,
          pt: 0,
          borderTop: "1px solid rgba(203, 213, 225, 0.3)",
          background: "white",
        }}
      >
        <motion.div variants={itemVariants} initial="hidden" animate="visible">
          <ListItem
            button
            onClick={handleLogoutClick}
            disabled={logoutLoader}
            sx={{
              borderRadius: "12px",
              px: isSmallMobile ? 2 : 2.5,
              py: isSmallMobile ? 1.25 : 1.5,
              background: "rgba(239, 68, 68, 0.05)",
              border: "1.5px solid rgba(239, 68, 68, 0.15)",
              color: "#EF4444",
              boxShadow: "0 2px 8px rgba(239, 68, 68, 0.05)",

              "&:hover": {
                boxShadow: "0 6px 20px rgba(239, 68, 68, 0.15)",
              },
              "&:disabled": {
                opacity: 0.7,
                transform: "none",
              },
            }}
          >
            <ListItemIcon
              sx={{
                color: "inherit",
                minWidth: isSmallMobile ? 36 : 44,
                transition: "all 0.3s ease",

                ...(logoutLoader && {
                  animation: "spin 1s linear infinite",
                  "@keyframes spin": {
                    "0%": { transform: "rotate(0deg)" },
                    "100%": { transform: "rotate(360deg)" },
                  },
                }),
              }}
            >
              {logoutLoader ? <Autorenew /> : <LogoutIcon />}
            </ListItemIcon>
            <ListItemText
              primary={
                <Typography
                  variant="body1"
                  sx={{
                    fontWeight: 600,
                    fontSize: isSmallMobile ? "0.85rem" : "0.95rem",
                    color: "inherit",
                    letterSpacing: "0.15px",
                  }}
                >
                  {logoutLoader ? "Logging out..." : "Logout"}
                </Typography>
              }
            />
          </ListItem>
        </motion.div>
      </Box>
    </Box>
  );

  const drawerWidth = isSmallMobile ? 280 : 320;

  return (
    <>
      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        open={open}
        onClose={onClose}
        ModalProps={{
          keepMounted: true,
          BackdropProps: {
            sx: {
              backgroundColor: "rgba(15, 23, 42, 0.7)",
              backdropFilter: "blur(12px)",
            },
          },
        }}
        sx={{
          display: { xs: "block", md: "none" },
          "& .MuiDrawer-paper": {
            boxSizing: "border-box",
            width: drawerWidth,
            border: "none",
            boxShadow: "24px 0 48px rgba(0, 0, 0, 0.15)",
            transition: "transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
          },
        }}
      >
        <SidebarContent />
      </Drawer>

      {/* Desktop Drawer */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: "none", md: "block" },
          "& .MuiDrawer-paper": {
            boxSizing: "border-box",
            width: 300,
            border: "none",
            boxShadow: "8px 0 32px rgba(59, 130, 246, 0.08)",
            transition: "all 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
            position: "fixed",
            height: "100vh",
            top: 0,
            left: 0,
            zIndex: 1200,
            "&:hover": {
              boxShadow: "12px 0 40px rgba(59, 130, 246, 0.12)",
            },
          },
        }}
        open
      >
        <SidebarContent />
      </Drawer>
    </>
  );
};

export default UserSidebar;
