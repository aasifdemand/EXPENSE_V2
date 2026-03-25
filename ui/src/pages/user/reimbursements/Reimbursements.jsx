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

  const getAmount = (item) => Number(item?.expense?.fromReimbursement || item?.amount || 0);

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
                  <th className="px-6 py-5">Request Date</th>
                  <th className="px-6 py-5">Amount</th>
                  <th className="px-6 py-5">Description</th>
                  <th className="px-6 py-5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-slate-400 italic">Loading claims...</td>
                  </tr>
                ) : userReimbursements.length > 0 ? userReimbursements.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-600">
                      {new Date(item.createdAt || item.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-900">₹{getAmount(item).toLocaleString()}</td>
                    <td className="px-6 py-4 text-slate-500">{item.description || "N/A"}</td>
                    <td className="px-6 py-4">
                      <Badge variant={item.isReimbursed ? "success" : "warning"} className="font-semibold text-[10px]">
                        {item.isReimbursed ? "PAID" : "PENDING"}
                      </Badge>
                    </td>
                  </tr>
                )) : (

                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-slate-400 italic">No reimbursement requests found.</td>
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
