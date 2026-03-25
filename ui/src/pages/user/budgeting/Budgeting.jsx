import React from "react";
import { useBudgeting } from "../../../hooks/useBudgeting";
import BudgetTable from "../../../components/budgeting/BudgetTable";
import { Plus, Building2, TrendingUp, CreditCard, PieChart } from "lucide-react";
import { Button } from "../../../components/ui/Button";
import { StatCard } from "../../../components/ui/StatCard";
import PageHeader from "../../../components/ui/PageHeader";

const Budgeting = () => {
  const {
    budgets,
    loading,
    meta,
    page,
    setPage,
    search,
    setSearch,
    limit,
    setLimit,
  } = useBudgeting();

  const totalAllocated = React.useMemo(() => budgets?.reduce((acc, b) => acc + Number(b?.allocatedAmount || 0), 0) || 0, [budgets]);
  const totalSpent = React.useMemo(() => budgets?.reduce((acc, b) => acc + Number(b?.spentAmount || 0), 0) || 0, [budgets]);
  const remaining = totalAllocated - totalSpent;
  const utilization = totalAllocated ? (totalSpent / totalAllocated) * 100 : 0;

  const budget_stats = [
    {
      title: "My Allocation",
      value: `₹${totalAllocated.toLocaleString()}`,
      icon: Building2,
      colorClass: "bg-primary-500",
      subtitle: "Personal budget limit",
    },
    {
      title: "Spent Amount",
      value: `₹${totalSpent.toLocaleString()}`,
      icon: TrendingUp,
      colorClass: "bg-rose-500",
      subtitle: "Recorded expenditures",
    },
    {
      title: "Available Balance",
      value: `₹${remaining.toLocaleString()}`,
      icon: CreditCard,
      colorClass: "bg-amber-500",
      subtitle: "Current unspent funds",
    },
    {
      title: "Utilization Rate",
      value: `${utilization.toFixed(1)}%`,
      icon: PieChart,
      colorClass: "bg-green-500",
      subtitle: "Of my allocated budget",
    },
  ];

  return (
    <div className="p-4 md:p-8 space-y-8 animate-in fade-in duration-500">
      <PageHeader 
        title="My"
        highlight="Budgets"
        subtitle="Manage your monthly budget allocations and spending limits."
        actions={
          <Button className="flex items-center gap-2 px-6 py-2.5 rounded-lg shadow-sm font-semibold text-xs uppercase text-white bg-primary-600 hover:bg-primary-700">
            <Plus className="w-4 h-4" />
            Request New Budget
          </Button>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {budget_stats.map((stat, i) => (
          <StatCard key={i} stat={stat} />
        ))}
      </div>

      <BudgetTable
        budgets={budgets}
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

export default Budgeting;
