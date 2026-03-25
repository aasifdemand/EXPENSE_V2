import React, { useState } from "react";
import { useSelector } from "react-redux";
import { useGetReimbursementsQuery } from "../../../store/reimbursementApi";
import { Clock, TrendingUp, CheckCircle2, Filter } from "lucide-react";
import { StatCard } from "../../../components/ui/StatCard";
import { Card } from "../../../components/ui/Card";
import { Badge } from "../../../components/ui/Badge";
import { Tabs, TabsList, TabsTrigger } from "../../../components/ui/Tabs";
import PageHeader from "../../../components/ui/PageHeader";
import { Button } from "../../../components/ui/Button";
import { cn } from "../../../utils/utils";

const UserReimbursements = () => {
  const { user } = useSelector((state) => state.auth);
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // RTK Query fetches
  const { data: reimbData, isFetching: loading } = useGetReimbursementsQuery({
    userId: user?.id,
    status: statusFilter === "all" ? undefined : statusFilter,
    page,
    limit,
  }, { skip: !user?.id });

  const userReimbursements = reimbData?.data || [];
  const pagination = reimbData?.pagination || { totalItems: 0, totalPages: 0, currentPage: 1, itemsPerPage: 10 };
  const reimbStats = reimbData?.stats || {};

  

  const stats = [
    {
      title: "Total Claims",
      value: `₹${(reimbStats?.totalAmount || 0).toLocaleString()}`,
      icon: TrendingUp,
      colorClass: "bg-primary-500",
      bgClass: "bg-primary-50",
      subtitle: `${reimbStats?.totalReimbursements || 0} total requests`
    },
    {
      title: "Pending Approval",
      value: `₹${(reimbStats?.totalPendingAmount || 0).toLocaleString()}`,
      icon: Clock,
      colorClass: "bg-amber-500",
      bgClass: "bg-amber-50",
      subtitle: `${reimbStats?.totalPending || 0} claims pending`
    },
    {
      title: "Paid Back",
      value: `₹${(reimbStats?.totalReimbursedAmount || 0).toLocaleString()}`,
      icon: CheckCircle2,
      colorClass: "bg-green-500",
      bgClass: "bg-green-50",
      subtitle: `${reimbStats?.totalReimbursed || 0} claims settled`
    }
  ];


  return (
    <div className="p-4 md:p-6 lg:p-8 animate-in fade-in duration-500">
      <div className="max-w-[1600px] mx-auto space-y-8">
        <PageHeader 
          title="My"
          highlight="Reimbursements"
          subtitle="Track your out-of-pocket expense claims and reimbursement status."
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stats.map((stat, i) => (
            <StatCard key={i} stat={stat} />
          ))}
        </div>

        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm transition-all hover:shadow-md">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-primary-600" />
            <span className="text-sm font-semibold text-slate-800 uppercase tracking-tight">Claim Filters</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-slate-50/50 px-3 py-1.5 rounded-xl border border-slate-200/60 shadow-none h-9">
              <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Rows:</span>
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
            <Tabs defaultValue="all" value={statusFilter} onValueChange={setStatusFilter} className="w-full lg:w-auto">
              <TabsList className="bg-slate-100/80 p-1 rounded-xl w-full lg:w-auto">
                {["all", "pending", "reimbursed"].map((s) => (
                  <TabsTrigger
                    key={s}
                    value={s}
                    className="px-6 py-2 text-[10px] font-semibold uppercase tracking-widest rounded-lg data-[state=active]:bg-white data-[state=active]:text-primary-600 data-[state=active]:shadow-sm transition-all"
                  >
                    {s}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>
        </div>

        <Card className="border-none shadow-sm overflow-visible bg-white">
          <div className="overflow-x-auto pb-48 -mb-48">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-500 border-b border-slate-100 uppercase text-[10px] font-semibold tracking-widest">
                <tr>
                  <th className="px-6 py-5">Date & Time</th>
                  <th className="px-6 py-5">Claim Amount</th>
                  <th className="px-6 py-5">Budget coverage</th>
                  <th className="px-6 py-5">Info & Context</th>
                  <th className="px-6 py-5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-slate-400 italic">
                       <div className="flex flex-col items-center gap-3">
                        <div className="w-6 h-6 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
                        Loading claims...
                      </div>
                    </td>
                  </tr>
                ) : userReimbursements.length > 0 ? userReimbursements.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-semibold text-slate-700 text-[13px]">
                          {new Date(item.createdAt || item.date).toLocaleDateString()}
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium">
                          {new Date(item.createdAt || item.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-rose-600 text-[14px]">
                          ₹{Number(item.expense?.fromReimbursement || item.amount || 0).toLocaleString()}
                        </span>
                        <span className="text-[10px] text-slate-400 uppercase font-semibold tracking-tighter">
                          Total: ₹{Number(item.expense?.amount || item.amount || 0).toLocaleString()}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-blue-600 font-semibold text-[13px]">
                        ₹{Number(item.expense?.fromAllocation || 0).toLocaleString()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                       <div className="flex flex-col">
                        <span className="font-semibold text-slate-700 text-[13px] line-clamp-1">
                          {item.expense?.description || item.description || "No description provided"}
                        </span>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-medium">
                            {item.expense?.department?.name || "General"}
                          </span>
                          {item.expense?.vendor && (
                            <span className="text-[10px] text-slate-400 italic">
                              at {item.expense.vendor}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge 
                        variant={item.isReimbursed ? "success" : "warning"} 
                        className={cn(
                          "font-bold text-[10px] px-3 py-1 rounded-lg border-none flex items-center gap-1.5 w-fit",
                          item.isReimbursed ? "bg-green-50 text-green-600" : "bg-amber-50 text-amber-600"
                        )}
                      >
                        {item.isReimbursed ? (
                          <>
                            <CheckCircle2 className="w-3 h-3" />
                            PAID
                          </>
                        ) : (
                          <>
                            <Clock className="w-3 h-3" />
                            PENDING
                          </>
                        )}
                      </Badge>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-slate-400 italic">No reimbursement requests found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {pagination && pagination.totalItems > 0 && (
          <div className="p-6 bg-slate-50/30 flex flex-col lg:flex-row justify-between items-center gap-6 rounded-b-2xl border border-slate-200 border-t-0 -mt-2">
            <p className="text-[11px] text-slate-500 font-semibold uppercase tracking-widest whitespace-nowrap">
              Showing <span className="text-primary-600">{(page - 1) * limit + 1}</span> to <span className="text-primary-600">{Math.min(page * limit, pagination.totalItems)}</span> of <span className="text-primary-600">{pagination.totalItems}</span>
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
                  const totalPages = pagination.totalPages;
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
                            : "text-slate-500 hover:bg-white hover:shadow-sm border border-transparent hover:border-slate-200"
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
                disabled={page === pagination.totalPages}
                onClick={() => setPage(page + 1)}
                className="h-9 px-4 text-[10px] font-semibold uppercase tracking-widest bg-white border-slate-200 hover:bg-slate-50 transition-all rounded-xl disabled:opacity-40"
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserReimbursements;
