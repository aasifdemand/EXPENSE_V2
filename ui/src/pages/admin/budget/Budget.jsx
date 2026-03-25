import React from "react";
import { useBudgeting } from "../../../hooks/useBudgeting";
import BudgetTable from "../../../components/budgeting/BudgetTable";
import { Plus, Building2, TrendingUp, CreditCard, PieChart } from "lucide-react";
import { Button } from "../../../components/ui/Button";
import { StatCard } from "../../../components/ui/StatCard";
import PageHeader from "../../../components/ui/PageHeader";
 import Modal from "../../../components/ui/Modal";
import AllocateBudgetModal from "../../../components/budgeting/AllocateBudgetModal";

const Budget = () => {
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
    stats,
  } = useBudgeting();
  const [showModal, setShowModal] = React.useState(false);
  const [editItem, setEditItem] = React.useState(null);
  const [viewItem, setViewItem] = React.useState(null);
  const [showViewModal, setShowViewModal] = React.useState(false);

  const handleClose = () => {
    setShowModal(false);
    setEditItem(null);
  };

  const handleEdit = (item) => {
    setEditItem(item);
    setShowModal(true);
  };

  const handleView = (item) => {
    setViewItem(item);
    setShowViewModal(true);
  };

  // Use API-provided stats for guaranteed accuracy
  const totalAllocated = Number(stats?.totalAllocated || 0);
  const totalSpent = Number(stats?.totalSpent || 0);
  const remaining = totalAllocated - totalSpent;
  const utilization = totalAllocated ? (totalSpent / totalAllocated) * 100 : 0;

  const budget_stats = [
    {
      title: "Total Allocation",
      value: `₹${totalAllocated.toLocaleString()}`,
      icon: Building2,
      colorClass: "bg-primary-500",
      subtitle: "Total company capacity",
    },
    {
      title: "Utilized Amount",
      value: `₹${totalSpent.toLocaleString()}`,
      icon: TrendingUp,
      colorClass: "bg-rose-500",
      subtitle: "Verified expenditures",
    },
    {
      title: "Available Liquidity",
      value: `₹${remaining.toLocaleString()}`,
      icon: CreditCard,
      colorClass: "bg-amber-500",
      subtitle: "Unspent budget reserves",
    },
    {
      title: "Utilization Rate",
      value: `${utilization.toFixed(1)}%`,
      icon: PieChart,
      colorClass: "bg-green-500",
      subtitle: "Of total allocated funds",
    },
  ];

  return (
    <div className="p-4 md:p-8 lg:p-12 animate-in fade-in duration-500">
      <div className="max-w-[1600px] mx-auto space-y-10">
        <PageHeader 
          title="Budget"
          highlight="Management"
          subtitle="Allocate and monitor company-wide budgets across all locations."
          actions={
            <Button 
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 px-6 py-2.5 rounded-lg shadow-sm font-semibold text-xs uppercase"
            >
              <Plus className="w-4 h-4" />
              Allocate Budget
            </Button>
          }
        />

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {budget_stats.map((stat, i) => (
            <StatCard key={i} stat={stat} />
          ))}
        </div>

      <Modal 
        isOpen={showModal} 
        onClose={handleClose}
        title={editItem ? "Edit Budget Allocation" : "Allocate New Budget"}
        className="max-w-xl"
      >
        <AllocateBudgetModal 
          onClose={handleClose} 
          initialData={editItem}
        />
      </Modal>

      <Modal
        isOpen={showViewModal}
        onClose={() => setShowViewModal(false)}
        title="Budget Allocation Details"
        className="max-w-lg"
      >
        {viewItem && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-1">
                <p className="text-[10px] font-medium text-text-muted uppercase tracking-wider">User</p>
                <p className="text-sm font-medium text-text-primary">{viewItem.user?.name}</p>
                <p className="text-[11px] text-text-muted">{viewItem.user?.email}</p>
              </div>
              <div className="space-y-1 text-right">
                <p className="text-[10px] font-medium text-text-muted uppercase tracking-wider">Allocated</p>
                <p className="text-xl font-medium text-green-600">₹{viewItem.allocatedAmount?.toLocaleString()}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-medium text-text-muted uppercase tracking-wider">Company</p>
                <p className="text-sm font-medium text-text-primary">{viewItem.company}</p>
              </div>
              <div className="space-y-1 text-right">
                <p className="text-[10px] font-medium text-text-muted uppercase tracking-wider">Spent</p>
                <p className="text-sm font-medium text-rose-600">₹{viewItem.spentAmount?.toLocaleString()}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-medium text-text-muted uppercase tracking-wider">Date Allocated</p>
                <p className="text-sm font-medium text-text-primary">{new Date(viewItem.createdAt).toLocaleDateString()}</p>
              </div>
              <div className="space-y-1 text-right">
                <p className="text-[10px] font-medium text-text-muted uppercase tracking-wider">Remaining</p>
                <p className="text-lg font-medium text-primary-600">₹{viewItem.remainingAmount?.toLocaleString()}</p>
              </div>
            </div>
            
            <div className="pt-4 border-t border-border flex justify-end">
              <Button onClick={() => setShowViewModal(false)} variant="outline" className="px-6">
                Close View
              </Button>
            </div>
          </div>
        )}
      </Modal>

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
        role="superadmin"
        onEdit={handleEdit}
        onView={handleView}
      />
    </div>
  </div>
);
};

export default Budget;
