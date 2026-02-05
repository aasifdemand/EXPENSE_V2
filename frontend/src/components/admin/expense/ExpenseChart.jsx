import { useState, useMemo } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const ChartCard = styled(Card)(() => ({
  borderRadius: 16,
  boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
  border: "1px solid rgba(226, 232, 240, 0.8)",
  backgroundColor: "white",
  fontFamily: '"Poppins", sans-serif',
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

const LegendItem = styled(Box)(({ theme, color }) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(1),
  "& .legend-dot": {
    width: 12,
    height: 12,
    borderRadius: 2,
    backgroundColor: color,
  },
  "& .legend-text": {
    fontSize: "0.875rem",
    color: "#64748b",
    fontFamily: '"Poppins", sans-serif',
  },
}));

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
    if (dateString.includes("-")) {
      const [year, month, day] = dateString.split("-").map(Number);
      return new Date(year, month - 1, day);
    }
    return new Date(dateString);
  } catch (error) {
    console.warn("Invalid date:", dateString, error);
    return null;
  }
};

const isDateInSelectedMonth = (date, selectedMonth, selectedYear) => {
  if (!date) return false;
  const dateMonth = date.getMonth();
  const dateYear = date.getFullYear();
  return dateMonth === selectedMonth && dateYear === selectedYear;
};

const ExpenseChart = ({ expenses }) => {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

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

  const getDaysInMonth = (month, year) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const dailyAreaChartData = useMemo(() => {
    const daysInMonth = getDaysInMonth(selectedMonth, selectedYear);
    const dailyData = [];

    for (let day = 1; day <= daysInMonth; day++) {
      dailyData.push({
        day: day.toString(),
        date: `${selectedYear}-${String(selectedMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`,
        displayDate: `${day}/${selectedMonth + 1}/${selectedYear}`,
        fromAllocation: 0,
        fromReimbursement: 0,
        totalAmount: 0,
      });
    }

    const monthlyExpenses =
      expenses?.filter((expense) => {
        const expenseDate = parseDate(expense.date);
        return isDateInSelectedMonth(expenseDate, selectedMonth, selectedYear);
      }) || [];

    monthlyExpenses.forEach((expense) => {
      const expenseDate = parseDate(expense.date);
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
  }, [expenses, selectedMonth, selectedYear]);

  return (
    <ChartCard sx={{ mb: 4 }}>
      <CardContent sx={{ p: 3 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 3,
            flexWrap: "wrap",
            gap: 2,
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 600, color: "#1e293b" }}>
            Expense Overview - {months[selectedMonth]} {selectedYear}
          </Typography>
          <Stack direction="row" spacing={2} sx={{ flexWrap: "wrap" }}>
            <FormControl size="small" sx={{ minWidth: 140 }}>
              <InputLabel sx={{ fontFamily: '"Poppins", sans-serif' }}>
                Month
              </InputLabel>
              <StyledSelect
                value={selectedMonth}
                label="Month"
                onChange={(e) => setSelectedMonth(e.target.value)}
              >
                {months.map((month, index) => (
                  <MenuItem
                    key={month}
                    value={index}
                    sx={{ fontFamily: '"Poppins", sans-serif' }}
                  >
                    {month}
                  </MenuItem>
                ))}
              </StyledSelect>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 100 }}>
              <InputLabel sx={{ fontFamily: '"Poppins", sans-serif' }}>
                Year
              </InputLabel>
              <StyledSelect
                value={selectedYear}
                label="Year"
                onChange={(e) => setSelectedYear(e.target.value)}
              >
                {years.map((year) => (
                  <MenuItem
                    key={year}
                    value={year}
                    sx={{ fontFamily: '"Poppins", sans-serif' }}
                  >
                    {year}
                  </MenuItem>
                ))}
              </StyledSelect>
            </FormControl>
          </Stack>
        </Box>

        <Box sx={{ width: "100%", height: 350 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={dailyAreaChartData}>
              <defs>
                <linearGradient
                  id="colorAllocation"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.6} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1} />
                </linearGradient>
                <linearGradient
                  id="colorReimbursement"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.6} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.1} />
                </linearGradient>
                <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.5} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.05} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis
                dataKey="day"
                tick={{ fill: "#64748b", fontSize: 12 }}
                label={{
                  value: "Days",
                  position: "insideBottom",
                  offset: -5,
                  style: {
                    fill: "#64748b",
                    fontFamily: '"Poppins", sans-serif',
                  },
                }}
              />
              <YAxis
                tick={{ fill: "#64748b", fontSize: 12 }}
                tickFormatter={(value) => `₹${value.toLocaleString()}`}
              />
              <Tooltip
                formatter={(value, name) => {
                  const formattedValue = `₹${Number(value).toLocaleString()}`;
                  const labelMap = {
                    fromAllocation: "From Allocation",
                    fromReimbursement: "From Reimbursement",
                    totalAmount: "Total Amount",
                  };
                  return [formattedValue, labelMap[name] || name];
                }}
                labelFormatter={(label, payload) => {
                  if (payload && payload[0] && payload[0].payload.displayDate) {
                    return `Date: ${payload[0].payload.displayDate}`;
                  }
                  return `Day: ${label}`;
                }}
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid #e2e8f0",
                  borderRadius: "8px",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                  fontFamily: '"Poppins", sans-serif',
                }}
              />

              <Area
                type="monotone"
                dataKey="fromAllocation"
                stackId="1"
                stroke="#3b82f6"
                fill="url(#colorAllocation)"
                name="From Allocation"
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="fromReimbursement"
                stackId="1"
                stroke="#f59e0b"
                fill="url(#colorReimbursement)"
                name="From Reimbursement"
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="totalAmount"
                stackId="1"
                stroke="#10b981"
                fill="url(#colorTotal)"
                name="Total Amount"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </Box>

        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={3}
          justifyContent="center"
          sx={{ mt: 3, flexWrap: "wrap" }}
        >
          <LegendItem color="#3b82f6">
            <div className="legend-dot" />
            <Typography className="legend-text">From Allocation</Typography>
          </LegendItem>
          <LegendItem color="#f59e0b">
            <div className="legend-dot" />
            <Typography className="legend-text">From Reimbursement</Typography>
          </LegendItem>
          <LegendItem color="#10b981">
            <div className="legend-dot" />
            <Typography className="legend-text">Total Amount</Typography>
          </LegendItem>
        </Stack>
      </CardContent>
    </ChartCard>
  );
};

export default ExpenseChart;
