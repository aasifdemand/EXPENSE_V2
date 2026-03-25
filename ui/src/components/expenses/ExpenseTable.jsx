import React, { useState, useEffect } from "react";
import { 
  Search, 
  Receipt, 
  Tag, 
  Clock, 
  Calendar, 
  MoreVertical,
  CheckCircle2,
  Trash2,
  Edit2,
  Eye
} from "lucide-react";
import { useDeleteExpenseMutation } from "../../store/expenseApi";
import { Card, CardContent } from "../ui/Card";
import { Badge } from "../ui/Badge";
import { Input } from "../ui/Input";
import { Button } from "../ui/Button";
import { cn } from "../../utils/utils";
import ConfirmModal from "../ui/ConfirmModal";

const ExpenseTable = ({
  expenses,
  loading,
  meta,
  page = 1,
  setPage,
  search,
  setSearch,
  limit = 5,
  setLimit,
  showPagination = true,
  role = "user",
  onEdit, // New prop
  onView // New prop
}) => {
  const [deleteExpenseTrigger] = useDeleteExpenseMutation();
  const [activeMenuId, setActiveMenuId] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState({ show: false, id: null });

  // Close menu on click outside
  useEffect(() => {
    const handleClick = () => setActiveMenuId(null);
    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, []);

  const handleDelete = async () => {
    if (deleteConfirm.id) {
      try {
        await deleteExpenseTrigger(deleteConfirm.id).unwrap();
        setDeleteConfirm({ show: false, id: null });
      } catch (err) {
        console.error("Failed to delete expense:", err);
      }
    }
  };

  return (
    <Card className="border-none shadow-sm overflow-visible">
      <div className="p-6 border-b border-border/50 bg-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-lg font-semibold text-text-primary tracking-tight">Expense Records</h3>
          <p className="text-sm text-text-muted mt-1 font-medium">
            {meta?.total || 0} expenses logged in this period
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          {role === "superadmin" && (
                <div className="flex-1 sm:w-64">
                  <Input
                    placeholder="Search expenses..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    icon={Search}
                    className="h-9 text-[10px] font-semibold uppercase tracking-widest bg-slate-50/50 border-slate-200/60 focus:bg-white transition-all shadow-none"
                  />
                </div>
          )}
          
          {setLimit && (
            <div className="flex items-center gap-2 bg-slate-50/50 px-3 py-1.5 rounded-xl border border-slate-200/60 shadow-none h-9">
              <span className="text-[10px] font-semibold text-text-muted uppercase tracking-wider">Rows:</span>
              <select 
                value={limit}
                onChange={(e) => {
                  setLimit(Number(e.target.value));
                  setPage(1);
                }}
                className="text-[11px] font-bold text-primary-600 bg-transparent outline-none cursor-pointer"
              >
                {[5, 10, 20, 50].map(v => (
                  <option key={v} value={v}>{v}</option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      <CardContent className="p-0">
        <div className="overflow-x-auto pb-48 -mb-48">
          <table className="w-full text-sm text-left">
            <thead className="bg-surface-hover/50 text-text-secondary border-b border-border uppercase text-[11px] tracking-wider font-medium">
              <tr>
                {role === "superadmin" && <th className="px-6 py-4">User</th>}
                <th className="px-6 py-4">Description</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50 bg-white font-medium text-text-primary">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-text-muted">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-6 h-6 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
                      Loading expenses...
                    </div>
                  </td>
                </tr>
              ) : expenses?.length > 0 ? (
                expenses.map((row) => {
                  // Determine status based on reimbursement
                  const isDirect = !row.reimbursement;
                  const isSettled = isDirect || row.reimbursement?.isReimbursed;
                  const statusLabel = isSettled ? "Settled" : "Pending";
                  const statusVariant = isSettled ? "success" : "warning";
                  const categoryName = row.subDepartment?.name || row.department?.name || "General";

                  return (
                    <tr key={row.id} className="hover:bg-primary-50/30 transition-colors group">
                      {role === "superadmin" && (
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-medium text-xs transition-all">
                              {row.user?.name?.charAt(0).toUpperCase() || "U"}
                            </div>
                            <div>
                              <p className="font-medium text-text-primary tracking-tight text-[12px]">{row.user?.name}</p>
                            </div>
                          </div>
                        </td>
                      )}
                      <td className="px-6 py-4 max-w-[200px]">
                        <div className="flex items-center gap-2">
                          <Receipt className="w-4 h-4 text-text-muted shrink-0" />
                          <span className="truncate text-text-primary font-medium">{row.description || 'N/A'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-rose-600 font-medium text-base">
                          ₹{row.amount?.toLocaleString()}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-text-secondary">
                          <Tag className="w-3.5 h-3.5 text-text-muted" />
                          <Badge variant="outline" className="bg-slate-50 border-slate-200 text-slate-600 px-2.5 py-1 rounded text-[10px] font-medium uppercase tracking-tight shadow-none">
                            {categoryName}
                          </Badge>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={statusVariant} className="flex items-center gap-1.5 w-fit px-2.5 py-1 text-[10px] uppercase font-medium tracking-widest border shadow-none">
                          {isSettled ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                          {statusLabel}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-text-muted font-medium">
                          <Calendar className="w-3.5 h-3.5" />
                          <span className="text-[12px] font-medium">{row.createdAt ? new Date(row.createdAt).toLocaleDateString() : "-"}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="relative inline-block text-left">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveMenuId(activeMenuId === row.id ? null : row.id);
                            }}
                            className="p-2 rounded-lg hover:bg-slate-100 text-text-muted transition-all active:scale-95"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>

                          {activeMenuId === row.id && (
                            <div className="absolute right-0 mt-2 w-36 bg-white border border-border rounded-xl shadow-xl z-100 py-1.5 animate-in fade-in zoom-in-95 duration-200">
                              <button 
                                onClick={() => onView?.(row)}
                                className="w-full px-4 py-2 text-left text-xs font-medium text-text-primary hover:bg-slate-50 flex items-center gap-2 transition-colors"
                              >
                                <Eye className="w-3.5 h-3.5 text-slate-600" />
                                View Details
                              </button>
                              {role === "superadmin" && (
                                <>
                                  <div className="h-px bg-slate-50 my-1" />
                                  <button 
                                    onClick={() => onEdit?.(row)}
                                    className="w-full px-4 py-2 text-left text-xs font-medium text-text-primary hover:bg-primary-50 flex items-center gap-2 transition-colors"
                                  >
                                    <Edit2 className="w-3.5 h-3.5 text-primary-600" />
                                    Edit Item
                                  </button>
                                  <div className="h-px bg-slate-50 my-1" />
                                  <button 
                                    onClick={() => setDeleteConfirm({ show: true, id: row.id })}
                                    className="w-full px-4 py-2 text-left text-xs font-medium text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                    Delete Item
                                  </button>
                                </>
                              )}
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-text-muted italic">
                    No expense records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </CardContent>      {showPagination && meta?.total > 0 && (
        <div className="p-6 border-t border-border/50 bg-slate-50/30 flex flex-col lg:flex-row justify-between items-center gap-6">
          <p className="text-[11px] text-text-secondary font-semibold uppercase tracking-widest whitespace-nowrap">
            Showing <span className="text-primary-600">{(page - 1) * limit + 1}</span> to <span className="text-primary-600">{Math.min(page * limit, meta.total)}</span> of <span className="text-primary-600">{meta.total}</span>
          </p>
          
          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
              className="h-9 px-4 text-[10px] font-semibold uppercase tracking-widest bg-white border-slate-200 hover:bg-slate-50 transition-all rounded-xl disabled:opacity-40"
            >
              Prev
            </Button>
            
            <div className="flex items-center gap-1 mx-1">
              {(() => {
                const totalPages = Math.ceil(meta.total / limit);
                const pages = [];
                for (let i = 0; i < totalPages; i++) {
                  const pageNum = i + 1;
                  if (totalPages > 7) {
                    if (pageNum !== 1 && pageNum !== totalPages && (pageNum < page - 1 || pageNum > page + 1)) {
                      if (pageNum === page - 2 || pageNum === page + 2) pages.push(<span key={i} className="px-1 text-slate-400">...</span>);
                      continue;
                    }
                  }
                  pages.push(
                    <button
                      key={i}
                      onClick={() => setPage(pageNum)}
                      className={cn(
                        "w-9 h-9 rounded-xl text-[11px] font-bold transition-all duration-200",
                        page === pageNum 
                          ? "bg-primary-600 text-white shadow-lg shadow-primary-500/25 scale-105" 
                          : "text-text-secondary hover:bg-white hover:shadow-sm border border-transparent hover:border-slate-200"
                      )}
                    >
                      {pageNum}
                    </button>
                  );
                }
                return pages;
              })()}
            </div>

            <Button
              variant="outline"
              size="sm"
              disabled={page === Math.ceil(meta.total / limit)}
              onClick={() => setPage(page + 1)}
              className="h-9 px-4 text-[10px] font-semibold uppercase tracking-widest bg-white border-slate-200 hover:bg-slate-50 transition-all rounded-xl disabled:opacity-40"
            >
              Next
            </Button>
          </div>
        </div>
      )}
      <ConfirmModal 
        isOpen={deleteConfirm.show}
        onClose={() => setDeleteConfirm({ show: false, id: null })}
        onConfirm={handleDelete}
        title="Delete Expense"
        message="Are you sure you want to delete this expense? This action cannot be undone."
        confirmText="Delete"
      />
    </Card>
  );
};

export default ExpenseTable;
