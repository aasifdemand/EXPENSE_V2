import React, { useState, useMemo } from "react";
import { useSelector } from "react-redux";
import { 
  Wallet, 
  Coins, 
  CreditCard, 
  TrendingUp, 
  Plus,
  History,
  Activity,
  Building2,
  PieChart as PieChartIcon,
  BarChart3,
  Calendar
} from "lucide-react";
import { useGetBudgetsQuery } from "../../store/budgetApi";
import { useGetReimbursementsQuery } from "../../store/reimbursementApi";
import { useExpenses } from "../../hooks/useExpenses";

import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

import { Card, CardContent, } from "../../components/ui/Card";
import { StatCard } from "../../components/ui/StatCard";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Tabs, TabsList, TabsTrigger } from "../../components/ui/Tabs";
import { Select } from "../../components/ui/Select";
import Modal from "../../components/ui/Modal";
import MultiStepExpenseForm from "../../components/expenses/MultiStepExpenseForm";
import PageHeader from "../../components/ui/PageHeader";

const UserDashboard = () => {
  const [activeTab, setActiveTab] = useState("expenses");
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [chartView, setChartView] = useState("month"); // "trend" or "month"

  const { user } = useSelector((state) => state?.auth || {});
  
  // RTK Query fetches
  const { data: reimbData } = useGetReimbursementsQuery({ userId: user?.id }, { skip: !user?.id });
  const { data: budgetData } = useGetBudgetsQuery({ userId: user?.id, limit: 1000 }, { skip: !user?.id });
  
  const reimbursements = useMemo(() => reimbData?.data || [], [reimbData]);
  const budgets = useMemo(() => budgetData?.data || [], [budgetData]);
  
  const { allExpenses } = useExpenses();



  const totalAllocated = useMemo(() => budgets?.reduce((acc, b) => acc + Number(b?.allocatedAmount || 0), 0) || 0, [budgets]);
  const totalSpentFromBudget = useMemo(() => budgets?.reduce((acc, b) => acc + Number(b?.spentAmount || 0), 0) || 0, [budgets]);

  const totalReimbursed = useMemo(() => reimbursements?.filter(r => r.isReimbursed).reduce((acc, r) => acc + Number(r.amount || 0), 0) || 0, [reimbursements]);
  const totalPendingClaims = useMemo(() => reimbursements?.filter(r => !r.isReimbursed).reduce((acc, r) => acc + Number(r.amount || 0), 0) || 0, [reimbursements]);
  
  const totalSpent = totalSpentFromBudget + totalReimbursed;

  // Updated Trend Data Logic (Matches Admin for better reliability)
  const chartData = useMemo(() => {
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
    allExpenses?.forEach(e => {
      const rawDate = new Date(e.createdAt || e.date).toISOString().split('T')[0];
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
  }, [allExpenses, budgets, reimbursements, chartView, selectedMonth, selectedYear]);

  // Category Chart Data
  const categoryData = useMemo(() => {
    const categories = {};
    allExpenses?.forEach(e => {
      const cat = typeof e.subDepartment === 'object' ? e.subDepartment?.name : (e.subDepartment || 'Misc');
      categories[cat] = (categories[cat] || 0) + Number(e.amount || 0);
    });
    return Object.entries(categories)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [allExpenses]);

  const COLORS = ['#6366f1', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6'];

 

  const statsConfig = [
    {
      title: "Total Budget",
      value: `₹${totalAllocated.toLocaleString()}`,
      icon: Wallet,
      colorClass: "bg-primary-600",
      subtitle: "Monthly allocation",
    },
    {
      title: "Spent Amount",
      value: `₹${totalSpent.toLocaleString()}`,
      icon: TrendingUp,
      colorClass: "bg-rose-500",
      subtitle: "Verified expenses",
    },
    {
      title: "Pending Claims",
      value: `₹${totalPendingClaims.toLocaleString()}`,
      icon: CreditCard,
      colorClass: "bg-amber-500",
      subtitle: "Awaiting settlement",
    },
    {
      title: "Total Refunds",
      value: `₹${totalReimbursed.toLocaleString()}`,
      icon: Coins,
      colorClass: "bg-green-500",
      subtitle: "Total settled funds",
    },
  ];

  return (
    <div className="p-4 md:p-8 lg:p-12 animate-in fade-in duration-700">
      <div className="max-w-[1600px] mx-auto space-y-10">
        <PageHeader 
          title="Welcome back,"
          highlight={user?.name?.split(' ')[0]}
          subtitle="Here's a summary of your financial activity today."
          actions={
            <Button 
              onClick={() => setShowExpenseModal(true)}
              className="px-6 py-2.5 rounded-xl font-semibold shadow-lg shadow-primary-500/20 flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              New Expense
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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsConfig.map((stat, idx) => <StatCard key={idx} stat={stat} />)}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-8">
          <Card className="border-none shadow-sm bg-white overflow-hidden">
            <div className="p-6 border-b border-border/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h3 className="text-lg font-semibold text-text-primary">Financial Breakdown</h3>
                <p className="text-[11px] font-medium text-text-muted uppercase tracking-wider">
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
            <CardContent className="p-6 h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10, fill: '#64748b', fontWeight: 600 }} 
                    dy={10} 
                    minTickGap={chartView === 'month' ? 10 : 0}
                  />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b', fontWeight: 600 }} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontWeight: '600' }}
                    cursor={{ fill: '#f8fafc' }}
                  />
                  <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: '600', textTransform: 'uppercase' }} />
                  <Bar dataKey="expenses" name="Expenses" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={12} />
                  <Bar dataKey="budget" name="Allocation" fill="#f59e0b" radius={[4, 4, 0, 0]} barSize={12} />
                  <Bar dataKey="reimbursement" name="Reimbursed" fill="#10b981" radius={[4, 4, 0, 0]} barSize={12} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm bg-white overflow-hidden">
             <div className="p-6 border-b border-border/50 flex justify-between items-center bg-slate-50/50">
               <div className="flex items-center gap-2">
                 <History className="w-5 h-5 text-primary-600" />
                 <h3 className="text-lg font-semibold text-text-primary tracking-tight">Recent Activity</h3>
               </div>
               <Tabs defaultValue="expenses" className="w-auto">
                 <TabsList className="bg-white/80 p-1 rounded-xl shadow-sm border border-border/50">
                   <TabsTrigger onClick={() => setActiveTab("expenses")} value="expenses" className="px-4 py-1.5 text-[10px] font-medium uppercase tracking-widest rounded-lg data-[state=active]:bg-primary-600 data-[state=active]:text-white data-[state=active]:shadow-md transition-all">
                     Expenses
                   </TabsTrigger>
                   <TabsTrigger onClick={() => setActiveTab("budgets")} value="budgets" className="px-4 py-1.5 text-[10px] font-medium uppercase tracking-widest rounded-lg data-[state=active]:bg-primary-600 data-[state=active]:text-white data-[state=active]:shadow-md transition-all">
                     Budgets
                   </TabsTrigger>
                 </TabsList>
               </Tabs>
             </div>
             <CardContent className="p-0">
               <div className="overflow-x-auto font-medium">
                 <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50/50 text-text-secondary border-b border-border text-[10px] font-medium uppercase tracking-widest">
                       <tr>
                         {activeTab === 'expenses' ? (
                           <>
                             <th className="px-6 py-4 text-primary-600 font-medium uppercase text-[11px]">Expense Detail</th>
                             <th className="px-6 py-4">Amount</th>
                             <th className="px-6 py-4">Category</th>
                             <th className="px-6 py-4">Status</th>
                             <th className="px-6 py-4">Date</th>
                           </>
                         ) : (
                           <>
                             <th className="px-6 py-4">Allocation</th>
                             <th className="px-6 py-4">Total</th>
                             <th className="px-6 py-4">Available</th>
                             <th className="px-6 py-4">Location</th>
                             <th className="px-6 py-4">Date</th>
                           </>
                         )}
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50">
                      {activeTab === 'expenses' ? (
                        allExpenses?.length > 0 ? allExpenses.map(e => (
                          <tr key={e.id} className="hover:bg-slate-50 transition-colors">
                            <td className="px-6 py-4 font-semibold text-text-primary">{e.description || 'General Expense'}</td>
                            <td className="px-6 py-4 font-semibold text-rose-600">₹{Number(e.amount).toLocaleString()}</td>
                                                         <td className="px-6 py-4">
                               <Badge variant="outline" className="text-[10px] uppercase font-semibold text-blue-600 border-blue-100 bg-blue-50/50">
                                 {typeof e.subDepartment === 'object' ? e.subDepartment?.name : (e.subDepartment || 'Misc')}
                               </Badge>
                             </td>
                            <td className="px-6 py-4">
                              <Badge variant={e.reimbursement ? (e.reimbursement.isReimbursed ? 'success' : 'warning') : 'success'}>
                                {e.reimbursement ? (e.reimbursement.isReimbursed ? 'Settled' : 'Pending') : 'Approved'}
                              </Badge>
                            </td>
                            <td className="px-6 py-4 text-text-muted text-[12px]">{new Date(e.createdAt || e.date).toLocaleDateString()}</td>
                          </tr>
                        )) : <tr><td colSpan={5} className="p-12 text-center text-text-muted italic">No recent expenses found.</td></tr>
                      ) : (
                        budgets?.length > 0 ? budgets.map(b => (
                          <tr key={b.id} className="hover:bg-slate-50 transition-colors">
                             <td className="px-6 py-4 font-semibold text-primary-600">
                               {typeof b.user === 'object' ? b.user?.name : (b.user || 'Unknown User')}
                             </td>
                             <td className="px-6 py-4 font-semibold italic">₹{Number(b.allocatedAmount).toLocaleString()}</td>
                             <td className="px-6 py-4 text-green-600 font-semibold">₹{Number(b.remainingAmount).toLocaleString()}</td>
                             <td className="px-6 py-4 text-text-secondary uppercase text-[11px] font-semibold">{b.company}</td>
                             <td className="px-6 py-4 text-text-muted text-[12px]">{new Date(b.createdAt).toLocaleDateString()}</td>
                          </tr>
                        )) : <tr><td colSpan={5} className="p-12 text-center text-text-muted italic">No budget records found.</td></tr>
                      )}
                    </tbody>
                 </table>
               </div>
             </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-4 space-y-8">
           <Card className="border-none shadow-sm bg-white overflow-hidden">
              <div className="p-6 border-b border-border/50 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <PieChartIcon className="w-5 h-5 text-amber-600" />
                  <h3 className="text-lg font-semibold text-text-primary tracking-tight">Category Distribution</h3>
                </div>
              </div>
              <CardContent className="p-6">
                <div className="h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryData}
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {categoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontWeight: '600' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-4 space-y-2">
                  {categoryData.slice(0, 4).map((cat, idx) => (
                    <div key={cat.name} className="flex items-center justify-between px-2">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                        <span className="text-[11px] font-semibold text-text-primary capitalize">{cat.name}</span>
                      </div>
                      <span className="text-[11px] font-semibold text-text-secondary">₹{cat.value.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
           </Card>

           <Card className="border-none shadow-sm bg-white">
              <div className="p-6 border-b border-border/50">
                <h3 className="font-semibold text-text-primary tracking-tight">Need Help?</h3>
                <p className="text-[12px] text-text-muted font-medium">Contact administration for claims</p>
              </div>
              <CardContent className="p-6 space-y-4">
                 <div className="flex items-center gap-3 p-4 rounded-xl border border-dashed border-slate-200 hover:border-primary-300 hover:bg-primary-50/30 transition-all cursor-pointer group">
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center group-hover:bg-primary-100 group-hover:text-primary-600 transition-all">
                       <Plus className="w-5 h-5" />
                    </div>
                    <span className="font-semibold text-sm text-text-secondary group-hover:text-primary-600 transition-colors">Raise a Support Ticket</span>
                 </div>
              </CardContent>
           </Card>
        </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
