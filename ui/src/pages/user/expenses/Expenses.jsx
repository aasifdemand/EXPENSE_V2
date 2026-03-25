import React, { useState } from "react";
import { useExpenses } from "../../../hooks/useExpenses";
import { useSelector } from "react-redux";
import { useGetUserReimbursementsQuery } from "../../../store/reimbursementApi";
import ExpenseTable from "../../../components/expenses/ExpenseTable";
import { Plus, Building2, TrendingUp, CreditCard, PieChart } from "lucide-react";
import { Button } from "../../../components/ui/Button";
import { StatCard } from "../../../components/ui/StatCard";
import PageHeader from "../../../components/ui/PageHeader";
import Modal from "../../../components/ui/Modal";
import MultiStepExpenseForm from "../../../components/expenses/MultiStepExpenseForm";

const Expenses = () => {
  const {
    expenses,
    loading: expensesLoading,
    meta,
    page,
    setPage,
    search,
    setSearch,
    limit,
    setLimit,
    stats: expenseStats,
  } = useExpenses();

  const { user } = useSelector((state) => state.auth);
  
  // Fetch reimbursements using RTK Query
  const { data: reimbursementData, isLoading: reimbursementsLoading } = useGetUserReimbursementsQuery(
    { userId: user?.id },
    { skip: !user?.id }
  );

  const userReimbursements = reimbursementData?.data || [];
  const [showExpenseModal, setShowExpenseModal] = useState(false);

  const loading = expensesLoading || reimbursementsLoading;

  const totalSpent = Number(expenseStats?.totalSpent || 0);
  const fromAllocation = Number(expenseStats?.totalFromAllocation || 0);
  
  const pendingReimbursements = userReimbursements
    ?.filter(r => !r.isReimbursed)
    ?.reduce((acc, r) => acc + Number(r.amount || 0), 0) || 0;
    
  const settledFunds = userReimbursements
    ?.filter(r => r.isReimbursed)
    ?.reduce((acc, r) => acc + Number(r.amount || 0), 0) || 0;

  const expense_stats = [
    {
      title: "Total Expenditures",
      value: `₹${totalSpent.toLocaleString()}`,
      icon: TrendingUp,
      colorClass: "bg-primary-600",
      subtitle: "Lifetime personal spending",
    },
    {
      title: "Budget Utilization",
      value: `₹${fromAllocation.toLocaleString()}`,
      icon: Building2,
      colorClass: "bg-indigo-500",
      subtitle: "Cleared via allocation",
    },
    {
      title: "Pending Claims",
      value: `₹${pendingReimbursements.toLocaleString()}`,
      icon: CreditCard,
      colorClass: "bg-amber-500",
      subtitle: "Awaiting reimbursement",
    },
    {
      title: "Total Settled",
      value: `₹${settledFunds.toLocaleString()}`,
      icon: PieChart,
      colorClass: "bg-green-600",
      subtitle: "Total funds returned",
    },
  ];

  return (
    <div className="p-4 md:p-8 space-y-8 animate-in fade-in duration-500">
      <PageHeader 
        title="My"
        highlight="Expenses"
        subtitle="Track and manage your individual spending across categories."
        actions={
          <Button 
            onClick={() => setShowExpenseModal(true)}
            className="flex items-center gap-2 px-6 py-2.5 rounded-lg shadow-sm font-semibold text-white bg-primary-600 hover:bg-primary-700"
          >
            <Plus className="w-4 h-4" />
            Add Expense
          </Button>
        }
      />

      {/* Expense Creation Modal */}
      <Modal
        isOpen={showExpenseModal}
        onClose={() => setShowExpenseModal(false)}
        title="Record New Expense"
        className="max-w-xl"
      >
        <MultiStepExpenseForm onClose={() => setShowExpenseModal(false)} />
      </Modal>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {expense_stats.map((stat, i) => (
          <StatCard key={i} stat={stat} />
        ))}
      </div>

      <ExpenseTable
        expenses={expenses}
        loading={loading}
        meta={meta}
        page={page}
        setPage={setPage}
        search={search}
        setSearch={setSearch}
        limit={limit}
        setLimit={setLimit}
        role="user"
      />
    </div>
  );
};

export default Expenses;
