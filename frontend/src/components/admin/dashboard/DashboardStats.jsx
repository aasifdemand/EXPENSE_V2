import { Card, CardContent, Box, Typography } from "@mui/material";
import { styled } from "@mui/material/styles";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import BusinessIcon from "@mui/icons-material/Business";

const DashboardCard = styled(Card)(() => ({
  borderRadius: 16,
  boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
  border: "1px solid rgba(226, 232, 240, 0.8)",
  backgroundColor: "white",
  height: "100%",
  width: "100%",
  maxWidth: "100%",
  transition: "all 0.3s ease",
  "&:hover": {
    boxShadow: "0 8px 30px rgba(0,0,0,0.08)",
  },
}));

const DashboardStats = ({ stat, value }) => {
  // Icon mapping
  const iconMap = {
    "Total Allocated": <AccountBalanceIcon />,
    "Total Expenses": <MonetizationOnIcon />,
    "To Be Reimbursed": <CreditCardIcon />,
    "Total Reimbursed": <BusinessIcon />,
  };

  // Color mapping
  const colorMap = {
    "Total Allocated": "#3b82f6",
    "Total Expenses": "#ef4444",
    "To Be Reimbursed": "#f59e0b",
    "Total Reimbursed": "#10b981",
  };

  // Subtitle mapping
  const subtitleMap = {
    "Total Allocated": "Total budget allocation",
    "Total Expenses": "Allocated expenses",
    "To Be Reimbursed": "Pending funds",
    "Total Reimbursed": "Reimbursed funds",
  };

  const icon = iconMap[stat.title] || <AccountBalanceIcon />;
  const color = colorMap[stat.title] || "#3b82f6";
  const subtitle = subtitleMap[stat.title] || "";

  return (
    <DashboardCard>
      <CardContent sx={{ p: 3 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            mb: 2,
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 36,
              height: 36,
              borderRadius: 12,
              backgroundColor: `${color}15`,
              color: color,
            }}
          >
            {icon}
          </Box>
          <Box sx={{ textAlign: "right" }}>
            <Typography
              variant="caption"
              sx={{
                color: "#64748b",
                fontSize: "0.75rem",
                display: "block",
              }}
            >
              {stat.title}
            </Typography>
          </Box>
        </Box>
        <Typography
          variant="h4"
          sx={{
            color: "#1e293b",
            fontWeight: 700,
            fontSize: "1.75rem",
            mb: 0.5,
          }}
        >
          {value}
        </Typography>
        <Typography
          variant="body2"
          sx={{ color: "#94a3b8", fontSize: "0.875rem" }}
        >
          {subtitle}
        </Typography>
      </CardContent>
    </DashboardCard>
  );
};

export default DashboardStats;
