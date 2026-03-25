import React, { useState, useMemo } from "react";
import { 
  Filter, 
  TrendingUp, 
  PieChart, 
  FileText,
  Table as TableIcon,
  Calendar
} from "lucide-react";
import { Button } from "../../../components/ui/Button";
import { Card } from "../../../components/ui/Card";
import { StatCard } from "../../../components/ui/StatCard";
import { Badge } from "../../../components/ui/Badge";
import { Input } from "../../../components/ui/Input";
import { Select } from "../../../components/ui/Select";
import { Building2, X } from "lucide-react";
import { useLocation } from "../../../contexts/LocationContext";
import PageHeader from "../../../components/ui/PageHeader";
import Modal from "../../../components/ui/Modal";
import { useGetBudgetsQuery } from "../../../store/budgetApi";
import { useGetExpensesQuery } from "../../../store/expenseApi";
import { useGetReimbursementsQuery } from "../../../store/reimbursementApi";
import { useGetDepartmentsQuery } from "../../../store/departmentApi";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const Report = () => {
  const { currentLoc } = useLocation();
  
  // RTK Query fetches
  const { data: budgetData } = useGetBudgetsQuery({ location: currentLoc, limit: 1000 });
  const { data: expenseData } = useGetExpensesQuery({ location: currentLoc, limit: 1000 });
  const { data: reimbursementData } = useGetReimbursementsQuery({ location: currentLoc, limit: 1000 });
  const { data: departments = [] } = useGetDepartmentsQuery();

  const budgets = useMemo(() => budgetData?.data || [], [budgetData]);
  const expenses = useMemo(() => expenseData?.data || [], [expenseData]);
  const reimbursements = useMemo(() => reimbursementData?.data || [], [reimbursementData]);

  const [filter, setFilter] = useState({
    type: "expenses",
    department: "all",
    dateStart: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    dateEnd: new Date().toISOString().split('T')[0]
  });

  const [showExportModal, setShowExportModal] = useState(false);
  const [pendingExportType, setPendingExportType] = useState(null);


  const reportData = useMemo(() => {
    let items = [];
    if (filter.type === "expenses") {
      items = expenses.filter(e => {
        const d = new Date(e.date);
        const start = new Date(filter.dateStart);
        const end = new Date(filter.dateEnd);
        const matchDept = filter.department === "all" || e.department === filter.department;
        return d >= start && d <= end && matchDept;
      });
    } else if (filter.type === "budgets") {
      items = budgets.filter(b => {
        const matchDept = filter.department === "all" || b.user === filter.department; // assuming user field maps to dept for budget
        return matchDept;
      });
    } else if (filter.type === "reimbursement") {
      items = reimbursements.filter(r => {
        const d = new Date(r.createdAt);
        const start = new Date(filter.dateStart);
        const end = new Date(filter.dateEnd);
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
    doc.setFont(undefined, "bold");
    doc.text(`${filter.type.toUpperCase()} REPORT`, 105, 48, { align: "center" });
    
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.setFont(undefined, "normal");
    doc.text(`Location: ${currentLoc} | Period: ${filter.dateStart} to ${filter.dateEnd}`, 105, 56, { align: "center" });
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 105, 62, { align: "center" });

    // Dataset Summary Section
    doc.setFontSize(12);
    doc.setTextColor(30, 41, 59);
    doc.setFont(undefined, "bold");
    doc.text("Dataset Summary", 14, 75);

    autoTable(doc, {
      startY: 80,
      head: [["Metric", "Value"]],
      body: [
        ["Report Type", filter.type.charAt(0).toUpperCase() + filter.type.slice(1)],
        ["Status", "Audit Ready"],
        ["Total Volume", `INR ${totalAmount.toLocaleString()}`],
        ["Records Count", reportData.length.toString()],
      ],
      theme: 'grid',
      headStyles: { fillColor: [79, 70, 229] }, // Indigo primary
      styles: { fontSize: 9 }
    });

    // Main Data Section
    doc.setFontSize(12);
    doc.setFont(undefined, "bold");
    doc.text("Detailed Records", 14, doc.lastAutoTable.finalY + 15);

    const tableHeaders = filter.type === "expenses" 
      ? [["Date", "Category", "Amount", "Description", "User"]]
      : filter.type === "budgets"
      ? [["User/Dept", "Allocated", "Spent", "Remaining", "Month/Year"]]
      : [["Date", "Requester", "Amount", "Status"]];

    const tableData = reportData.map(item => {
      if (filter.type === "expenses") {
        return [
          new Date(item.date).toLocaleDateString(), 
          item.subDepartment?.name || item.department?.name || "N/A", 
          `INR ${item.amount}`, 
          item.description || "N/A", 
          item.user?.name || item.user || "N/A"
        ];
      }
      if (filter.type === "budgets") {
        return [
          item.user?.name || item.user || "N/A", 
          `INR ${item.allocatedAmount}`, 
          `INR ${item.spentAmount}`, 
          `INR ${item.remainingAmount}`, 
          `${item.month}/${item.year}`
        ];
      }
      return [
        new Date(item.createdAt).toLocaleDateString(), 
        item.requestedBy?.name || "N/A", 
        `INR ${item.amount}`, 
        item.isReimbursed ? "Paid" : "Pending"
      ];
    });

    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 20,
      head: tableHeaders,
      body: tableData,
      theme: 'striped',
      headStyles: { fillColor: [59, 130, 246] },
      styles: { fontSize: 8 }
    });

    // Footer
    const pageCount = doc.internal.getNumberOfPages();
    for(let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184);
      doc.text(`Page ${i} of ${pageCount}`, 105, 285, { align: "center" });
    }

    doc.save(`${filter.type}-report-${new Date().getTime()}.pdf`);
  };

  const exportCSV = () => {
    const headers = filter.type === "expenses" 
      ? "Date,Category,Vendor,Amount,Description,User\n"
      : filter.type === "budgets"
      ? "User/Dept,Allocated,Spent,Remaining,Month/Year\n"
      : "Date,Requester,Amount,Status\n";

    const rows = reportData.map(item => {
      if (filter.type === "expenses") {
        const cat = item.subDepartment?.name || item.department?.name || "N/A";
        const usr = item.user?.name || item.user || "N/A";
        return `${new Date(item.date).toLocaleDateString()},"${cat}","${item.vendor || ""}",${item.amount},"${item.description || ""}",${usr}`;
      }
      if (filter.type === "budgets") {
        const usr = item.user?.name || item.user || "N/A";
        return `${usr},${item.allocatedAmount},${item.spentAmount},${item.remainingAmount},${item.month}/${item.year}`;
      }
      return `${new Date(item.createdAt).toLocaleDateString()},${item.requestedBy?.name || "N/A"},${item.amount},${item.isReimbursed ? "Paid" : "Pending"}`;
    }).join("\n");

    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filter.type}-report.csv`;
    a.click();
  };

  const handleConfirmExport = () => {
    if (pendingExportType === "PDF") exportPDF();
    else if (pendingExportType === "CSV") exportCSV();
    setShowExportModal(false);
  };

  return (
    <div className="p-4 md:p-8 lg:p-12 animate-in fade-in duration-500">
      <div className="max-w-[1600px] mx-auto space-y-8">
        <PageHeader 
          title="Audit &"
          highlight="Reports"
          subtitle="Unified analytics and detailed auditing for financial oversight."
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <Select 
                label="Report Type"
                value={filter.type}
                onChange={e => setFilter({ ...filter, type: e.target.value })}
                icon={FileText}
                className="h-10 text-[10px] font-medium uppercase tracking-widest bg-slate-50/50 border-slate-200/60 focus:bg-white transition-all shadow-none"
              >
                <option value="expenses">EXPENSE ANALYSIS</option>
                <option value="budgets">BUDGET ALLOCATION</option>
                <option value="reimbursement">REIMBURSEMENT AUDIT</option>
              </Select>

              <Select 
                label="Department"
                value={filter.department}
                onChange={e => setFilter({ ...filter, department: e.target.value })}
                icon={Building2}
                className="h-10 text-[10px] font-medium uppercase tracking-widest bg-slate-50/50 border-slate-200/60 focus:bg-white transition-all shadow-none"
              >
                <option value="all">ALL DEPARTMENTS</option>
                {departments.map(d => <option key={d.id} value={d.name}>{d.name?.toUpperCase()}</option>)}
              </Select>

              <Input 
                label="Start Date"
                type="date"
                className="h-10 text-[10px] font-medium uppercase tracking-widest bg-slate-50/50 border-slate-200/60 focus:bg-white transition-all shadow-none"
                value={filter.dateStart}
                onChange={e => setFilter({ ...filter, dateStart: e.target.value })}
              />

              <Input 
                label="End Date"
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
        <StatCard stat={{ title: "Total Volume", value: `₹${totalAmount.toLocaleString()}`, icon: TrendingUp, colorClass: "bg-primary-500", bgClass: "bg-primary-50", subtitle: `${reportData.length} records matched filters` }} />
        <StatCard stat={{ title: "Report Status", value: "Audit Ready", icon: PieChart, colorClass: "bg-green-500", bgClass: "bg-green-50", subtitle: "Data is synchronized with ledger" }} />
      </div>

      <Card className="border-none shadow-sm overflow-hidden bg-white">
        <div className="overflow-x-auto font-medium">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-text-secondary border-b border-border uppercase text-[10px] font-semibold tracking-widest">
              <tr>
                {filter.type === "expenses" ? (
                  <>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4">Department</th>
                    <th className="px-6 py-4">Description</th>
                    <th className="px-6 py-4">Amount</th>
                    <th className="px-6 py-4">User</th>
                  </>
                ) : filter.type === "budgets" ? (
                  <>
                    <th className="px-6 py-4">Dept/User</th>
                    <th className="px-6 py-4">Allocated</th>
                    <th className="px-6 py-4">Spent</th>
                    <th className="px-6 py-4">Remaining</th>
                    <th className="px-6 py-4">Period</th>
                  </>
                ) : (
                  <>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4">Requester</th>
                    <th className="px-6 py-4">Amount</th>
                    <th className="px-6 py-4">Status</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {reportData.length > 0 ? reportData.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-50 transition-colors">
                  {filter.type === "expenses" ? (
                    <>
                      <td className="px-6 py-4 whitespace-nowrap text-text-muted">{new Date(item.date).toLocaleDateString()}</td>
                      <td className="px-6 py-4 text-primary-600 font-medium uppercase text-[11px]">{item.subDepartment?.name || item.department?.name || "General"}</td>
                      <td className="px-6 py-4 truncate max-w-xs">{item.description}</td>
                      <td className="px-6 py-4 font-medium">₹{item.amount?.toLocaleString()}</td>
                      <td className="px-6 py-4 text-text-secondary">{item.user?.name || item.user || "N/A"}</td>
                    </>
                  ) : filter.type === "budgets" ? (
                    <>
                      <td className="px-6 py-4 font-medium">{item.user?.name || item.user || "N/A"}</td>
                      <td className="px-6 py-4 text-blue-600 font-medium">₹{item.allocatedAmount?.toLocaleString()}</td>
                      <td className="px-6 py-4 text-rose-600 font-medium">₹{item.spentAmount?.toLocaleString()}</td>
                      <td className="px-6 py-4 text-green-600 font-medium">₹{item.remainingAmount?.toLocaleString()}</td>
                      <td className="px-6 py-4 italic">{item.month}/{item.year}</td>
                    </>
                  ) : (
                    <>
                      <td className="px-6 py-4">{new Date(item.createdAt).toLocaleDateString()}</td>
                      <td className="px-6 py-4 font-medium">{item.requestedBy?.name}</td>
                      <td className="px-6 py-4 font-medium">₹{item.amount.toLocaleString()}</td>
                      <td className="px-6 py-4">
                        <Badge variant={item.isReimbursed ? "success" : "warning"}>
                          {item.isReimbursed ? "PAID" : "PENDING"}
                        </Badge>
                      </td>
                    </>
                  )}
                </tr>
              )) : (
                <tr>
                  <td colSpan={10} className="px-6 py-12 text-center text-text-muted italic">
                    No data matching selected filters.
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
              You are about to export the following data:
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

export default Report;
