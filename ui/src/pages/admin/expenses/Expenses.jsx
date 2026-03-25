import React from "react";
import { useExpenses } from "../../../hooks/useExpenses";
import ExpenseTable from "../../../components/expenses/ExpenseTable";
import { Plus, FileText, ExternalLink, TrendingUp, CreditCard, Building2, PieChart } from "lucide-react";
import { Button } from "../../../components/ui/Button";
import { StatCard } from "../../../components/ui/StatCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../components/ui/Tabs";
import Modal from "../../../components/ui/Modal";
import MultiStepExpenseForm from "../../../components/expenses/MultiStepExpenseForm";
import PageHeader from "../../../components/ui/PageHeader";

const Expenses = () => {
  const {
    expenses,
    loading,
    meta,
    page,
    setPage,
    search,
    setSearch,
    limit,
    setLimit,
    adminExpenses,
    adminMeta,
  } = useExpenses();
  const [showModal, setShowModal] = React.useState(false);
  const [editItem, setEditItem] = React.useState(null);
  const [viewItem, setViewItem] = React.useState(null);
  const [showViewModal, setShowViewModal] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState("user");

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

  const getDeptStats = (data) => {
    const deptMap = data?.reduce((acc, exp) => {
      const name = exp.department?.name || "Other";
      acc[name] = (acc[name] || 0) + Number(exp.amount);
      return acc;
    }, {}) || {};

    return Object.entries(deptMap)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 4);
  };

  const userDeptStats = getDeptStats(expenses);
  const adminDeptStats = getDeptStats(adminExpenses);

  const colors = [
    { textClass: "text-rose-600", bgClass: "bg-rose-50" },
    { textClass: "text-blue-600", bgClass: "bg-blue-50" },
    { textClass: "text-amber-600", bgClass: "bg-amber-50" },
    { textClass: "text-emerald-600", bgClass: "bg-emerald-50" },
  ];

  const renderStats = (stats, labelPrefix) => {
    const cards = stats.map((dept, i) => ({
      title: dept.name,
      value: `₹${dept.value.toLocaleString()}`,
      icon: Building2,
      colorClass: colors[i % colors.length].textClass.replace("text-", "bg-"),
      subtitle: `${labelPrefix} sum`,
    }));

    while (cards.length < 4) {
      cards.push({
        title: "No Data",
        value: "₹0",
        icon: Building2,
        colorClass: "bg-slate-400",
        subtitle: "Departmental breakdown",
      });
    }

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((stat, i) => (
          <StatCard key={i} stat={stat} />
        ))}
      </div>
    );
  };

  return (
    <div className="p-4 md:p-8 lg:p-12 animate-in fade-in duration-500">
      <div className="max-w-[1600px] mx-auto space-y-8">
        <PageHeader 
          title="Company"
          highlight="Expenses"
          subtitle="Comprehensive view of all logged expenses for audit and approval."
          actions={
            <Button 
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 px-6 py-2.5 rounded-lg shadow-sm font-semibold text-xs uppercase"
            >
              <Plus className="w-4 h-4" />
              Add Record
            </Button>
          }
        />

      <Tabs 
        defaultValue="user"
        value={activeTab} 
        onValueChange={setActiveTab}
        className="w-full space-y-8"
      >
        <div className="border-b border-border/50 pb-px">
          <TabsList className="bg-transparent h-auto p-0 gap-8">
            <TabsTrigger 
              value="user"
              className="px-0 py-3 rounded-none border-b-2 border-transparent data-[state=active]:border-primary-600 data-[state=active]:bg-transparent data-[state=active]:text-primary-600 data-[state=active]:shadow-none text-sm font-semibold transition-all"
            >
              User Claims
            </TabsTrigger>
            <TabsTrigger 
              value="admin"
              className="px-0 py-3 rounded-none border-b-2 border-transparent data-[state=active]:border-amber-600 data-[state=active]:bg-transparent data-[state=active]:text-amber-600 data-[state=active]:shadow-none text-sm font-semibold transition-all"
            >
              Company Spends
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="user" className="mt-0 space-y-8 animate-in fade-in duration-300">
          {renderStats(userDeptStats, "User Claims")}
          <div className="pt-6">
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
              role="superadmin"
              onEdit={handleEdit}
              onView={handleView}
            />
          </div>
        </TabsContent>

        <TabsContent value="admin" className="mt-0 space-y-8 animate-in fade-in duration-300">
          {renderStats(adminDeptStats, "Admin Spends")}
          <div className="pt-6">
            <ExpenseTable
              expenses={adminExpenses}
              loading={loading}
              meta={adminMeta}
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
        </TabsContent>
      </Tabs>

      <Modal 
        isOpen={showModal} 
        onClose={handleClose}
        title={editItem ? "Edit Expense Record" : "Record Company Expense"}
        className="max-w-xl"
      >
        <MultiStepExpenseForm 
          onClose={handleClose} 
          isAdmin={true} 
          initialData={editItem} 
        />
      </Modal>

      <Modal
        isOpen={showViewModal}
        onClose={() => setShowViewModal(false)}
        title="Expense Details"
        className="max-w-lg"
      >
        {viewItem && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-1">
                <p className="text-[10px] font-medium text-text-muted uppercase tracking-wider">Description</p>
                <p className="text-sm font-medium text-text-primary leading-tight">{viewItem.description}</p>
              </div>
              <div className="space-y-1 text-right">
                <p className="text-[10px] font-medium text-text-muted uppercase tracking-wider">Amount</p>
                <p className="text-xl font-medium text-rose-600">₹{Number(viewItem.amount).toLocaleString()}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-medium text-text-muted uppercase tracking-wider">Department</p>
                <p className="text-sm font-medium text-text-primary">{viewItem.department?.name || 'N/A'}</p>
              </div>
              <div className="space-y-1 text-right">
                <p className="text-[10px] font-medium text-text-muted uppercase tracking-wider">Date</p>
                <p className="text-sm font-medium text-text-primary">{new Date(viewItem.date).toLocaleDateString()}</p>
              </div>
            </div>

            {viewItem.proof && (
              <div className="space-y-2 pt-4 border-t border-border/50">
                <p className="text-[10px] font-medium text-text-muted uppercase tracking-wider">Proof of Expense</p>
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-border/50 group hover:border-primary-200 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white rounded-lg shadow-sm border border-border/50">
                      <FileText className="w-5 h-5 text-primary-600" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-text-primary">Receipt / Document</p>
                      <p className="text-[10px] text-text-muted font-medium italic">Click to view attachment</p>
                    </div>
                  </div>
                  <a 
                    href={viewItem.proof} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="p-2 rounded-lg bg-white border border-border shadow-sm text-text-muted hover:text-primary-600 hover:border-primary-600 transition-all active:scale-95"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>
            )}
            
            <div className="pt-4 border-t border-border flex justify-end">
              <Button onClick={() => setShowViewModal(false)} variant="outline" className="px-6">
                Close View
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  </div>
);
};

export default Expenses;
