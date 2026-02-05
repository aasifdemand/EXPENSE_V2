import { Box, Button } from "@mui/material";
import { useExpenses } from "../../hooks/useExpenses";
import ExpenseTable from "../../components/admin/expense/ExpenseTable";

import { useNavigate } from "react-router-dom";

const Expenses = () => {
  const navigate = useNavigate();

  const { adminMeta, loading, page, setPage, limit, setLimit, allExpenses } =
    useExpenses({ mode: "admin" });

  return (
    <Box sx={{ p: { xs: 1.5, md: 3 }, minHeight: "100vh" }}>
      {/* <Box sx={{ mb: 3, display: "flex", gap: 2 }}>
        {expenseStats.map((stat, i) => (
          <StatCard key={i} stat={stat} />
        ))}
      </Box> */}

      <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
        <Button
          variant="contained"
          onClick={() => navigate("/user/expenses/add")}
        >
          + Upload New Expense
        </Button>
      </Box>

      <ExpenseTable
        expenses={allExpenses}
        loading={loading}
        meta={adminMeta}
        page={page}
        setPage={setPage}
        limit={limit}
        setLimit={setLimit}
        disableSearch
        disableFilters
      />
    </Box>
  );
};

export default Expenses;
