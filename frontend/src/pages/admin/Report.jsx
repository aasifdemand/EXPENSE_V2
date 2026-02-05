import { useEffect, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  CircularProgress,
  Divider,
  Stack,
  Grid,
  Alert,
  Snackbar,
  Pagination,
  Avatar,
  Tooltip,
  IconButton,
  useMediaQuery,
  useTheme,
  Container,
} from "@mui/material";
import {
  Download as DownloadIcon,
  PictureAsPdf as PdfIcon,
  Refresh as RefreshIcon,
  Analytics as AnalyticsIcon,
  AccountBalance as BudgetIcon,
  Receipt as ReimbursementIcon,
  CompareArrows as CompareIcon,
  DateRange as DateRangeIcon,
  FilterList as FilterListIcon,
  Visibility as VisibilityIcon,
  ArrowUpward,
  ArrowDownward,
} from "@mui/icons-material";
import { useBudgeting } from "../../hooks/useBudgeting";
import { useExpenses } from "../../hooks/useExpenses";
import { useDispatch, useSelector } from "react-redux";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  StyledTextField,
  StyledFormControl,
  StyledSelect,
} from "../../styles/budgeting.styles";
import { useLocation } from "../../contexts/LocationContext";
import { fetchBudgets } from "../../store/budgetSlice";
import { fetchExpenses } from "../../store/expenseSlice";
import { fetchReimbursements } from "../../store/reimbursementSlice";
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

const StatCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: 12,
  background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
  border: "1px solid #e2e8f0",
  transition: "all 0.3s ease",
  "&:hover": {
    transform: "translateY(-4px)",
    boxShadow: "0 8px 25px rgba(0,0,0,0.1)",
  },
}));

const StatusChip = styled(Chip)(({ theme, status }) => ({
  fontWeight: 500,
  fontSize: "0.75rem",
  fontFamily: '"Poppins", sans-serif',
  backgroundColor:
    status === "paid"
      ? "#10b98115"
      : status === "pending"
      ? "#f59e0b15"
      : "#3b82f615",
  color:
    status === "paid"
      ? "#10b981"
      : status === "pending"
      ? "#f59e0b"
      : "#3b82f6",
  border: `1px solid ${
    status === "paid"
      ? "#10b98140"
      : status === "pending"
      ? "#f59e0b40"
      : "#3b82f640"
  }`,
}));

const Reports = () => {
  const { currentLoc } = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const isSmallMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(fetchBudgets({ location: currentLoc }));
    dispatch(fetchExpenses({ location: currentLoc }));
    dispatch(fetchReimbursements({ location: currentLoc }));
  }, [dispatch, currentLoc]);

  const { allBudgets, budgets } = useBudgeting();
  const { allExpenses, expenses } = useExpenses();
  const { reimbursements } = useSelector((state) => state?.reimbursement);
  const { departments: reduxDeps } = useSelector((state) => state.department);

  // Sub-departments data structure
  const subDepartmentsData = {
    sales: [
      "G-Suite",
      "Instantly",
      "Domain",
      "Contabo",
      "Linkedin",
      "Vendor G-Suite",
      "Vendor Outlook",
      "VPN",
      "Zoom Calling",
      "Ai Ark",
      "Others",
    ],
    office: [
      "APNA",
      "Naukri",
      "Milk Bill/Tea etc.",
      "Cake",
      "Electricity Bill",
      "Swiggy/Blinkit",
      "Office Rent",
      "Office Maintenance",
      "Stationary",
      "Courier Charges",
      "Salaries",
      "Salary Arrears",
      "Incentive",
      "Incentive Arrears",
      "Internet Bill",
      "Office Repairs & Butification",
      "Chairs Purchase",
      "Goodies/Bonuses/Bonanza",
      "Event Exp",
      "Cricket",
      "Trainings",
      "Employee Insurance",
      "ID Cards",
      "Laptop",
      "Desktop",
      "System Peripherals",
      "Others",
    ],
    data: [
      "Apollo",
      "Linkedin",
      "Email Verifier",
      "Zoominfo",
      "VPN",
      "Ai Ark",
      "Domain",
      "Others",
    ],
    it: ["Servers", "Domain", "Zoho", "Instantly", "Real Cloud", "Others"],
  };

  // Get current date for proper date initialization
  const getCurrentDateRange = () => {
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth();

    // Get first day of current month
    const startDate = new Date(currentYear, currentMonth, 1);
    // Get last day of current month
    const endDate = new Date(currentYear, currentMonth + 1, 0);

    return {
      start: startDate.toISOString().split("T")[0],
      end: endDate.toISOString().split("T")[0],
    };
  };

  const [filter, setFilter] = useState({
    type: "expenses",
    department: "all",
    subDepartment: "all",
    reimbursementStatus: "all",
    dateRange: getCurrentDateRange(),
  });

  const [generatedReport, setGeneratedReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);

  // Get departments from Redux store
  const departments = ["all", ...(reduxDeps?.map((dept) => dept.name) || [])];

  const reimbursementStatuses = ["all", "paid", "unpaid"];

  const reportTypes = [
    { value: "expenses", label: "Expense Report", icon: <AnalyticsIcon /> },
    { value: "budgets", label: "Budget Report", icon: <BudgetIcon /> },
    {
      value: "reimbursement",
      label: "Reimbursement Summary",
      icon: <ReimbursementIcon />,
    },
    { value: "comparison", label: "Budget vs Expense", icon: <CompareIcon /> },
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

  const getReportTypeLabel = (type) => {
    const foundType = reportTypes.find((t) => t.value === type);
    return foundType
      ? foundType.label
      : type.charAt(0).toUpperCase() + type.slice(1);
  };

  const resetFilters = () => {
    setFilter({
      type: "expenses",
      department: "all",
      subDepartment: "all",
      reimbursementStatus: "all",
      dateRange: getCurrentDateRange(),
    });
    setGeneratedReport(null);
    setCurrentPage(1);
    setSuccess("Filters reset successfully!");
  };

  // Get sub-departments for selected department
  const getSubDepartments = () => {
    if (filter.department === "all" || !subDepartmentsData[filter.department]) {
      return ["all"];
    }
    return ["all", ...subDepartmentsData[filter.department]];
  };

  // Handle department change
  const handleDepartmentChange = (department) => {
    setFilter({
      ...filter,
      department: department,
      subDepartment: "all",
    });
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  const handleItemsPerPageChange = (event) => {
    setItemsPerPage(event.target.value);
    setCurrentPage(1);
  };

  // Get current page items
  const getCurrentPageItems = () => {
    if (!generatedReport?.items) return [];
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return generatedReport.items.slice(startIndex, endIndex);
  };

  const exportPDF = () => {
    try {
      if (!generatedReport) {
        setError("No report generated to export");
        return;
      }

      const doc = new jsPDF();

      // Add company logo (with error handling)
      try {
        const logo = "/image.png";
        // Center the logo at the top
        doc.addImage(logo, "PNG", 78, 15, 60, 20);
      } catch (logoError) {
        console.warn("Logo not found, continuing without logo", logoError);
        // If logo fails, add a centered title instead
        doc.setFontSize(20);
        doc.setTextColor(40, 40, 40);
        doc.setFont(undefined, "bold");
        doc.text("DEMANDCURVE", 105, 25, { align: "center" });
      }

      // Report Title - Moved below logo
      doc.setFontSize(16);
      doc.setTextColor(40, 40, 40);
      doc.setFont(undefined, "bold");
      doc.text(generatedReport.title || "Report", 105, 45, { align: "center" });

      // Report details
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.setFont(undefined, "normal");
      const departmentInfo =
        generatedReport.department === "all"
          ? "All Departments"
          : generatedReport.department +
            (generatedReport.subDepartment !== "all"
              ? ` (${generatedReport.subDepartment})`
              : "");
      doc.text(
        `Generated on ${formatDate(
          new Date()
        )} • Department: ${departmentInfo} • ${
          generatedReport.items?.length || 0
        } records found`,
        105,
        52,
        { align: "center" }
      );

      // Add separator line
      doc.setDrawColor(200, 200, 200);
      doc.line(14, 58, 196, 58);

      // Dataset Report Section
      doc.setFontSize(12);
      doc.setTextColor(40, 40, 40);
      doc.setFont(undefined, "bold");
      doc.text("Dataset Report", 14, 70);

      // Summary table - Fixed for all report types
      const summaryData = [];
      let totalAmount = 0;

      if (generatedReport.type === "expenses") {
        totalAmount =
          generatedReport.totalAmount ||
          generatedReport.items?.reduce(
            (sum, item) => sum + (item.amount || 0),
            0
          ) ||
          0;
        summaryData.push(
          ["Description", "Report Type", "Total Amount", "Number of Records"],
          [
            "Expense Report",
            getReportTypeLabel(generatedReport.type),
            `₹${totalAmount}`,
            (generatedReport.items?.length || 0).toString(),
          ]
        );
      } else if (generatedReport.type === "budgets") {
        totalAmount =
          generatedReport.totalAmount ||
          generatedReport.items?.reduce(
            (sum, item) => sum + (item.allocatedAmount || 0),
            0
          ) ||
          0;
        summaryData.push(
          ["Description", "Report Type", "Total Amount", "Number of Records"],
          [
            "Budget Report",
            getReportTypeLabel(generatedReport.type),
            `₹${totalAmount}`,
            (generatedReport.items?.length || 0).toString(),
          ]
        );
      } else if (generatedReport.type === "reimbursement") {
        totalAmount =
          generatedReport.totalAmount ||
          generatedReport.items?.reduce(
            (sum, item) => sum + (item.amount || 0),
            0
          ) ||
          0;
        summaryData.push(
          ["Description", "Report Type", "Total Amount", "Number of Records"],
          [
            "Reimbursement Report",
            getReportTypeLabel(generatedReport.type),
            `₹${totalAmount}`,
            (generatedReport.items?.length || 0).toString(),
          ]
        );
      } else if (generatedReport.type === "comparison") {
        totalAmount =
          generatedReport.summary?.totalBudget ||
          generatedReport.items?.reduce(
            (sum, item) => sum + (item.totalBudget || 0),
            0
          ) ||
          0;
        summaryData.push(
          ["Description", "Report Type", "Total Budget", "Number of Records"],
          [
            "Budget vs Expense Report",
            getReportTypeLabel(generatedReport.type),
            `₹${totalAmount}`,
            (generatedReport.items?.length || 0).toString(),
          ]
        );
      }

      autoTable(doc, {
        startY: 75,
        head: [summaryData[0]],
        body: [summaryData[1]],
        theme: "grid",
        headStyles: {
          fillColor: [59, 130, 246],
          textColor: 255,
          fontStyle: "bold",
        },
        bodyStyles: {
          fontStyle: "bold",
        },
        styles: {
          fontSize: 10,
          cellPadding: 5,
        },
        margin: { left: 14, right: 14 },
      });

      // Settings Section
      doc.setFontSize(12);
      doc.setTextColor(40, 40, 40);
      doc.setFont(undefined, "bold");
      doc.text("Settings", 14, doc.lastAutoTable.finalY + 15);

      let columns = [];
      let rows = [];

      if (!generatedReport.items || generatedReport.items.length === 0) {
        doc.setFontSize(12);
        doc.setTextColor(100, 100, 100);
        doc.text(
          "No data available for this report",
          14,
          doc.lastAutoTable.finalY + 25
        );
      } else {
        if (generatedReport.type === "expenses") {
          columns = [
            "ID",
            "User",
            "Department",
            "Categories",
            "Date",
            "Amount",
            "Description",
            "Payment Mode",
          ];
          generatedReport.items.forEach((item, index) => {
            rows.push([
              (index + 1).toString(),
              item.user || "Unknown",
              item.department || "N/A",
              item.subDepartment || "N/A",
              item.date ? formatDate(item.date) : "N/A",
              `₹${item.amount || 0}`,
              item.description || "N/A",
              item.paymentMode || "N/A",
            ]);
          });
        } else if (generatedReport.type === "budgets") {
          columns = [
            "ID",
            "Name",
            "Allocated",
            "Company",
            "Months",
            "Year",
            "Spent",
            "Remaining",
          ];
          generatedReport.items.forEach((item, index) => {
            rows.push([
              (index + 1).toString(),
              item.user || "N/A",
              `₹${item.allocatedAmount || 0}`,
              item.company || "DemandCurve",
              item.month?.toString() || "N/A",
              item.year?.toString() || "N/A",
              `₹${item.spentAmount || 0}`,
              `₹${item.remainingAmount || 0}`,
            ]);
          });
        } else if (generatedReport.type === "reimbursement") {
          columns = ["ID", "Requested User", "Amount", "Status", "Date"];
          generatedReport.items.forEach((item, index) => {
            rows.push([
              (index + 1).toString(),
              item.requestedBy || "N/A",
              `₹${item.amount || 0}`,
              item.status === "paid" ? "Paid" : "Unpaid",
              item.date ? formatDate(item.date) : "N/A",
            ]);
          });
        } else if (generatedReport.type === "comparison") {
          columns = ["Department", "Total Budget", "Total Expense"];
          generatedReport.items.forEach((item) => {
            rows.push([
              item.department || "N/A",
              `₹${item.totalBudget || 0}`,
              `₹${item.totalExpense || 0}`,
            ]);
          });
        }

        if (rows.length > 0) {
          autoTable(doc, {
            startY: doc.lastAutoTable.finalY + 20,
            head: [columns],
            body: rows,
            theme: "grid",
            headStyles: {
              fillColor: [33, 150, 243],
              textColor: 255,
              fontStyle: "bold",
            },
            styles: {
              fontSize: 9,
              cellPadding: 4,
            },
            alternateRowStyles: {
              fillColor: [245, 245, 245],
            },
            margin: { left: 14, right: 14 },
            pageBreak: "auto",
          });
        }
      }

      // Footer
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text(`Page ${i} of ${pageCount}`, 105, 285, { align: "center" });
        doc.text(
          "Generated by DemandCurve Monthly Expense Statement System",
          105,
          290,
          { align: "center" }
        );
      }

      doc.save(
        `${generatedReport.type}_report_${
          new Date().toISOString().split("T")[0]
        }.pdf`
      );
      setSuccess("PDF exported successfully!");
    } catch (error) {
      console.error("PDF export error:", error);
      setError("Error exporting PDF. Please check the console for details.");
    }
  };

  const exportCSV = () => {
    if (!generatedReport) {
      setError("No report generated to export");
      return;
    }

    try {
      let csvContent = "";
      const headers = [];
      const rows = [];

      if (generatedReport.type === "expenses") {
        headers.push(
          "ID",
          "User",
          "Department",
          "Categories",
          "Date",
          "Amount",
          "Description",
          "Payment Mode"
        );
        generatedReport.items.forEach((item, index) => {
          rows.push([
            index + 1,
            `"${item.user || "Unknown"}"`,
            `"${item.department || "N/A"}"`,
            `"${item.subDepartment || "N/A"}"`,
            item.date || "N/A",
            item.amount || 0,
            `"${item.description || "N/A"}"`,
            `"${item.paymentMode || "N/A"}"`,
          ]);
        });
      } else if (generatedReport.type === "budgets") {
        headers.push(
          "ID",
          "Name",
          "Allocated",
          "Company",
          "Months",
          "Year",
          "Spent",
          "Remaining"
        );
        generatedReport.items.forEach((item, index) => {
          rows.push([
            index + 1,
            `"${item.user || "N/A"}"`,
            item.allocatedAmount || 0,
            `"${item.company || "DemandCurve"}"`,
            item.month || "",
            item.year || "",
            item.spentAmount || 0,
            item.remainingAmount || 0,
          ]);
        });
      } else if (generatedReport.type === "reimbursement") {
        headers.push("ID", "Requested User", "Amount", "Status", "Date");
        generatedReport.items.forEach((item, index) => {
          rows.push([
            index + 1,
            `"${item.requestedBy || "N/A"}"`,
            item.amount || 0,
            item.status || "unpaid",
            item.date || "N/A",
          ]);
        });
      } else if (generatedReport.type === "comparison") {
        headers.push("Department", "Total Budget", "Total Expense");
        generatedReport.items.forEach((item) => {
          rows.push([
            `"${item.department || "N/A"}"`,
            item.totalBudget || 0,
            item.totalExpense || 0,
          ]);
        });
      }

      csvContent += `DEMANDCURVE - TALENT INTERPRETED\n`;
      csvContent += `${generatedReport.title}\n`;
      csvContent += `Generated on: ${formatDate(new Date())}\n`;
      const departmentInfo =
        generatedReport.department === "all"
          ? "All Departments"
          : generatedReport.department +
            (generatedReport.subDepartment !== "all"
              ? ` (${generatedReport.subDepartment})`
              : "");
      csvContent += `Department: ${departmentInfo}\n`;
      csvContent += `Total Records: ${generatedReport.items.length}\n\n`;

      csvContent += `Dataset Report\n`;
      if (generatedReport.type === "comparison") {
        csvContent += `Description,Report Type,Total Budget,Number of Records\n`;
        csvContent += `${generatedReport.title},${getReportTypeLabel(
          generatedReport.type
        )},₹${generatedReport.summary.totalBudget?.toLocaleString() || "0"},${
          generatedReport.items.length
        }\n\n`;
      } else {
        csvContent += `Description,Report Type,Total Amount,Number of Records\n`;
        csvContent += `${generatedReport.title},${getReportTypeLabel(
          generatedReport.type
        )},₹${generatedReport.totalAmount?.toLocaleString() || "0"},${
          generatedReport.items.length
        }\n\n`;
      }

      csvContent += `Settings\n`;
      csvContent += headers.join(",") + "\n";
      rows.forEach((row) => {
        csvContent += row.join(",") + "\n";
      });

      const blob = new Blob([csvContent], {
        type: "text/csv;charset=utf-8;",
      });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute(
        "download",
        `${generatedReport.type}_report_${
          new Date().toISOString().split("T")[0]
        }.csv`
      );
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setSuccess("CSV exported successfully!");
    } catch (error) {
      console.error("CSV export error:", error);
      setError("Error exporting CSV. Please try again.");
    }
  };

  const filterByDateRange = (items) => {
    if (!items || !Array.isArray(items)) {
      console.log("No items to filter or items is not an array:", items);
      return [];
    }

    const startDate = new Date(filter.dateRange.start);
    const endDate = new Date(filter.dateRange.end);
    endDate.setHours(23, 59, 59, 999);

    const filtered = items.filter((item) => {
      if (!item) return false;
      const itemDate = new Date(
        item.date || item.createdAt || item.submittedAt || item.updatedAt
      );
      if (isNaN(itemDate.getTime())) {
        console.log("Invalid date for item:", item);
        return false;
      }
      return itemDate >= startDate && itemDate <= endDate;
    });

    console.log(
      `Filtered ${items.length} items to ${filtered.length} items by date range`
    );
    return filtered;
  };

  const filterByDepartment = (items) => {
    if (filter.department === "all" || !filter.department) {
      return items;
    }

    const filtered = items.filter((item) => {
      if (!item) return false;
      const deptName =
        item.department?.name || item.department || item.user?.department;
      return deptName?.toLowerCase() === filter.department.toLowerCase();
    });

    console.log(
      `Filtered to ${filtered.length} items by department: ${filter.department}`
    );
    return filtered;
  };

  const filterBySubDepartment = (items) => {
    if (
      filter.subDepartment === "all" ||
      !filter.subDepartment ||
      filter.department === "all"
    ) {
      return items;
    }

    const filtered = items.filter((item) => {
      if (!item) return false;
      const itemSubDept = item.subDepartment || item.subdepartment || "";
      return itemSubDept === filter.subDepartment;
    });

    console.log(
      `Filtered to ${filtered.length} items by sub-department: ${filter.subDepartment}`
    );
    return filtered;
  };

  const getActualData = () => {
    const budgetData =
      Array.isArray(allBudgets) && allBudgets.length > 0
        ? allBudgets
        : Array.isArray(budgets) && budgets.length > 0
        ? budgets
        : [];

    const expenseData =
      Array.isArray(allExpenses) && allExpenses.length > 0
        ? allExpenses
        : Array.isArray(expenses) && expenses.length > 0
        ? expenses
        : [];

    const reimbursementData =
      Array.isArray(reimbursements) && reimbursements.length > 0
        ? reimbursements
        : [];

    console.log("Actual data counts:", {
      budgets: budgetData.length,
      expenses: expenseData.length,
      reimbursements: reimbursementData.length,
    });

    return { budgetData, expenseData, reimbursementData };
  };

  const getCurrentMonthYear = () => {
    const today = new Date();
    return {
      month: today.toLocaleString("default", { month: "long" }),
      year: today.getFullYear(),
    };
  };

  const generateExpenseReport = () => {
    const { expenseData } = getActualData();
    console.log("Generating expense report with data:", expenseData);

    let filteredExpenses = filterByDateRange(expenseData);
    filteredExpenses = filterByDepartment(filteredExpenses);
    filteredExpenses = filterBySubDepartment(filteredExpenses);

    const totalAmount = filteredExpenses.reduce(
      (sum, expense) => sum + (expense.amount || 0),
      0
    );
    const { month, year } = getCurrentMonthYear();

    const report = {
      title: `Expense Report - ${month} ${year}`,
      type: "expenses",
      department:
        filter.department === "all" ? "All Departments" : filter.department,
      subDepartment: filter.subDepartment,
      date: new Date().toISOString(),
      totalAmount,
      items: filteredExpenses.map((expense) => ({
        id:
          expense._id ||
          expense.id ||
          `exp-${Math.random().toString(36).substr(2, 9)}`,
        description: expense.description || "No description",
        department: expense.department?.name || expense.department || "General",
        subDepartment:
          expense.subDepartment || expense.subdepartment || "General",
        date: formatDate(expense.date || expense.createdAt),
        amount: expense.amount || 0,
        user: expense.user?.name || expense.user?.username || "Unknown User",
        paymentMode: expense.paymentMode || "Cash",
      })),
      summary: {
        totalReports: filteredExpenses.length,
        averageAmount:
          filteredExpenses.length > 0
            ? totalAmount / filteredExpenses.length
            : 0,
        totalAmount,
      },
    };

    console.log("Generated expense report:", report);
    return report;
  };

  const generateBudgetReport = () => {
    const { budgetData } = getActualData();
    console.log("Generating budget report with data:", budgetData);

    let filteredBudgets = filterByDateRange(budgetData);

    const totalAllocated = filteredBudgets.reduce(
      (sum, budget) => sum + (budget.allocatedAmount || 0),
      0
    );
    const totalSpent = filteredBudgets.reduce(
      (sum, budget) => sum + (budget.spentAmount || 0),
      0
    );
    const totalRemaining = filteredBudgets.reduce(
      (sum, budget) => sum + (budget.remainingAmount || 0),
      0
    );
    const { month, year } = getCurrentMonthYear();

    const report = {
      title: `Budget Report - ${month} ${year}`,
      type: "budgets",
      department: "All Departments",
      date: new Date().toISOString(),
      totalAmount: totalAllocated,
      items: filteredBudgets.map((budget) => ({
        id:
          budget._id ||
          budget.id ||
          `budget-${Math.random().toString(36).substr(2, 9)}`,
        user: budget.user?.name || budget.user?.username || "System",
        month: budget.month || new Date().getMonth() + 1,
        year: budget.year || new Date().getFullYear(),
        allocatedAmount: budget.allocatedAmount || 0,
        spentAmount: budget.spentAmount || 0,
        remainingAmount: budget.remainingAmount || 0,
        company: budget.company || "DemandCurve",
        type: budget.type || "Monthly",
      })),
      summary: {
        totalReports: filteredBudgets.length,
        averageAmount:
          filteredBudgets.length > 0
            ? totalAllocated / filteredBudgets.length
            : 0,
        totalAllocated,
        totalSpent,
        totalRemaining,
      },
    };

    console.log("Generated budget report:", report);
    return report;
  };

  const generateReimbursementReport = () => {
    const { reimbursementData } = getActualData();
    console.log(
      "Generating reimbursement report with data:",
      reimbursementData
    );

    let filteredReimbursements = filterByDateRange(reimbursementData);
    filteredReimbursements = filterByDepartment(filteredReimbursements);
    filteredReimbursements = filterBySubDepartment(filteredReimbursements);

    if (filter.reimbursementStatus !== "all") {
      filteredReimbursements = filteredReimbursements.filter((reimb) => {
        if (filter.reimbursementStatus === "paid") {
          return reimb.isReimbursed === true;
        } else if (filter.reimbursementStatus === "unpaid") {
          return (
            reimb.isReimbursed === false || reimb.isReimbursed === undefined
          );
        }
        return true;
      });
    }

    const totalAmount = filteredReimbursements.reduce(
      (sum, reimb) => sum + (reimb.amount || 0),
      0
    );
    const paidAmount = filteredReimbursements
      .filter((reimb) => reimb.isReimbursed === true)
      .reduce((sum, reimb) => sum + (reimb.amount || 0), 0);
    const unpaidAmount = filteredReimbursements
      .filter(
        (reimb) =>
          reimb.isReimbursed === false || reimb.isReimbursed === undefined
      )
      .reduce((sum, reimb) => sum + (reimb.amount || 0), 0);
    const { month, year } = getCurrentMonthYear();

    const report = {
      title: `Reimbursement Report - ${month} ${year}`,
      type: "reimbursement",
      reimbursementStatus: filter.reimbursementStatus,
      department:
        filter.department === "all" ? "All Departments" : filter.department,
      subDepartment: filter.subDepartment,
      date: new Date().toISOString(),
      totalAmount,
      items: filteredReimbursements.map((reimb) => ({
        id:
          reimb._id ||
          reimb.id ||
          `reimb-${Math.random().toString(36).substr(2, 9)}`,
        requestedBy:
          reimb.requestedBy?.name || reimb.user?.name || "Unknown Employee",
        amount: reimb.amount || 0,
        status: reimb.isReimbursed ? "paid" : "unpaid",
        date: formatDate(reimb.createdAt || reimb.date),
      })),
      summary: {
        totalReports: filteredReimbursements.length,
        averageAmount:
          filteredReimbursements.length > 0
            ? totalAmount / filteredReimbursements.length
            : 0,
        totalAmount,
        paidAmount,
        unpaidAmount,
      },
    };

    console.log("Generated reimbursement report:", report);
    return report;
  };

  const generateComparisonReport = () => {
    const { budgetData, expenseData } = getActualData();
    console.log("Generating comparison report with data:", {
      budgetData,
      expenseData,
    });

    const filteredBudgets = filterByDateRange(budgetData);
    const filteredExpenses = filterByDateRange(expenseData);

    const departmentStats = {};

    filteredBudgets.forEach((budget) => {
      const dept =
        budget.department?.name ||
        budget.department ||
        budget.user?.department ||
        "General";
      if (!departmentStats[dept]) {
        departmentStats[dept] = { totalBudget: 0, totalExpense: 0 };
      }
      departmentStats[dept].totalBudget += budget.allocatedAmount || 0;
    });

    filteredExpenses.forEach((expense) => {
      const dept = expense.department?.name || expense.department || "General";
      if (!departmentStats[dept]) {
        departmentStats[dept] = { totalBudget: 0, totalExpense: 0 };
      }
      departmentStats[dept].totalExpense += expense.amount || 0;
    });

    const items = Object.entries(departmentStats).map(([department, stats]) => {
      return {
        id: department,
        title: "Budget Utilization",
        department,
        date: `${filter.dateRange.start} to ${filter.dateRange.end}`,
        totalBudget: stats.totalBudget,
        totalExpense: stats.totalExpense,
      };
    });

    const totalBudget = items.reduce(
      (sum, item) => sum + (item.totalBudget || 0),
      0
    );
    const totalExpense = items.reduce(
      (sum, item) => sum + (item.totalExpense || 0),
      0
    );
    const { month, year } = getCurrentMonthYear();

    const report = {
      title: `Budget vs Expense Report - ${month} ${year}`,
      type: "comparison",
      department:
        filter.department === "all" ? "All Departments" : filter.department,
      date: new Date().toISOString(),
      totalAmount: totalExpense,
      items,
      summary: {
        totalBudget,
        totalExpense,
        budgetCount: filteredBudgets.length,
        expenseCount: filteredExpenses.length,
      },
    };

    console.log("Generated comparison report:", report);
    return report;
  };

  const generateReport = async () => {
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      console.log("Generating report with filter:", filter);

      let report;

      switch (filter.type) {
        case "expenses":
          report = generateExpenseReport();
          break;
        case "budgets":
          report = generateBudgetReport();
          break;
        case "reimbursement":
          report = generateReimbursementReport();
          break;
        case "comparison":
          report = generateComparisonReport();
          break;
        default:
          report = generateExpenseReport();
      }

      console.log("Final generated report:", report);
      setGeneratedReport(report);
      setCurrentPage(1);
      setSuccess(
        `Report generated successfully! Found ${report.items.length} records.`
      );
    } catch (error) {
      console.error("Error generating report:", error);
      setError(
        "Error generating report. Please check the console for details."
      );
    } finally {
      setLoading(false);
    }
  };

  // Calculate report statistics
  const getReportStats = () => {
    if (!generatedReport) return [];

    const stats = [
      {
        title: "Report Type",
        value: getReportTypeLabel(generatedReport.type),
        color: "#3b82f6",
        icon: <AnalyticsIcon />,
        subtitle: "Selected report category",
      },
      {
        title: "Total Amount",
        value: `₹${generatedReport.totalAmount?.toLocaleString() || "0"}`,
        color: generatedReport.type === "comparison" ? "#8b5cf6" : "#059669",
        icon:
          generatedReport.type === "expenses" ? (
            <ArrowUpward />
          ) : generatedReport.type === "budgets" ? (
            <AccountBalance />
          ) : (
            <CompareIcon />
          ),
        subtitle:
          generatedReport.type === "comparison"
            ? "Total budget allocated"
            : "Total amount",
      },
      {
        title: "Total Records",
        value: generatedReport.summary?.totalReports?.toLocaleString() || "0",
        color: "#ef4444",
        icon: <VisibilityIcon />,
        subtitle: "Number of records found",
      },
    ];

    if (generatedReport.type === "comparison") {
      stats.splice(1, 0, {
        title: "Total Expenses",
        value: `₹${
          generatedReport.summary?.totalExpense?.toLocaleString() || "0"
        }`,
        color: "#dc2626",
        icon: <ArrowDownward />,
        subtitle: "Total expenses incurred",
      });
    }

    return stats;
  };

  const currentPageItems = getCurrentPageItems();
  const totalPages = generatedReport
    ? Math.ceil(generatedReport.items.length / itemsPerPage)
    : 1;

  return (
    <Container
      maxWidth="xl"
      sx={{
        py: 4,
        fontFamily: '"Poppins", sans-serif',
        backgroundColor: "#f8fafc",
        minHeight: "100vh",
      }}
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
              <GradientTypography
                variant={isMobile ? "h5" : "h4"}
                sx={{ mb: 1, fontWeight: 700 }}
              >
                Report Generator
              </GradientTypography>
              <Typography
                variant="h6"
                sx={{
                  color: "#64748b",
                  fontWeight: 400,
                  fontSize: isMobile ? "0.9rem" : "1.1rem",
                }}
              >
                Generate and export detailed financial reports
              </Typography>
            </Box>
            {currentLoc !== "OVERALL" && (
              <Chip
                label={`Location: ${currentLoc}`}
                size="small"
                sx={{
                  backgroundColor: "#dbeafe",
                  color: "#1d4ed8",
                  fontWeight: 500,
                  fontFamily: '"Poppins", sans-serif',
                }}
              />
            )}
          </Box>
        </Box>

        {/* Report Generator Card */}
        <motion.div variants={itemVariants}>
          <ContentCard sx={{ mb: 3, p: 3 }}>
            <Typography
              variant="h6"
              sx={{
                color: "#1e293b",
                fontWeight: 600,
                display: "flex",
                alignItems: "center",
                gap: 1,
                mb: 3,
                fontFamily: '"Poppins", sans-serif',
              }}
            >
              <AnalyticsIcon /> Report Configuration
            </Typography>

            <Grid container spacing={3}>
              {/* Report Type */}
              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <InputLabel
                    sx={{
                      fontWeight: "600",
                      color: "#4A5568",
                      fontFamily: '"Poppins", sans-serif',
                    }}
                  >
                    Report Type
                  </InputLabel>
                  <Select
                    value={filter.type}
                    onChange={(e) =>
                      setFilter({ ...filter, type: e.target.value })
                    }
                    label="Report Type"
                    sx={{
                      borderRadius: "8px",
                      fontFamily: '"Poppins", sans-serif',
                      "& .MuiOutlinedInput-notchedOutline": {
                        borderColor: "#E2E8F0",
                      },
                      "&:hover .MuiOutlinedInput-notchedOutline": {
                        borderColor: "#3b82f6",
                      },
                    }}
                  >
                    {reportTypes.map((type) => (
                      <MenuItem key={type.value} value={type.value}>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 2,
                            py: 0.5,
                          }}
                        >
                          {type.icon}
                          <Typography
                            variant="body1"
                            fontWeight="500"
                            sx={{
                              fontSize: "0.9rem",
                              fontFamily: '"Poppins", sans-serif',
                            }}
                          >
                            {type.label}
                          </Typography>
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Department */}
              <Grid item xs={12} md={8}>
                <FormControl fullWidth disabled={filter.type === "budgets"}>
                  <InputLabel
                    sx={{
                      fontWeight: "600",
                      color: "#4A5568",
                      fontFamily: '"Poppins", sans-serif',
                    }}
                  >
                    Department
                  </InputLabel>
                  <Select
                    value={
                      filter.type === "budgets" ? "all" : filter.department
                    }
                    onChange={(e) => handleDepartmentChange(e.target.value)}
                    label="Department"
                    sx={{
                      borderRadius: "8px",
                      fontFamily: '"Poppins", sans-serif',
                    }}
                  >
                    {departments.map((dept) => (
                      <MenuItem key={dept} value={dept.toLowerCase()}>
                        <Typography
                          variant="body1"
                          fontWeight="500"
                          sx={{
                            fontSize: "0.9rem",
                            fontFamily: '"Poppins", sans-serif',
                          }}
                        >
                          {dept === "all" ? "All Departments" : dept}
                        </Typography>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Sub-Department */}
              {filter.department !== "all" &&
                subDepartmentsData[filter.department] && (
                  <Grid item xs={12} md={12}>
                    <FormControl fullWidth disabled={filter.type === "budgets"}>
                      <InputLabel
                        sx={{
                          fontWeight: "600",
                          color: "#4A5568",
                          fontFamily: '"Poppins", sans-serif',
                        }}
                      >
                        Categories
                      </InputLabel>
                      <Select
                        value={filter.subDepartment}
                        onChange={(e) =>
                          setFilter({
                            ...filter,
                            subDepartment: e.target.value,
                          })
                        }
                        label="Categories"
                        sx={{
                          borderRadius: "8px",
                          fontFamily: '"Poppins", sans-serif',
                        }}
                      >
                        {getSubDepartments().map((subDept) => (
                          <MenuItem key={subDept} value={subDept}>
                            <Typography
                              variant="body1"
                              fontWeight="500"
                              sx={{
                                fontSize: "0.9rem",
                                fontFamily: '"Poppins", sans-serif',
                              }}
                            >
                              {subDept === "all" ? "All Categories" : subDept}
                            </Typography>
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                )}

              {/* Reimbursement Status */}
              {filter.type === "reimbursement" && (
                <Grid item xs={12} md={12}>
                  <FormControl fullWidth>
                    <InputLabel
                      sx={{
                        fontWeight: "600",
                        color: "#4A5568",
                        fontFamily: '"Poppins", sans-serif',
                      }}
                    >
                      Reimbursement Status
                    </InputLabel>
                    <Select
                      value={filter.reimbursementStatus}
                      onChange={(e) =>
                        setFilter({
                          ...filter,
                          reimbursementStatus: e.target.value,
                        })
                      }
                      label="Reimbursement Status"
                      sx={{
                        borderRadius: "8px",
                        fontFamily: '"Poppins", sans-serif',
                      }}
                    >
                      {reimbursementStatuses.map((status) => (
                        <MenuItem key={status} value={status}>
                          <Typography
                            variant="body1"
                            fontWeight="500"
                            sx={{
                              fontSize: "0.9rem",
                              fontFamily: '"Poppins", sans-serif',
                            }}
                          >
                            {status === "paid"
                              ? "✅ Paid"
                              : status === "unpaid"
                              ? "⏳ Unpaid"
                              : " All Status"}
                          </Typography>
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              )}

              {/* Date Range */}
              <Grid item xs={12} md={6}>
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: { xs: "column", md: "row" },
                    gap: 2,
                    alignItems: "center",
                  }}
                >
                  <StyledTextField
                    type="date"
                    value={filter.dateRange.start}
                    onChange={(e) =>
                      setFilter({
                        ...filter,
                        dateRange: {
                          ...filter.dateRange,
                          start: e.target.value,
                        },
                      })
                    }
                    size="small"
                    fullWidth
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "8px",
                      },
                    }}
                  />
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ fontWeight: "600" }}
                  >
                    to
                  </Typography>
                  <StyledTextField
                    type="date"
                    value={filter.dateRange.end}
                    onChange={(e) =>
                      setFilter({
                        ...filter,
                        dateRange: { ...filter.dateRange, end: e.target.value },
                      })
                    }
                    size="small"
                    fullWidth
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "8px",
                      },
                    }}
                  />
                </Box>
              </Grid>

              {/* Action Buttons */}
              <Grid item xs={12}>
                <Box
                  sx={{
                    display: "flex",
                    gap: 2,
                    justifyContent: "center",
                    flexWrap: "wrap",
                  }}
                >
                  <Button
                    variant="contained"
                    onClick={generateReport}
                    disabled={loading}
                    startIcon={
                      loading ? (
                        <CircularProgress size={20} />
                      ) : (
                        <AnalyticsIcon />
                      )
                    }
                    sx={{
                      px: 4,
                      py: 1,
                      borderRadius: "8px",
                      background:
                        "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
                      boxShadow: "0 4px 14px 0 rgba(59, 130, 246, 0.4)",
                      fontWeight: 600,
                      fontFamily: '"Poppins", sans-serif',
                      "&:hover": {
                        transform: "translateY(-1px)",
                        boxShadow: "0 6px 20px 0 rgba(59, 130, 246, 0.6)",
                      },
                    }}
                  >
                    {loading ? "Generating Report..." : "Generate Report"}
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={resetFilters}
                    startIcon={<RefreshIcon />}
                    sx={{
                      px: 4,
                      py: 1,
                      borderRadius: "8px",
                      borderColor: "#e2e8f0",
                      color: "#64748b",
                      fontWeight: 600,
                      fontFamily: '"Poppins", sans-serif',
                      "&:hover": {
                        borderColor: "#3b82f6",
                        backgroundColor: "rgba(59, 130, 246, 0.04)",
                      },
                    }}
                  >
                    Reset Filters
                  </Button>
                </Box>
              </Grid>
            </Grid>

            {filter.type === "budgets" && (
              <Alert
                severity="info"
                sx={{
                  mt: 3,
                  borderRadius: "8px",
                  fontFamily: '"Poppins", sans-serif',
                }}
              >
                Department and Categories filters are disabled for Budget
                Reports
              </Alert>
            )}
          </ContentCard>
        </motion.div>

        {/* Generated Report Section */}
        {generatedReport && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Report Stats */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
              {getReportStats().map((stat, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <StatCard>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "flex-start",
                          mb: 2,
                        }}
                      >
                        <Box>
                          <Typography
                            variant="subtitle2"
                            sx={{
                              color: "#64748b",
                              fontWeight: 500,
                              fontSize: "0.75rem",
                              fontFamily: '"Poppins", sans-serif',
                            }}
                          >
                            {stat.title}
                          </Typography>
                          <Typography
                            variant="h5"
                            sx={{
                              color: stat.color,
                              fontWeight: 700,
                              mt: 1,
                              fontFamily: '"Poppins", sans-serif',
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
                          fontFamily: '"Poppins", sans-serif',
                        }}
                      >
                        {stat.subtitle}
                      </Typography>
                    </StatCard>
                  </motion.div>
                </Grid>
              ))}
            </Grid>

            {/* Report Details Card */}
            <ContentCard sx={{ mb: 3 }}>
              {/* Report Header */}
              <Box
                sx={{
                  p: 3,
                  borderBottom: "1px solid #e2e8f0",
                  backgroundColor: "#f8fafc",
                }}
              >
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
                  <Box>
                    <Typography
                      variant="h6"
                      sx={{
                        color: "#1e293b",
                        fontWeight: 600,
                        fontFamily: '"Poppins", sans-serif',
                      }}
                    >
                      {generatedReport.title}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color: "#64748b",
                        fontWeight: 500,
                        fontSize: "0.875rem",
                        fontFamily: '"Poppins", sans-serif',
                      }}
                    >
                      Generated on {formatDate(generatedReport.date)} •{" "}
                      {generatedReport.type === "reimbursement"
                        ? `Status: ${generatedReport.reimbursementStatus}`
                        : `Department: ${generatedReport.department}`}
                      {generatedReport.subDepartment !== "all" &&
                        ` (${generatedReport.subDepartment})`}{" "}
                      • {generatedReport.items.length} records found
                    </Typography>
                  </Box>
                  <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                    <Button
                      variant="outlined"
                      onClick={exportCSV}
                      startIcon={<DownloadIcon />}
                      size="small"
                      sx={{
                        borderRadius: "6px",
                        fontWeight: 500,
                        fontFamily: '"Poppins", sans-serif',
                      }}
                    >
                      CSV
                    </Button>
                    <Button
                      variant="contained"
                      onClick={exportPDF}
                      startIcon={<PdfIcon />}
                      size="small"
                      sx={{
                        borderRadius: "6px",
                        background:
                          "linear-gradient(135deg, #059669 0%, #10b981 100%)",
                        fontWeight: 500,
                        fontFamily: '"Poppins", sans-serif',
                        "&:hover": {
                          background:
                            "linear-gradient(135deg, #047857 0%, #0d9488 100%)",
                        },
                      }}
                    >
                      PDF
                    </Button>
                  </Box>
                </Box>

                {/* Filters Summary */}
                <Box
                  sx={{
                    display: "flex",
                    gap: 2,
                    flexWrap: "wrap",
                    mt: 2,
                  }}
                >
                  <Chip
                    label={`Type: ${getReportTypeLabel(generatedReport.type)}`}
                    size="small"
                    sx={{
                      backgroundColor: "#dbeafe",
                      color: "#1d4ed8",
                      fontFamily: '"Poppins", sans-serif',
                    }}
                  />
                  <Chip
                    label={`Date: ${filter.dateRange.start} to ${filter.dateRange.end}`}
                    size="small"
                    sx={{
                      backgroundColor: "#f0f9ff",
                      color: "#0ea5e9",
                      fontFamily: '"Poppins", sans-serif',
                    }}
                  />
                  {generatedReport.type !== "budgets" && (
                    <Chip
                      label={`Dept: ${
                        generatedReport.department === "all"
                          ? "All"
                          : generatedReport.department
                      }`}
                      size="small"
                      sx={{
                        backgroundColor: "#fef3c7",
                        color: "#d97706",
                        fontFamily: '"Poppins", sans-serif',
                      }}
                    />
                  )}
                </Box>
              </Box>

              {/* Table Section */}
              <Box>
                {/* Filters Row */}
                <Box
                  sx={{
                    p: 2,
                    borderBottom: "1px solid #e2e8f0",
                    backgroundColor: "#f8fafc",
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      flexWrap: "wrap",
                      gap: 2,
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <FilterListIcon sx={{ color: "#64748b", fontSize: 20 }} />
                      <Typography
                        variant="body2"
                        sx={{
                          color: "#64748b",
                          fontWeight: 500,
                          fontFamily: '"Poppins", sans-serif',
                        }}
                      >
                        Showing {currentPageItems.length} of{" "}
                        {generatedReport.items.length} records
                      </Typography>
                    </Box>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                      <Typography
                        variant="body2"
                        sx={{
                          color: "#64748b",
                          fontFamily: '"Poppins", sans-serif',
                        }}
                      >
                        Rows per page:
                      </Typography>
                      <StyledFormControl size="small" sx={{ minWidth: 80 }}>
                        <StyledSelect
                          value={itemsPerPage}
                          onChange={handleItemsPerPageChange}
                        >
                          {[10, 20, 50, 100].map((num) => (
                            <MenuItem key={num} value={num}>
                              {num}
                            </MenuItem>
                          ))}
                        </StyledSelect>
                      </StyledFormControl>
                    </Box>
                  </Box>
                </Box>

                {/* Data Table */}
                {currentPageItems.length > 0 ? (
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          {generatedReport.type === "expenses" && (
                            <>
                              <StyledTableCell>ID</StyledTableCell>
                              <StyledTableCell>User</StyledTableCell>
                              <StyledTableCell>Department</StyledTableCell>
                              <StyledTableCell>Categories</StyledTableCell>
                              <StyledTableCell>Date</StyledTableCell>
                              <StyledTableCell>Amount</StyledTableCell>
                              <StyledTableCell>Description</StyledTableCell>
                              <StyledTableCell>Payment Mode</StyledTableCell>
                            </>
                          )}
                          {generatedReport.type === "budgets" && (
                            <>
                              <StyledTableCell>ID</StyledTableCell>
                              <StyledTableCell>Name</StyledTableCell>
                              <StyledTableCell>Allocated</StyledTableCell>
                              <StyledTableCell>Company</StyledTableCell>
                              <StyledTableCell>Months</StyledTableCell>
                              <StyledTableCell>Year</StyledTableCell>
                              <StyledTableCell>Spent</StyledTableCell>
                              <StyledTableCell>Remaining</StyledTableCell>
                            </>
                          )}
                          {generatedReport.type === "reimbursement" && (
                            <>
                              <StyledTableCell>ID</StyledTableCell>
                              <StyledTableCell>Requested User</StyledTableCell>
                              <StyledTableCell>Amount</StyledTableCell>
                              <StyledTableCell>Status</StyledTableCell>
                              <StyledTableCell>Date</StyledTableCell>
                            </>
                          )}
                          {generatedReport.type === "comparison" && (
                            <>
                              <StyledTableCell>Department</StyledTableCell>
                              <StyledTableCell>Total Budget</StyledTableCell>
                              <StyledTableCell>Total Expense</StyledTableCell>
                            </>
                          )}
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {currentPageItems.map((item, index) => {
                          const globalIndex =
                            (currentPage - 1) * itemsPerPage + index + 1;
                          return (
                            <motion.tr
                              key={item.id}
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ delay: index * 0.05 }}
                            >
                              {generatedReport.type === "expenses" && (
                                <>
                                  <StyledTableCell>
                                    {globalIndex}
                                  </StyledTableCell>
                                  <StyledTableCell>
                                    <Box
                                      sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 1,
                                      }}
                                    >
                                      <Avatar
                                        sx={{
                                          width: 32,
                                          height: 32,
                                          bgcolor: "#3b82f6",
                                          fontSize: "0.875rem",
                                          fontWeight: 600,
                                        }}
                                      >
                                        {item.user?.charAt(0).toUpperCase() ||
                                          "U"}
                                      </Avatar>
                                      {item.user}
                                    </Box>
                                  </StyledTableCell>
                                  <StyledTableCell>
                                    <StatusChip
                                      label={item.department}
                                      size="small"
                                      status="info"
                                    />
                                  </StyledTableCell>
                                  <StyledTableCell>
                                    <Chip
                                      label={item.subDepartment}
                                      size="small"
                                      variant="outlined"
                                      sx={{
                                        backgroundColor: "#f8fafc",
                                        color: "#64748b",
                                        fontFamily: '"Poppins", sans-serif',
                                      }}
                                    />
                                  </StyledTableCell>
                                  <StyledTableCell>{item.date}</StyledTableCell>
                                  <StyledTableCell>
                                    <Typography
                                      sx={{
                                        fontWeight: 600,
                                        color: "#059669",
                                        fontFamily: '"Poppins", sans-serif',
                                      }}
                                    >
                                      ₹{item.amount?.toLocaleString()}
                                    </Typography>
                                  </StyledTableCell>
                                  <StyledTableCell>
                                    <Tooltip title={item.description}>
                                      <Typography
                                        sx={{
                                          maxWidth: 200,
                                          overflow: "hidden",
                                          textOverflow: "ellipsis",
                                          whiteSpace: "nowrap",
                                          fontFamily: '"Poppins", sans-serif',
                                        }}
                                      >
                                        {item.description}
                                      </Typography>
                                    </Tooltip>
                                  </StyledTableCell>
                                  <StyledTableCell>
                                    <Chip
                                      label={item.paymentMode}
                                      size="small"
                                      sx={{
                                        backgroundColor: "#f0f9ff",
                                        color: "#0ea5e9",
                                        fontFamily: '"Poppins", sans-serif',
                                      }}
                                    />
                                  </StyledTableCell>
                                </>
                              )}
                              {generatedReport.type === "budgets" && (
                                <>
                                  <StyledTableCell>
                                    {globalIndex}
                                  </StyledTableCell>
                                  <StyledTableCell>
                                    <Box
                                      sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 1,
                                      }}
                                    >
                                      <Avatar
                                        sx={{
                                          width: 32,
                                          height: 32,
                                          bgcolor: "#8b5cf6",
                                          fontSize: "0.875rem",
                                          fontWeight: 600,
                                        }}
                                      >
                                        {item.user?.charAt(0).toUpperCase() ||
                                          "S"}
                                      </Avatar>
                                      {item.user}
                                    </Box>
                                  </StyledTableCell>
                                  <StyledTableCell>
                                    <Typography
                                      sx={{
                                        fontWeight: 600,
                                        color: "#059669",
                                        fontFamily: '"Poppins", sans-serif',
                                      }}
                                    >
                                      ₹{item.allocatedAmount?.toLocaleString()}
                                    </Typography>
                                  </StyledTableCell>
                                  <StyledTableCell>
                                    {item.company}
                                  </StyledTableCell>
                                  <StyledTableCell>
                                    {item.month}
                                  </StyledTableCell>
                                  <StyledTableCell>{item.year}</StyledTableCell>
                                  <StyledTableCell>
                                    ₹{item.spentAmount?.toLocaleString()}
                                  </StyledTableCell>
                                  <StyledTableCell>
                                    <Typography
                                      sx={{
                                        fontWeight: 600,
                                        color:
                                          item.remainingAmount >= 0
                                            ? "#059669"
                                            : "#ef4444",
                                        fontFamily: '"Poppins", sans-serif',
                                      }}
                                    >
                                      ₹{item.remainingAmount?.toLocaleString()}
                                    </Typography>
                                  </StyledTableCell>
                                </>
                              )}
                              {generatedReport.type === "reimbursement" && (
                                <>
                                  <StyledTableCell>
                                    {globalIndex}
                                  </StyledTableCell>
                                  <StyledTableCell>
                                    <Box
                                      sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 1,
                                      }}
                                    >
                                      <Avatar
                                        sx={{
                                          width: 32,
                                          height: 32,
                                          bgcolor:
                                            item.status === "paid"
                                              ? "#10b981"
                                              : "#f59e0b",
                                          fontSize: "0.875rem",
                                          fontWeight: 600,
                                        }}
                                      >
                                        {item.requestedBy
                                          ?.charAt(0)
                                          .toUpperCase() || "E"}
                                      </Avatar>
                                      {item.requestedBy}
                                    </Box>
                                  </StyledTableCell>
                                  <StyledTableCell>
                                    <Typography
                                      sx={{
                                        fontWeight: 600,
                                        color: "#059669",
                                        fontFamily: '"Poppins", sans-serif',
                                      }}
                                    >
                                      ₹{item.amount?.toLocaleString()}
                                    </Typography>
                                  </StyledTableCell>
                                  <StyledTableCell>
                                    <StatusChip
                                      label={
                                        item.status === "paid"
                                          ? "Paid"
                                          : "Unpaid"
                                      }
                                      size="small"
                                      status={item.status}
                                    />
                                  </StyledTableCell>
                                  <StyledTableCell>{item.date}</StyledTableCell>
                                </>
                              )}
                              {generatedReport.type === "comparison" && (
                                <>
                                  <StyledTableCell>
                                    <StatusChip
                                      label={item.department}
                                      size="small"
                                      status="info"
                                    />
                                  </StyledTableCell>
                                  <StyledTableCell>
                                    <Typography
                                      sx={{
                                        fontWeight: 600,
                                        color: "#8b5cf6",
                                        fontFamily: '"Poppins", sans-serif',
                                      }}
                                    >
                                      ₹{item.totalBudget?.toLocaleString()}
                                    </Typography>
                                  </StyledTableCell>
                                  <StyledTableCell>
                                    <Typography
                                      sx={{
                                        fontWeight: 600,
                                        color: "#dc2626",
                                        fontFamily: '"Poppins", sans-serif',
                                      }}
                                    >
                                      ₹{item.totalExpense?.toLocaleString()}
                                    </Typography>
                                    <Typography
                                      variant="caption"
                                      sx={{
                                        color: "#64748b",
                                        ml: 1,
                                        fontFamily: '"Poppins", sans-serif',
                                      }}
                                    >
                                      {item.totalBudget
                                        ? `${Math.round(
                                            (item.totalExpense /
                                              item.totalBudget) *
                                              100
                                          )}%`
                                        : "0%"}
                                    </Typography>
                                  </StyledTableCell>
                                </>
                              )}
                            </motion.tr>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </TableContainer>
                ) : (
                  <Box sx={{ p: 6, textAlign: "center" }}>
                    <AnalyticsIcon
                      sx={{ fontSize: 48, color: "#cbd5e1", mb: 2 }}
                    />
                    <Typography
                      sx={{
                        color: "#64748b",
                        mb: 1,
                        fontFamily: '"Poppins", sans-serif',
                      }}
                    >
                      No data found for current filters
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: "0.875rem",
                        color: "#94a3b8",
                        fontFamily: '"Poppins", sans-serif',
                      }}
                    >
                      Try adjusting your filters or generating a different
                      report
                    </Typography>
                  </Box>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
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
                          fontSize: "0.875rem",
                          fontFamily: '"Poppins", sans-serif',
                        }}
                      >
                        Showing {(currentPage - 1) * itemsPerPage + 1}–
                        {Math.min(
                          currentPage * itemsPerPage,
                          generatedReport.items.length
                        )}{" "}
                        of {generatedReport.items.length} records
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
              </Box>
            </ContentCard>
          </motion.div>
        )}
      </motion.div>

      {/* Notifications */}
      <Snackbar
        open={!!success}
        autoHideDuration={4000}
        onClose={() => setSuccess("")}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          onClose={() => setSuccess("")}
          severity="success"
          sx={{
            width: "100%",
            borderRadius: 2,
            fontFamily: '"Poppins", sans-serif',
          }}
        >
          {success}
        </Alert>
      </Snackbar>

      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError("")}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          onClose={() => setError("")}
          severity="error"
          sx={{
            width: "100%",
            borderRadius: 2,
            fontFamily: '"Poppins", sans-serif',
          }}
        >
          {error}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Reports;
