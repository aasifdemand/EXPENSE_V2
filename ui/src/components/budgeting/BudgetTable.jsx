import React, { useState, useEffect } from "react";
import {
  Search,
  Building2,
  Wallet,
  TrendingUp,
  TrendingDown,
  Calendar,
  MoreVertical,
  Trash2,
  Edit2,
  Eye
} from "lucide-react";
import { useDeleteBudgetMutation } from "../../store/budgetApi";
import { Badge } from "../ui/Badge";
import { Card, CardContent } from "../ui/Card";
import { Input } from "../ui/Input";
import { Button } from "../ui/Button";
import { cn } from "../../utils/utils";
import ConfirmModal from "../ui/ConfirmModal";


const BudgetTable = ({
  budgets,
  loading,
  meta,
  page = 1,
  setPage,
  search,
  setSearch,
  limit = 10,
  setLimit,
  showPagination = true,
  role = "user",
  onEdit, // New prop
  onView // New prop
}) => {
  const [deleteBudgetTrigger] = useDeleteBudgetMutation();
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
        await deleteBudgetTrigger(deleteConfirm.id).unwrap();
        setDeleteConfirm({ show: false, id: null });
      } catch (err) {
        console.error("Delete failed:", err);
      }
    }
  };


  const getSpentPercentage = (spent, allocated) => {
    if (!allocated || allocated === 0) return 0;
    return Math.min(Math.round((spent / allocated) * 100), 100);
  };

  const getStatusColor = (percentage) => {
    if (percentage <= 70) return "success";
    if (percentage <= 90) return "warning";
    return "destructive";
  };

  const getStatusText = (percentage) => {
    if (percentage <= 70) return "Under Budget";
    if (percentage <= 90) return "Approaching Limit";
    return "Over Budget";
  };

  return (
    <Card className="border-none shadow-sm overflow-visible">
      <div className="p-6 border-b border-border/50 bg-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-lg font-semibold text-text-primary">Budget Overview</h3>
          <p className="text-sm text-text-muted mt-1 font-medium">
            {meta?.total || 0} total budgets found
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          {role === "superadmin" && (
            <div className="flex-1 sm:w-64">
              <Input
                placeholder="Search budgets..."
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
                <th className="px-6 py-4">Allocated</th>
                <th className="px-6 py-4">Spent</th>
                <th className="px-6 py-4">Remaining</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Company</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50 bg-white text-text-primary font-medium">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-text-muted">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-6 h-6 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
                      Loading budgets...
                    </div>
                  </td>
                </tr>
              ) : budgets?.length > 0 ? (
                budgets.map((row) => {
                  const spentPercentage = getSpentPercentage(row.spentAmount, row.allocatedAmount);
                  return (
                    <tr key={row.id} className="hover:bg-primary-50/30 transition-colors group">
                      {role === "superadmin" && (
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center font-medium text-xs transition-all">
                              {row.user?.name?.charAt(0).toUpperCase() || "U"}
                            </div>
                            <div>
                              <p className="font-medium text-text-primary tracking-tight">{row.user?.name}</p>
                              <p className="text-[11px] text-text-muted font-medium">{row.user?.email}</p>
                            </div>
                          </div>
                        </td>
                      )}
                      <td className="px-6 py-4 font-medium text-green-600">
                        <div className="flex items-center gap-2">
                          <TrendingUp className="w-3.5 h-3.5" />
                          ₹{row.allocatedAmount?.toLocaleString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 font-medium text-rose-600">
                        <div className="flex items-center gap-2">
                          <TrendingDown className="w-3.5 h-3.5" />
                          ₹{row.spentAmount?.toLocaleString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 font-medium text-primary-600">
                        <div className="flex items-center gap-2">
                          <Wallet className="w-3.5 h-3.5" />
                          ₹{row.remainingAmount?.toLocaleString()}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={getStatusColor(spentPercentage)} className="text-[10px] uppercase font-medium tracking-widest py-1 px-3 rounded-md border shadow-none">
                          {getStatusText(spentPercentage)}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-text-secondary font-medium">
                          <Building2 className="w-3.5 h-3.5 text-text-muted" />
                          {row.company}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-text-muted font-medium">
                          <Calendar className="w-3.5 h-3.5" />
                          {row.createdAt ? new Date(row.createdAt).toLocaleDateString() : "-"}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                      <div className="relative inline-block text-left">
                        <Button
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveMenuId(activeMenuId === row.id ? null : row.id);
                          }}
                          className="p-2 h-9 w-9 rounded-lg hover:bg-slate-100 text-text-muted transition-all"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </Button>

                        {activeMenuId === row.id && (
                          <Card className="absolute right-0 mt-2 w-42 shadow-xl z-100 py-1.5 animate-in fade-in zoom-in-95 duration-200 border border-border/50 p-0 overflow-hidden">
                            <Button
                              variant="ghost"
                              onClick={() => onView?.(row)}
                              className="w-full px-4 py-2.5 text-left text-xs font-medium text-text-primary hover:bg-slate-50 flex items-center justify-start gap-2 transition-colors rounded-none"
                            >
                              <Eye className="w-3.5 h-3.5 text-slate-600" />
                              View Details
                            </Button>
                            
                            {role === "superadmin" && (
                              <>
                                <div className="h-px bg-slate-50 my-1" />
                                <Button
                                  variant="ghost"
                                  onClick={() => onEdit?.(row)}
                                  className="w-full px-4 py-2.5 text-left text-xs font-medium text-text-primary hover:bg-primary-50 hover:text-primary-600 flex items-center justify-start gap-2 transition-colors rounded-none"
                                >
                                  <Edit2 className="w-3.5 h-3.5 text-primary-600" />
                                  Edit Item
                                </Button>
                                <div className="h-px bg-slate-50 my-1" />
                                <Button
                                  variant="ghost"
                                  onClick={() => setDeleteConfirm({ show: true, id: row.id })}
                                  className="w-full px-4 py-2.5 text-left text-xs font-medium text-red-600 hover:bg-red-50 hover:text-red-700 flex items-center justify-start gap-2 transition-colors rounded-none"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                  Delete Item
                                </Button>
                              </>
                            )}
                          </Card>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-text-muted italic font-medium">
                    No budgets found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </CardContent>

      {showPagination && meta?.total > 0 && (
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
        title="Delete Budget"
        message="Are you sure you want to delete this budget? This action cannot be undone."
        confirmText="Delete"
      />
    </Card>
  );
};

export default BudgetTable;
