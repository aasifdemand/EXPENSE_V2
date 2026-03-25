import React, { useState, useMemo } from "react";
import { useSelector } from "react-redux";
import { 
  Filter, 
  TrendingUp, 
  PieChart, 
  FileText,
  Table as TableIcon,
  Calendar,
} from "lucide-react";
import { Button } from "../../../components/ui/Button";
import { Card } from "../../../components/ui/Card";
import { StatCard } from "../../../components/ui/StatCard";
import { Badge } from "../../../components/ui/Badge";
import { Input } from "../../../components/ui/Input";
import { Select } from "../../../components/ui/Select";
import PageHeader from "../../../components/ui/PageHeader";
import Modal from "../../../components/ui/Modal";
import { useGetUserExpensesQuery } from "../../../store/expenseApi";
import { useGetUserReimbursementsQuery } from "../../../store/reimbursementApi";
import { useGetUserBudgetsQuery } from "../../../store/budgetApi";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const UserReport = () => {
  const { user } = useSelector((state) => state.auth);
  
  const [filter, setFilter] = useState({
    type: "expenses",
    dateStart: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    dateEnd: new Date().toISOString().split('T')[0]
  });

  const [showExportModal, setShowExportModal] = useState(false);
  const [pendingExportType, setPendingExportType] = useState(null);

  // Fetch user-specific data with high limit for reports
  const { data: expenseData, isLoading: expensesLoading } = useGetUserExpensesQuery({ 
    userId: user?.id, 
    limit: 1000 
  }, { skip: !user?.id });

  const { data: reimbursementData, isLoading: reimbursementsLoading } = useGetUserReimbursementsQuery({ 
    userId: user?.id, 
    limit: 1000 
  }, { skip: !user?.id });

  const { data: budgetData, isLoading: budgetsLoading } = useGetUserBudgetsQuery({ 
    userId: user?.id, 
    limit: 1000 
  }, { skip: !user?.id });

  const expenses = useMemo(() => expenseData?.allExpenses || expenseData?.data || [], [expenseData]);
  const reimbursements = useMemo(() => reimbursementData?.data || [], [reimbursementData]);
  const budgets = useMemo(() => budgetData?.data || [], [budgetData]);

  const reportData = useMemo(() => {
    let items = [];
    const start = new Date(filter.dateStart);
    const end = new Date(filter.dateEnd);
    // Set end of day for the end date
    end.setHours(23, 59, 59, 999);

    if (filter.type === "expenses") {
      items = expenses.filter(e => {
        const d = new Date(e.date);
        return d >= start && d <= end;
      });
    } else if (filter.type === "budgets") {
      // Budgets are monthly, so we filter by whether their month/year falls in range
      items = budgets.filter(b => {
        const budgetDate = new Date(b.year, b.month - 1, 1);
        return budgetDate >= start && budgetDate <= end;
      });
    } else if (filter.type === "reimbursement") {
      items = reimbursements.filter(r => {
        const d = new Date(r.createdAt);
        return d >= start && d <= end;
      });
    }
    return items;
  }, [filter, expenses, budgets, reimbursements]);

  const totalAmount = useMemo(() => {
    if (filter.type === "expenses") return reportData.reduce((acc, i) => acc + Number(i.amount || 0), 0);
    if (filter.type === "budgets") return reportData.reduce((acc, i) => acc + Number(i.allocatedAmount || 0), 0);
    if (filter.type === "reimbursement") return reportData.reduce((acc, i) => acc + Number(i.amount || 0), 0);
    return 0;
  }, [reportData, filter.type]);

  const exportPDF = () => {
    const doc = new jsPDF();
    
    // Header Branding
    try {
      doc.addImage("/image.png", "PNG", 55, 10, 100, 28);
    } catch (e) {
      console.error("Could not load logo", e);
    }

    doc.setFontSize(16);
    doc.setTextColor(79, 70, 229); // Primary Purple
    doc.setFont("helvetica", "bold");
    doc.text(`${filter.type.toUpperCase() === "REIMBURSEMENT" ? "REIMBURSEMENT" : filter.type.toUpperCase()} REPORT`, 105, 48, { align: "center" });
    
    doc.setFontSize(14);
    doc.setTextColor(30, 41, 59);
    doc.text(`${user?.name?.toUpperCase()}`, 105, 58, { align: "center" });
    
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.setFont("helvetica", "normal");
    doc.text(`Type: ${filter.type.toUpperCase()} | Period: ${filter.dateStart} to ${filter.dateEnd}`, 105, 66, { align: "center" });
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 105, 72, { align: "center" });

    // Summary Table
    autoTable(doc, {
      startY: 85,
      head: [["Metric", "Value"]],
      body: [
        ["Report Type", filter.type.charAt(0).toUpperCase() + filter.type.slice(1)],
        ["User", user?.name || "N/A"],
        ["Total Amount", `INR ${totalAmount.toLocaleString()}`],
        ["Total Records", reportData.length.toString()],
      ],
      theme: 'grid',
      headStyles: { fillColor: [79, 70, 229] },
      styles: { fontSize: 10, cellPadding: 3 }
    });

    // Detail Table
    const tableHeaders = filter.type === "expenses" 
      ? [["Date", "Category", "Vendor", "Amount", "Description"]]
      : filter.type === "budgets"
      ? [["Period", "Allocated", "Spent", "Remaining"]]
      : [["Date", "Amount", "Status", "Description"]];

    const tableData = reportData.map(item => {
      if (filter.type === "expenses") {
        return [
          new Date(item.date).toLocaleDateString(), 
          item.subDepartment?.name || item.department?.name || "General", 
          item.vendor || "N/A",
          `INR ${Number(item.amount).toLocaleString()}`, 
          item.description || "N/A"
        ];
      }
      if (filter.type === "budgets") {
        return [
          `${item.month}/${item.year}`,
          `INR ${Number(item.allocatedAmount).toLocaleString()}`, 
          `INR ${Number(item.spentAmount).toLocaleString()}`, 
          `INR ${Number(item.remainingAmount).toLocaleString()}`
        ];
      }
      return [
        new Date(item.createdAt).toLocaleDateString(), 
        `INR ${Number(item.amount).toLocaleString()}`, 
        item.isReimbursed ? "Paid" : "Pending",
        item.expense?.description || "Reimbursement Claim"
      ];
    });

    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 15,
      head: tableHeaders,
      body: tableData,
      theme: 'striped',
      headStyles: { fillColor: [59, 130, 246] },
      styles: { fontSize: 9, cellPadding: 3 }
    });

    doc.save(`${user?.name?.replace(/\s+/g, '_')}_${filter.type}_report.pdf`);
  };

  const exportCSV = () => {
    const headers = filter.type === "expenses" 
      ? "Date,Category,Vendor,Amount,Description\n"
      : filter.type === "budgets"
      ? "Period,Allocated,Spent,Remaining\n"
      : "Date,Amount,Status,Description\n";

    const rows = reportData.map(item => {
      if (filter.type === "expenses") {
        const cat = item.subDepartment?.name || item.department?.name || "General";
        return `${new Date(item.date).toLocaleDateString()},"${cat}","${item.vendor || ""}",${item.amount},"${item.description || ""}"`;
      }
      if (filter.type === "budgets") {
        return `${item.month}/${item.year},${item.allocatedAmount},${item.spentAmount},${item.remainingAmount}`;
      }
      return `${new Date(item.createdAt).toLocaleDateString()},${item.amount},${item.isReimbursed ? "Paid" : "Pending"},"${item.expense?.description || ""}"`;
    }).join("\n");

    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${user?.name?.replace(/\s+/g, '_')}_${filter.type}_report.csv`;
    a.click();
  };

  const handleConfirmExport = () => {
    if (pendingExportType === "PDF") exportPDF();
    else if (pendingExportType === "CSV") exportCSV();
    setShowExportModal(false);
  };

  const isLoading = expensesLoading || reimbursementsLoading || budgetsLoading;

  return (
    <div className="p-4 md:p-8 lg:p-12 animate-in fade-in duration-500">
      <div className="max-w-[1600px] mx-auto space-y-8">
        <PageHeader 
          title="Personal"
          highlight="Reports"
          subtitle="Generate and download your individual financial reports."
          actions={
            <div className="flex gap-4">
              <Button 
                onClick={() => {
                  setPendingExportType("PDF");
                  setShowExportModal(true);
                }} 
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-[10px] uppercase tracking-wider bg-linear-to-br from-primary-500 to-primary-700 text-white shadow-lg shadow-primary-500/25 hover:shadow-primary-500/40 hover:-translate-y-0.5 transition-all duration-300 border-none"
              >
                <FileText className="w-4 h-4" />
                PDF Export
              </Button>
              <Button 
                onClick={() => {
                  setPendingExportType("CSV");
                  setShowExportModal(true);
                }} 
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-[10px] uppercase tracking-wider bg-linear-to-br from-primary-400 to-primary-600 text-white shadow-lg shadow-primary-400/20 hover:shadow-primary-400/35 hover:-translate-y-0.5 transition-all duration-300 border-none"
              >
                <TableIcon className="w-4 h-4" />
                CSV Export
              </Button>
            </div>
          }
        />

        <Card className="border-none shadow-sm bg-white overflow-hidden">
          <div className="p-6 border-b border-border/50 flex flex-col lg:flex-row gap-6">
            <div className="flex-1 space-y-4">
              <div className="flex items-center gap-2 text-primary-600 mb-2">
                <Filter className="w-4 h-4" />
                <span className="text-[11px] font-semibold uppercase tracking-widest">Report Parameters</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                <Select 
                  label="Report Type"
                  value={filter.type}
                  onChange={e => setFilter({ ...filter, type: e.target.value })}
                  icon={FileText}
                  className="h-10 text-[10px] font-medium uppercase tracking-widest bg-slate-50/50 border-slate-200/60 focus:bg-white transition-all shadow-none"
                >
                  <option value="expenses">MY EXPENSES</option>
                  <option value="budgets">MY BUDGETS</option>
                  <option value="reimbursement">MY REIMBURSEMENTS</option>
                </Select>

                <Input 
                  label="From Date"
                  type="date"
                  className="h-10 text-[10px] font-medium uppercase tracking-widest bg-slate-50/50 border-slate-200/60 focus:bg-white transition-all shadow-none"
                  value={filter.dateStart}
                  onChange={e => setFilter({ ...filter, dateStart: e.target.value })}
                />

                <Input 
                  label="To Date"
                  type="date"
                  className="h-10 text-[10px] font-medium uppercase tracking-widest bg-slate-50/50 border-slate-200/60 focus:bg-white transition-all shadow-none"
                  value={filter.dateEnd}
                  onChange={e => setFilter({ ...filter, dateEnd: e.target.value })}
                />
              </div>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <StatCard stat={{ title: "Total Volume", value: `₹${totalAmount.toLocaleString()}`, icon: TrendingUp, colorClass: "bg-primary-500", bgClass: "bg-primary-50", subtitle: `${reportData.length} entries found in range` }} />
          <StatCard stat={{ title: "Report Status", value: "Verified", icon: PieChart, colorClass: "bg-emerald-500", bgClass: "bg-emerald-50", subtitle: "Personal records isolated" }} />
        </div>

        <Card className="border-none shadow-sm overflow-hidden bg-white">
          <div className="overflow-x-auto font-medium">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-text-secondary border-b border-border uppercase text-[10px] font-semibold tracking-widest">
                <tr>
                  {filter.type === "expenses" ? (
                    <>
                      <th className="px-6 py-4">Date</th>
                      <th className="px-6 py-4">Category</th>
                      <th className="px-6 py-4">Vendor</th>
                      <th className="px-6 py-4">Amount</th>
                      <th className="px-6 py-4">Description</th>
                    </>
                  ) : filter.type === "budgets" ? (
                    <>
                      <th className="px-6 py-4">Period</th>
                      <th className="px-6 py-4">Allocated</th>
                      <th className="px-6 py-4">Spent</th>
                      <th className="px-6 py-4">Remaining</th>
                    </>
                  ) : (
                    <>
                      <th className="px-6 py-4">Date</th>
                      <th className="px-6 py-4">Amount</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4">Description</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {isLoading ? (
                  <tr>
                    <td colSpan={10} className="px-6 py-12 text-center text-text-muted italic">
                      Loading data...
                    </td>
                  </tr>
                ) : reportData.length > 0 ? reportData.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 transition-colors">
                    {filter.type === "expenses" ? (
                      <>
                        <td className="px-6 py-4 whitespace-nowrap text-text-muted">{new Date(item.date).toLocaleDateString()}</td>
                        <td className="px-6 py-4">
                          <Badge variant="secondary" className="uppercase text-[10px] tracking-tighter">
                            {item.subDepartment?.name || item.department?.name || "General"}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 font-medium text-slate-700">{item.vendor || "N/A"}</td>
                        <td className="px-6 py-4 font-bold text-slate-900">₹{Number(item.amount).toLocaleString()}</td>
                        <td className="px-6 py-4 text-text-muted max-w-xs truncate">{item.description}</td>
                      </>
                    ) : filter.type === "budgets" ? (
                      <>
                        <td className="px-6 py-4 font-bold text-slate-900">{item.month}/{item.year}</td>
                        <td className="px-6 py-4 text-blue-600 font-semibold">₹{Number(item.allocatedAmount).toLocaleString()}</td>
                        <td className="px-6 py-4 text-rose-600 font-semibold">₹{Number(item.spentAmount).toLocaleString()}</td>
                        <td className="px-6 py-4 text-emerald-600 font-bold">₹{Number(item.remainingAmount).toLocaleString()}</td>
                      </>
                    ) : (
                      <>
                        <td className="px-6 py-4 whitespace-nowrap text-text-muted">{new Date(item.createdAt).toLocaleDateString()}</td>
                        <td className="px-6 py-4 font-bold text-slate-900">₹{Number(item.amount).toLocaleString()}</td>
                        <td className="px-6 py-4">
                          <Badge variant={item.isReimbursed ? "success" : "warning"}>
                            {item.isReimbursed ? "PAID" : "PENDING"}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 text-text-muted max-w-xs truncate">{item.expense?.description || "Reimbursement Claim"}</td>
                      </>
                    )}
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={10} className="px-6 py-12 text-center text-text-muted italic">
                      No report data found for the selected period.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
      </Card>

      <Modal 
        isOpen={showExportModal} 
        onClose={() => setShowExportModal(false)} 
        title="Confirm Export"
      >
        <div className="space-y-6 text-center">
          <div className="mx-auto w-16 h-16 rounded-full bg-primary-50 flex items-center justify-center">
            <FileText className="w-8 h-8 text-primary-600" />
          </div>
          
          <div className="space-y-2">
            <h3 className="text-lg font-bold text-slate-800 uppercase tracking-tight">
              {pendingExportType} Generation
            </h3>
            <p className="text-sm text-slate-500 font-medium">
              You are about to export your personal data:
            </p>
          </div>

          <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 text-left space-y-4">
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-400 font-medium tracking-wide uppercase text-[10px]">Report Category</span>
              <span className="text-slate-700 font-bold uppercase">{filter.type}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-400 font-medium tracking-wide uppercase text-[10px]">Date Range</span>
              <span className="text-slate-700 font-bold">{filter.dateStart} to {filter.dateEnd}</span>
            </div>
            <div className="flex justify-between items-center text-sm pt-2 border-t border-slate-200">
              <span className="text-slate-400 font-medium tracking-wide uppercase text-[10px]">Total Records</span>
              <Badge variant="secondary" className="font-bold">{reportData.length}</Badge>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-400 font-medium tracking-wide uppercase text-[10px]">Total Amount</span>
              <span className="text-primary-600 font-black">₹{totalAmount.toLocaleString()}</span>
            </div>
          </div>

          <div className="flex gap-4">
            <Button 
              variant="secondary" 
              onClick={() => setShowExportModal(false)}
              className="flex-1 rounded-xl py-6 font-bold uppercase text-[10px] tracking-widest border-slate-200"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleConfirmExport}
              className="flex-1 rounded-xl py-6 font-bold uppercase text-[10px] tracking-widest bg-primary-600 hover:bg-primary-700 shadow-lg shadow-primary-500/25 text-white"
            >
              Download {pendingExportType}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  </div>
);
};

export default UserReport;
