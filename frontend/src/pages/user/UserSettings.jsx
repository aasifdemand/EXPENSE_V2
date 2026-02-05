import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Switch,
  FormControlLabel,
  Select,
  MenuItem,
  Button,
  Divider,
  Radio,
  RadioGroup,
  Slider,
  Avatar,
  Chip,
  IconButton,
} from "@mui/material";
import {
  Settings as SettingsIcon,
  Palette as PaletteIcon,
  Notifications as NotificationsIcon,
  Save as SaveIcon,
  RestartAlt as ResetIcon,
  Language as LanguageIcon,
  FormatSize as FormatSizeIcon,
  DarkMode as DarkModeIcon,
  BrightnessMedium as BrightnessMediumIcon,
  Email as EmailIcon,
  VolumeUp as VolumeUpIcon,
  Security as SecurityIcon,
  AccountCircle as AccountCircleIcon,
  Download as DownloadIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import { styled } from "@mui/material/styles";

// Styled Components
const SettingsContainer = styled(Container)(({ theme }) => ({
  padding: theme.spacing(4),
  minHeight: "100vh",
  backgroundColor: "#f8fafc",
  fontFamily: '"Poppins", sans-serif !important',
}));

const SidebarCard = styled(Card)(({ theme }) => ({
  borderRadius: 16,
  boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
  border: "1px solid rgba(226, 232, 240, 0.8)",
  backgroundColor: "white",
  height: "100%",
  position: "sticky",
  top: 24,
}));

const ContentCard = styled(Card)(({ theme }) => ({
  borderRadius: 16,
  boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
  border: "1px solid rgba(226, 232, 240, 0.8)",
  backgroundColor: "white",
  minHeight: "80vh",
}));

const SettingItem = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: 12,
  marginBottom: theme.spacing(2),
  border: "1px solid #e2e8f0",
  backgroundColor: "#f8fafc",
  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
  "&:hover": {
    backgroundColor: "white",
    transform: "translateY(-2px)",
    boxShadow: "0 8px 25px rgba(0, 0, 0, 0.08)",
    borderColor: "#cbd5e0",
  },
}));

const StyledSwitch = styled(Switch)(({ theme }) => ({
  "& .MuiSwitch-switchBase.Mui-checked": {
    color: "#3b82f6",
    "&:hover": {
      backgroundColor: "rgba(59, 130, 246, 0.08)",
    },
  },
  "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
    backgroundColor: "#3b82f6",
  },
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
  fontWeight: 600,
  color: "#1e293b",
  marginBottom: theme.spacing(3),
  fontSize: "1.5rem",
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(1),
}));

const SettingLabel = styled(Typography)(({ theme }) => ({
  fontWeight: 600,
  color: "#334155",
  fontSize: "1rem",
  marginBottom: theme.spacing(0.5),
}));

const SettingDescription = styled(Typography)(({ theme }) => ({
  color: "#64748b",
  fontSize: "0.875rem",
  lineHeight: 1.5,
}));

const ColorOption = styled(Box)(({ color, selected }) => ({
  width: 40,
  height: 40,
  borderRadius: 8,
  backgroundColor: color,
  cursor: "pointer",
  transition: "all 0.3s ease",
  border: selected ? "3px solid #3b82f6" : "3px solid transparent",
  boxShadow: selected ? "0 4px 12px rgba(59, 130, 246, 0.3)" : "none",
  "&:hover": {
    transform: "scale(1.1)",
  },
}));

const StyledButton = styled(Button)(({ theme, variant }) => ({
  borderRadius: 12,
  padding: theme.spacing(1.5, 3),
  textTransform: "none",
  fontWeight: 600,
  fontSize: "0.875rem",
  fontFamily: '"Poppins", sans-serif',
  ...(variant === "contained" && {
    background: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
    boxShadow: "0 4px 15px rgba(59, 130, 246, 0.3)",
    "&:hover": {
      background: "linear-gradient(135deg, #2563eb 0%, #1e40af 100%)",
      boxShadow: "0 6px 20px rgba(59, 130, 246, 0.4)",
    },
  }),
  ...(variant === "outlined" && {
    borderColor: "#ef4444",
    color: "#ef4444",
    "&:hover": {
      backgroundColor: "rgba(239, 68, 68, 0.08)",
      borderColor: "#dc2626",
    },
  }),
}));

const SettingsPage = () => {
  const [settings, setSettings] = useState({
    theme: "dark",
    notifications: true,
    emailUpdates: false,
    autoSave: true,
    language: "english",
    fontSize: "medium",
    privacy: "friends",
    twoFactor: false,
    soundEffects: true,
    reduceMotion: false,
    highContrast: false,
  });

  const [activeSection, setActiveSection] = useState("general");
  const [saveStatus, setSaveStatus] = useState("");

  const handleSettingChange = (key, value) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const saveSettings = () => {
    setSaveStatus("Saving changes...");
    setTimeout(() => {
      setSaveStatus("Settings saved successfully!");
      setTimeout(() => setSaveStatus(""), 3000);
    }, 1000);
  };

  const resetSettings = () => {
    setSettings({
      theme: "dark",
      notifications: true,
      emailUpdates: false,
      autoSave: true,
      language: "english",
      fontSize: "medium",
      privacy: "friends",
      twoFactor: false,
      soundEffects: true,
      reduceMotion: false,
      highContrast: false,
    });
    setSaveStatus("Settings reset to default!");
    setTimeout(() => setSaveStatus(""), 3000);
  };

  const sections = [
    { id: "general", label: "General", icon: <SettingsIcon /> },
    { id: "appearance", label: "Appearance", icon: <PaletteIcon /> },
    {
      id: "notifications",
      label: "Notifications",
      icon: <NotificationsIcon />,
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

  const sidebarVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.4,
      },
    },
  };

  return (
    <SettingsContainer maxWidth="lg">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <Typography
          variant="h4"
          sx={{
            fontWeight: 700,
            color: "#1e293b",
            mb: 4,
            fontFamily: '"Poppins", sans-serif',
            background: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Settings
        </Typography>

        <Grid container spacing={4}>
          {/* Sidebar */}
          <Grid item xs={12} md={3}>
            <motion.div variants={sidebarVariants}>
              <SidebarCard>
                <CardContent sx={{ p: 3 }}>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 600,
                      color: "#334155",
                      mb: 3,
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                    }}
                  >
                    <SettingsIcon /> Categories
                  </Typography>
                  <Box
                    sx={{ display: "flex", flexDirection: "column", gap: 1 }}
                  >
                    {sections.map((section) => (
                      <motion.div
                        key={section.id}
                        whileHover={{ x: 4 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Button
                          fullWidth
                          startIcon={section.icon}
                          onClick={() => setActiveSection(section.id)}
                          sx={{
                            justifyContent: "flex-start",
                            py: 1.5,
                            borderRadius: 2,
                            textTransform: "none",
                            fontWeight:
                              activeSection === section.id ? 600 : 500,
                            fontSize: "0.875rem",
                            backgroundColor:
                              activeSection === section.id
                                ? "rgba(59, 130, 246, 0.1)"
                                : "transparent",
                            color:
                              activeSection === section.id
                                ? "#3b82f6"
                                : "#64748b",
                            border:
                              activeSection === section.id
                                ? "1px solid rgba(59, 130, 246, 0.2)"
                                : "1px solid transparent",
                            "&:hover": {
                              backgroundColor:
                                activeSection === section.id
                                  ? "rgba(59, 130, 246, 0.15)"
                                  : "rgba(0, 0, 0, 0.04)",
                            },
                          }}
                        >
                          {section.label}
                        </Button>
                      </motion.div>
                    ))}
                  </Box>
                </CardContent>
              </SidebarCard>
            </motion.div>
          </Grid>

          {/* Content Area */}
          <Grid item xs={12} md={9}>
            <AnimatePresence mode="wait">
              <motion.div
                key={activeSection}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <ContentCard>
                  <CardContent sx={{ p: 4 }}>
                    {activeSection === "general" && (
                      <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                      >
                        <SectionTitle variant="h5">
                          <SettingsIcon /> General Settings
                        </SectionTitle>

                        <motion.div variants={itemVariants}>
                          <SettingItem>
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                              }}
                            >
                              <Box>
                                <SettingLabel>Auto Save</SettingLabel>
                                <SettingDescription>
                                  Automatically save your work as you type
                                </SettingDescription>
                              </Box>
                              <FormControlLabel
                                control={
                                  <StyledSwitch
                                    checked={settings.autoSave}
                                    onChange={(e) =>
                                      handleSettingChange(
                                        "autoSave",
                                        e.target.checked
                                      )
                                    }
                                  />
                                }
                                label=""
                              />
                            </Box>
                          </SettingItem>
                        </motion.div>

                        <motion.div variants={itemVariants}>
                          <SettingItem>
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                              }}
                            >
                              <Box>
                                <SettingLabel>Language</SettingLabel>
                                <SettingDescription>
                                  Choose your preferred language
                                </SettingDescription>
                              </Box>
                              <Select
                                value={settings.language}
                                onChange={(e) =>
                                  handleSettingChange(
                                    "language",
                                    e.target.value
                                  )
                                }
                                size="small"
                                sx={{
                                  minWidth: 120,
                                  borderRadius: 2,
                                  fontFamily: '"Poppins", sans-serif',
                                }}
                              >
                                <MenuItem value="english">English</MenuItem>
                                <MenuItem value="spanish">Spanish</MenuItem>
                                <MenuItem value="french">French</MenuItem>
                                <MenuItem value="german">German</MenuItem>
                                <MenuItem value="japanese">Japanese</MenuItem>
                              </Select>
                            </Box>
                          </SettingItem>
                        </motion.div>

                        <motion.div variants={itemVariants}>
                          <SettingItem>
                            <Box>
                              <SettingLabel sx={{ mb: 2 }}>
                                Font Size
                              </SettingLabel>
                              <SettingDescription sx={{ mb: 2 }}>
                                Adjust the text size throughout the application
                              </SettingDescription>
                              <RadioGroup
                                row
                                value={settings.fontSize}
                                onChange={(e) =>
                                  handleSettingChange(
                                    "fontSize",
                                    e.target.value
                                  )
                                }
                                sx={{ gap: 2 }}
                              >
                                {["small", "medium", "large"].map((size) => (
                                  <Paper
                                    key={size}
                                    sx={{
                                      p: 1.5,
                                      borderRadius: 2,
                                      border:
                                        settings.fontSize === size
                                          ? "2px solid #3b82f6"
                                          : "1px solid #e2e8f0",
                                      backgroundColor:
                                        settings.fontSize === size
                                          ? "rgba(59, 130, 246, 0.05)"
                                          : "white",
                                      cursor: "pointer",
                                      minWidth: 100,
                                    }}
                                    onClick={() =>
                                      handleSettingChange("fontSize", size)
                                    }
                                  >
                                    <Box
                                      sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 1,
                                      }}
                                    >
                                      <Radio
                                        checked={settings.fontSize === size}
                                        value={size}
                                        sx={{ p: 0 }}
                                      />
                                      <Typography
                                        sx={{
                                          textTransform: "capitalize",
                                          fontWeight: 500,
                                        }}
                                      >
                                        {size}
                                      </Typography>
                                    </Box>
                                  </Paper>
                                ))}
                              </RadioGroup>
                            </Box>
                          </SettingItem>
                        </motion.div>
                      </motion.div>
                    )}

                    {activeSection === "appearance" && (
                      <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                      >
                        <SectionTitle variant="h5">
                          <PaletteIcon /> Appearance
                        </SectionTitle>

                        <motion.div variants={itemVariants}>
                          <SettingItem>
                            <Box>
                              <SettingLabel sx={{ mb: 2 }}>Theme</SettingLabel>
                              <SettingDescription sx={{ mb: 2 }}>
                                Choose your preferred theme style
                              </SettingDescription>
                              <RadioGroup
                                row
                                value={settings.theme}
                                onChange={(e) =>
                                  handleSettingChange("theme", e.target.value)
                                }
                                sx={{ gap: 2 }}
                              >
                                {[
                                  {
                                    value: "light",
                                    label: "Light",
                                    icon: <BrightnessMediumIcon />,
                                  },
                                  {
                                    value: "dark",
                                    label: "Dark",
                                    icon: <DarkModeIcon />,
                                  },
                                  {
                                    value: "auto",
                                    label: "Auto",
                                    icon: <SettingsIcon />,
                                  },
                                ].map((theme) => (
                                  <Paper
                                    key={theme.value}
                                    sx={{
                                      p: 2,
                                      borderRadius: 2,
                                      border:
                                        settings.theme === theme.value
                                          ? "2px solid #3b82f6"
                                          : "1px solid #e2e8f0",
                                      backgroundColor:
                                        settings.theme === theme.value
                                          ? "rgba(59, 130, 246, 0.05)"
                                          : "white",
                                      cursor: "pointer",
                                      minWidth: 120,
                                      display: "flex",
                                      flexDirection: "column",
                                      alignItems: "center",
                                      gap: 1,
                                    }}
                                    onClick={() =>
                                      handleSettingChange("theme", theme.value)
                                    }
                                  >
                                    {theme.icon}
                                    <Typography sx={{ fontWeight: 500 }}>
                                      {theme.label}
                                    </Typography>
                                  </Paper>
                                ))}
                              </RadioGroup>
                            </Box>
                          </SettingItem>
                        </motion.div>

                        <motion.div variants={itemVariants}>
                          <SettingItem>
                            <Box>
                              <SettingLabel sx={{ mb: 2 }}>
                                Accent Color
                              </SettingLabel>
                              <SettingDescription sx={{ mb: 2 }}>
                                Choose your primary color theme
                              </SettingDescription>
                              <Box
                                sx={{
                                  display: "flex",
                                  gap: 2,
                                  flexWrap: "wrap",
                                }}
                              >
                                {[
                                  "#3b82f6",
                                  "#8b5cf6",
                                  "#ef4444",
                                  "#10b981",
                                  "#f59e0b",
                                  "#ec4899",
                                ].map((color) => (
                                  <motion.div
                                    key={color}
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.95 }}
                                  >
                                    <ColorOption
                                      color={color}
                                      selected={settings.theme === color}
                                      onClick={() =>
                                        handleSettingChange("theme", color)
                                      }
                                    />
                                  </motion.div>
                                ))}
                              </Box>
                            </Box>
                          </SettingItem>
                        </motion.div>
                      </motion.div>
                    )}

                    {activeSection === "notifications" && (
                      <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                      >
                        <SectionTitle variant="h5">
                          <NotificationsIcon /> Notifications
                        </SectionTitle>

                        <motion.div variants={itemVariants}>
                          <SettingItem>
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                              }}
                            >
                              <Box>
                                <SettingLabel>
                                  Enable Notifications
                                </SettingLabel>
                                <SettingDescription>
                                  Receive desktop and browser notifications
                                </SettingDescription>
                              </Box>
                              <FormControlLabel
                                control={
                                  <StyledSwitch
                                    checked={settings.notifications}
                                    onChange={(e) =>
                                      handleSettingChange(
                                        "notifications",
                                        e.target.checked
                                      )
                                    }
                                  />
                                }
                                label=""
                              />
                            </Box>
                          </SettingItem>
                        </motion.div>

                        <motion.div variants={itemVariants}>
                          <SettingItem>
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                              }}
                            >
                              <Box>
                                <SettingLabel>Email Updates</SettingLabel>
                                <SettingDescription>
                                  Receive important updates via email
                                </SettingDescription>
                              </Box>
                              <FormControlLabel
                                control={
                                  <StyledSwitch
                                    checked={settings.emailUpdates}
                                    onChange={(e) =>
                                      handleSettingChange(
                                        "emailUpdates",
                                        e.target.checked
                                      )
                                    }
                                  />
                                }
                                label=""
                              />
                            </Box>
                          </SettingItem>
                        </motion.div>

                        <motion.div variants={itemVariants}>
                          <SettingItem>
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                              }}
                            >
                              <Box>
                                <SettingLabel>Sound Effects</SettingLabel>
                                <SettingDescription>
                                  Play sounds for notifications
                                </SettingDescription>
                              </Box>
                              <FormControlLabel
                                control={
                                  <StyledSwitch
                                    checked={settings.soundEffects}
                                    onChange={(e) =>
                                      handleSettingChange(
                                        "soundEffects",
                                        e.target.checked
                                      )
                                    }
                                  />
                                }
                                label=""
                              />
                            </Box>
                          </SettingItem>
                        </motion.div>
                      </motion.div>
                    )}

                    {/* Action Buttons */}
                    <motion.div variants={itemVariants}>
                      <Divider sx={{ my: 4 }} />
                      <Box
                        sx={{
                          display: "flex",
                          gap: 2,
                          justifyContent: "flex-end",
                        }}
                      >
                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <StyledButton
                            variant="outlined"
                            startIcon={<ResetIcon />}
                            onClick={resetSettings}
                          >
                            Reset to Default
                          </StyledButton>
                        </motion.div>
                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <StyledButton
                            variant="contained"
                            startIcon={<SaveIcon />}
                            onClick={saveSettings}
                          >
                            Save Changes
                          </StyledButton>
                        </motion.div>
                      </Box>

                      {saveStatus && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                        >
                          <Chip
                            label={saveStatus}
                            color={
                              saveStatus.includes("successfully")
                                ? "success"
                                : "info"
                            }
                            sx={{
                              mt: 2,
                              fontFamily: '"Poppins", sans-serif',
                              fontWeight: 500,
                            }}
                          />
                        </motion.div>
                      )}
                    </motion.div>
                  </CardContent>
                </ContentCard>
              </motion.div>
            </AnimatePresence>
          </Grid>
        </Grid>
      </motion.div>
    </SettingsContainer>
  );
};

export default SettingsPage;
