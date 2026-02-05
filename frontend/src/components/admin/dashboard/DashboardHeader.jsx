import { Box, Typography } from "@mui/material";
import { styled } from "@mui/material/styles";

const GradientTypography = styled(Typography)(() => ({
  background: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
  fontWeight: 700,
  fontFamily: '"Poppins", sans-serif',
}));

const DashboardHeader = () => (
  <Box sx={{ mb: 4 }}>
    <GradientTypography variant="h4" sx={{ mb: 1 }}>
      Admin Dashboard
    </GradientTypography>
    <Typography variant="h6" sx={{ color: "#64748b", fontWeight: 400 }}>
      Overview of budgets, expenses, and reimbursements
    </Typography>
  </Box>
);

export default DashboardHeader;
