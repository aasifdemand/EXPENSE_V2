/* eslint-disable react-hooks/exhaustive-deps */
import React, { useMemo, useState } from "react";
import {
  Wallet,
  Coins,
  CreditCard,
  TrendingUp,
  Plus,
  AlertCircle
} from "lucide-react";

import { useGetBudgetsQuery } from "../../store/budgetApi";
import { useGetReimbursementsQuery } from "../../store/reimbursementApi";
import { useExpenses } from "../../hooks/useExpenses";
import { useLocation } from "../../contexts/LocationContext";


import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/Card";
import { StatCard } from "../../components/ui/StatCard";
import { Badge } from "../../components/ui/Badge";
import Modal from "../../components/ui/Modal";
import { Button } from "../../components/ui/Button";
import MultiStepExpenseForm from "../../components/expenses/MultiStepExpenseForm";
import AllocateBudgetModal from "../../components/budgeting/AllocateBudgetModal";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/Tabs";
import ExpenseTable from "../../components/expenses/ExpenseTable";
import BudgetTable from "../../components/budgeting/BudgetTable";
import PageHeader from "../../components/ui/PageHeader";
import { Select } from "../../components/ui/Select";
import { FileText, ExternalLink, BarChart3, PieChart as PieChartIcon } from "lucide-react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell, 
  PieChart, 
  Pie, 
  Legend 
} from "recharts";


const AdminDashboard = () => {
  const { currentLoc } = useLocation();

  const [expensePage, setExpensePage] = useState(1);
  const [budgetPage, setBudgetPage] = useState(1);
  const [expenseLimit, setExpenseLimit] = useState(10);
  const [budgetLimit, setBudgetLimit] = useState(10);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [chartView, setChartView] = useState("month");

  // RTK Query fetches
  const { 
    data: budgetData, 
    isFetching: budgetLoading, 
    error: budgetError 
  } = useGetBudgetsQuery({ location: currentLoc, page: budgetPage, limit: budgetLimit });

  const { 
    data: reimbData, 
    error: reimbError 
  } = useGetReimbursementsQuery({ location: currentLoc, page: 1, limit: 100 });

  const {
    expenses,
    adminExpenses,
    meta: expenseTableMeta,
    adminStats,
    loading: expenseLoading,
    error: expenseError,
  } = useExpenses({
    page: expensePage,
    limit: expenseLimit,
    setPage: setExpensePage,
    setLimit: setExpenseLimit
  });

  const budgets = budgetData?.data || [];
  const budgetMeta = budgetData?.meta || { total: 0, page: 1, limit: 10 };
  const budgetStats = budgetData?.stats || {};
  
  const reimbursements = reimbData?.data || [];
  const reimbStats = reimbData?.stats || {};

  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [viewItem, setViewItem] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [activeTab, setActiveTab] = useState("expenses");

  const handleEdit = (item) => {
    setEditItem(item);
    setShowExpenseModal(true);
  };

  const handleView = (item) => {
    setViewItem(item);
    setShowViewModal(true);
  };

  const handleCloseExpenseModal = () => {
    setShowExpenseModal(false);
    setEditItem(null);
  };


  // Derive stats from API-provided stats and statsBudgets (Full data)
  // Use API-provided stats for guaranteed accuracy (Backend handles location filters)
  const totalPendingReimbursed = reimbStats?.totalPendingAmount || 0;
  const totalReimbursed = reimbStats?.totalReimbursedAmount || 0;

  const totalExpenses = (Number(budgetStats?.totalSpent || 0) + Number(totalReimbursed) + Number(adminStats?.totalSpent || 0));

  const statsConfig = [
    {
      title: "Total Budget",
      value: `₹${Number(budgetStats?.totalAllocated || 0).toLocaleString()}`,
      subtitle: "Monthly allocation",
      icon: Wallet,
      colorClass: "bg-primary-600",
    },
    {
      title: "Spent Amount",
      value: `₹${totalExpenses.toLocaleString()}`,
      subtitle: "Verified expenses",
      icon: TrendingUp,
      colorClass: "bg-rose-500",
    },
    {
      title: "Pending Claims",
      value: `₹${totalPendingReimbursed.toLocaleString()}`,
      subtitle: "Awaiting settlement",
      icon: CreditCard,
      colorClass: "bg-amber-500",
    },
    {
      title: "Total Refunds",
      value: `₹${totalReimbursed.toLocaleString()}`,
      subtitle: "Total settled funds",
      icon: Coins,
      colorClass: "bg-green-500",
    },
  ];

  // Process data for charts
  const trendData = useMemo(() => {
    const dataMap = {};
    
    if (chartView === "trend") {
      // Last 7 Days logic
      const last7Days = [...Array(7)].map((_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - i);
        return d.toISOString().split('T')[0];
      }).reverse();

      last7Days.forEach(date => {
        const dayName = new Date(date).toLocaleDateString(undefined, { weekday: 'short' });
        dataMap[date] = { name: dayName, rawDate: date, expenses: 0, budget: 0, reimbursement: 0 };
      });
    } else {
      // Full Month logic
      const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();
      for (let i = 1; i <= daysInMonth; i++) {
        const date = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
        dataMap[date] = { name: String(i), rawDate: date, expenses: 0, budget: 0, reimbursement: 0 };
      }
    }
    
    // Process Expenses
    expenses?.forEach(e => {
      const rawDate = new Date(e.date).toISOString().split('T')[0];
      if (dataMap[rawDate]) {
        dataMap[rawDate].expenses += Number(e.amount || 0);
      }
    });

    // Process Budgets
    budgets?.forEach(b => {
      const rawDate = new Date(b.createdAt).toISOString().split('T')[0];
      if (dataMap[rawDate]) {
        dataMap[rawDate].budget += Number(b.allocatedAmount || 0);
      }
    });

    // Process Reimbursements
    reimbursements?.forEach(r => {
      const rawDate = new Date(r.createdAt).toISOString().split('T')[0];
      if (dataMap[rawDate]) {
        dataMap[rawDate].reimbursement += Number(r.amount || 0);
      }
    });
    
    return Object.values(dataMap).sort((a, b) => new Date(a.rawDate) - new Date(b.rawDate));
  }, [chartView, selectedYear, selectedMonth, expenses, budgets, reimbursements]);

  const userData = useMemo(() => {
    const userMap = {};
    expenses?.forEach(e => {
      const name = e.user?.name || "Other";
      userMap[name] = (userMap[name] || 0) + Number(e.amount);
    });
    
    return Object.entries(userMap)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  }, [expenses]);

  const COLORS = ['#6366f1', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6'];
  const hasError = budgetError || expenseError || reimbError;


  return (
    <div className="p-4 md:p-8 lg:p-12 animate-in fade-in duration-500">
      <div className="max-w-[1600px] mx-auto space-y-8">
        <PageHeader 
          title="Admin"
          highlight="Dashboard"
          subtitle="Comprehensive overview of organization-wide financial activity"
          actions={hasError && (
            <Badge variant="warning" className="px-5 py-2.5 rounded-2xl border-none backdrop-blur-sm animate-in slide-in-from-right duration-700 flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              <span className="text-[10px] font-medium uppercase tracking-[0.2em]">
                System Sync Error
              </span>
            </Badge>
          )}
        />

        <Modal 
          isOpen={showExpenseModal} 
          onClose={handleCloseExpenseModal}
          title={editItem ? (activeTab === "budgets" ? "Edit Budget Allocation" : "Edit Expense Record") : "Record Company Expense"}
          className="max-w-xl"
        >
          {activeTab === "budgets" ? (
            <AllocateBudgetModal onClose={handleCloseExpenseModal} initialData={editItem} />
          ) : (
            <MultiStepExpenseForm onClose={handleCloseExpenseModal} isAdmin={true} initialData={editItem} />
          )}
        </Modal>

        <Modal
          isOpen={showViewModal}
          onClose={() => setShowViewModal(false)}
          title={viewItem?.type === 'budget' ? "Budget Details" : "Expense Details"}
          className="max-w-lg"
        >
          {viewItem && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                {viewItem.type === 'budget' ? (
                  <>
                    <div className="space-y-1">
                      <p className="text-[10px] font-semibold text-text-muted uppercase tracking-wider">User</p>
                      <p className="text-sm font-semibold text-text-primary">{viewItem.user?.name}</p>
                    </div>
                    <div className="space-y-1 text-right">
                      <p className="text-[10px] font-semibold text-text-muted uppercase tracking-wider">Allocated</p>
                      <p className="text-xl font-semibold text-green-600">₹{Number(viewItem.allocatedAmount).toLocaleString()}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-semibold text-text-muted uppercase tracking-wider">Company</p>
                      <p className="text-sm font-semibold text-text-primary">{viewItem.company}</p>
                    </div>
                    <div className="space-y-1 text-right">
                      <p className="text-[10px] font-semibold text-text-muted uppercase tracking-wider">Remaining</p>
                      <p className="text-lg font-semibold text-primary-600">₹{Number(viewItem.remainingAmount).toLocaleString()}</p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="space-y-1">
                      <p className="text-[10px] font-semibold text-text-muted uppercase tracking-wider">Description</p>
                      <p className="text-sm font-semibold text-text-primary leading-tight">{viewItem.description}</p>
                    </div>
                    <div className="space-y-1 text-right">
                      <p className="text-[10px] font-semibold text-text-muted uppercase tracking-wider">Amount</p>
                      <p className="text-xl font-semibold text-rose-600">₹{Number(viewItem.amount).toLocaleString()}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-semibold text-text-muted uppercase tracking-wider">Department</p>
                      <p className="text-sm font-semibold text-text-primary">{viewItem.department?.name || 'N/A'}</p>
                    </div>
                    <div className="space-y-1 text-right">
                      <p className="text-[10px] font-semibold text-text-muted uppercase tracking-wider">Date</p>
                      <p className="text-sm font-semibold text-text-primary">{new Date(viewItem.date).toLocaleDateString()}</p>
                    </div>
                  </>
                )}
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
        {hasError && (
          <div className="flex items-center gap-2 text-red-500 bg-red-50 px-4 py-2 rounded-lg border border-red-100 animate-pulse">
            <AlertCircle className="w-4 h-4" />
            <span className="text-xs font-medium uppercase tracking-wider">
              Sync Error Detected
            </span>
          </div>
        )}
        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {statsConfig.map((stat, idx) => (
            <StatCard key={idx} stat={stat} />
          ))}
        </div>

        {/* Analytics Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Trend Chart */}
          <Card className="lg:col-span-2 border-none shadow-sm overflow-hidden bg-white">
            <div className="p-6 border-b border-border/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h3 className="text-lg font-semibold text-text-primary">Financial Breakdown</h3>
                <p className="text-[11px] font-semibold text-text-muted uppercase tracking-wider">
                  {chartView === 'trend' ? 'Last 7 days activity' : `Daily activity for ${new Date(selectedYear, selectedMonth - 1).toLocaleString(undefined, { month: 'long', year: 'numeric' })}`}
                </p>
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Select 
                  value={chartView} 
                  onChange={(e) => setChartView(e.target.value)}
                  className="h-9 text-[11px] min-w-[100px]"
                >
                  <option value="trend">7 Days</option>
                  <option value="month">Monthly</option>
                </Select>

                {chartView === 'month' && (
                  <>
                    <Select 
                      value={selectedMonth} 
                      onChange={(e) => setSelectedMonth(Number(e.target.value))}
                      className="h-9 text-[11px] min-w-[110px]"
                    >
                      {Array.from({ length: 12 }, (_, i) => (
                        <option key={i + 1} value={i + 1}>
                          {new Date(0, i).toLocaleString(undefined, { month: 'long' })}
                        </option>
                      ))}
                    </Select>
                    <Select 
                      value={selectedYear} 
                      onChange={(e) => setSelectedYear(Number(e.target.value))}
                      className="h-9 text-[11px] min-w-[90px]"
                    >
                      {[2024, 2025, 2026].map(y => (
                        <option key={y} value={y}>{y}</option>
                      ))}
                    </Select>
                  </>
                )}
                <div className="p-2 bg-primary-50 rounded-lg hidden sm:block">
                  <BarChart3 className="w-4 h-4 text-primary-600" />
                </div>
              </div>
            </div>
            <CardContent className="p-6 h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 600 }}
                    dy={10}
                    minTickGap={chartView === 'month' ? 12 : 0}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 600 }}
                  />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontWeight: '600' }}
                    cursor={{ fill: '#f8fafc' }}
                  />
                  <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: '600', textTransform: 'uppercase' }} />
                  <Bar dataKey="expenses" name="Expenses" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={chartView === 'month' ? 10 : 15} />
                  <Bar dataKey="budget" name="Allocation" fill="#f59e0b" radius={[4, 4, 0, 0]} barSize={chartView === 'month' ? 10 : 15} />
                  <Bar dataKey="reimbursement" name="Reimbursed" fill="#10b981" radius={[4, 4, 0, 0]} barSize={chartView === 'month' ? 10 : 15} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Distribution Chart */}
          <Card className="border-none shadow-sm overflow-hidden bg-white">
            <div className="p-6 border-b border-border/50 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <PieChartIcon className="w-5 h-5 text-amber-600" />
                <h3 className="text-sm font-medium text-text-primary uppercase tracking-wider">User Spending</h3>
              </div>
            </div>
            <CardContent className="pt-6 h-[350px] flex flex-col items-center justify-center">
              <div className="w-full h-[220px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={userData}
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {userData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontWeight: '600' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 w-full space-y-2">
                {userData.map((user, idx) => (
                  <div key={user.name} className="flex items-center justify-between px-2">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                      <span className="text-[11px] font-medium text-text-primary capitalize">{user.name}</span>
                    </div>
                    <span className="text-[11px] font-medium text-text-secondary">₹{user.value.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Budget & Expenses Section */}
        <div className="grid grid-cols-1 gap-6">
          <Tabs defaultValue="expenses" className="w-full">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
              <TabsList className="bg-slate-100/50 p-1 rounded-xl w-full sm:w-auto">
                <TabsTrigger onClick={() => setActiveTab("budgets")} value="budgets" className="px-6 py-2 text-xs font-medium uppercase tracking-wider rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all text-text-muted">
                  Active Budgets
                </TabsTrigger>
                <TabsTrigger onClick={() => setActiveTab("expenses")} value="expenses" className="px-6 py-2 text-xs font-medium uppercase tracking-wider rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all text-text-muted">
                  User Claims
                </TabsTrigger>
                <TabsTrigger onClick={() => setActiveTab("admin")} value="admin" className="px-6 py-2 text-xs font-medium uppercase tracking-wider rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all text-text-muted">
                  Company Spends
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="admin" className="mt-0 w-full sm:w-auto">
                <Button 
                  onClick={() => setShowExpenseModal(true)}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 font-medium text-xs uppercase"
                >
                  <Plus className="w-4 h-4" />
                  Add Record
                </Button>
              </TabsContent>
            </div>
            <Card className="border-none shadow-sm overflow-hidden">
            <CardHeader className="flex flex-row justify-between items-center border-b border-border/50 bg-slate-50/50 pb-4">
              <CardTitle>Global Activity</CardTitle>
            </CardHeader>
            <CardContent className="p-0 font-medium">
              <TabsContent value="budgets" className="mt-0">
                <BudgetTable 
                  budgets={budgets}
                  loading={budgetLoading}
                  meta={budgetMeta}
                  page={budgetPage}
                  setPage={setBudgetPage}
                  limit={budgetLimit}
                  setLimit={setBudgetLimit}
                  role="superadmin"
                  onEdit={handleEdit}
                  onView={(item) => handleView({...item, type: 'budget'})}
                />
              </TabsContent>

              <TabsContent value="expenses" className="mt-0">
                <ExpenseTable 
                  expenses={expenses}
                  loading={expenseLoading}
                  meta={expenseTableMeta}
                  page={expensePage}
                  setPage={setExpensePage}
                  limit={expenseLimit}
                  setLimit={setExpenseLimit}
                  role="superadmin"
                  onEdit={handleEdit}
                  onView={(item) => handleView({...item, type: 'expense'})}
                />
              </TabsContent>

              <TabsContent value="admin" className="mt-0">
                <ExpenseTable 
                  expenses={adminExpenses}
                  loading={expenseLoading}
                  meta={expenseTableMeta}
                  page={1}
                  setPage={() => {}}
                  limit={100}
                  showPagination={false}
                  role="superadmin"
                  onEdit={handleEdit}
                  onView={(item) => handleView({...item, type: 'expense'})}
                />
              </TabsContent>
            </CardContent>
          </Card>
        </Tabs>
      </div>

      <Modal 
        isOpen={showExpenseModal} 
        onClose={() => setShowExpenseModal(false)}
        title="Record Company Expense"
        className="max-w-xl"
      >
        <MultiStepExpenseForm onClose={() => setShowExpenseModal(false)} isAdmin={true} />
      </Modal>
    </div>
  </div>
);
};

export default AdminDashboard;
