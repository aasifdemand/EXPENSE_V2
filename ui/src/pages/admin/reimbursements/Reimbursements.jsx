import React, { useState } from "react";
import { 
  useGetReimbursementsQuery, 
  useMarkReimbursedMutation 
} from "../../../store/reimbursementApi";
import { useGetBudgetsQuery } from "../../../store/budgetApi";
import { useLocation } from "../../../contexts/LocationContext";
import {
  Filter,
  TrendingUp,
  Clock,
  Building2,
  Coins,
} from "lucide-react";
import { StatCard } from "../../../components/ui/StatCard";
import ReimbursementTable from "../../../components/admin/ReimbursementTable";
import { Tabs, TabsList, TabsTrigger } from "../../../components/ui/Tabs";
import PageHeader from "../../../components/ui/PageHeader";

const Reimbursements = () => {
  const { currentLoc } = useLocation();
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // RTK Query fetches
  const { data: reimbData, isFetching: loading } = useGetReimbursementsQuery({
    location: currentLoc,
    status: statusFilter === "all" ? undefined : statusFilter,
    page,
    limit,
  });
  
  const { data: budgetData } = useGetBudgetsQuery({ location: currentLoc });
  const [markReimbursedTrigger] = useMarkReimbursedMutation();

  const reimbursements = reimbData?.data || [];
  const reimbStats = reimbData?.stats || {};
  const meta = reimbData?.meta || { total: 0, totalPages: 0, page: 1, limit: 10 };
  const budgetStats = budgetData?.stats || {};


  const handleMarkPaid = async (id) => {
    try {
      await markReimbursedTrigger({ id, isReimbursed: true }).unwrap();
    } catch (err) {
      console.error("Failed to mark as reimbursed:", err);
    }
  };



  const re_stats = [
    {
      title: "Total Allocated",
      value: `₹${(budgetStats?.totalAllocated || 0).toLocaleString()}`,
      icon: Building2,
      colorClass: "bg-primary-500",
      bgClass: "bg-primary-50",
      subtitle: "Total budget capacity",
    },
    {
      title: "Requested Amount",
      value: `₹${(reimbStats?.totalAmount || 0).toLocaleString()}`,
      icon: TrendingUp,
      colorClass: "bg-amber-500",
      bgClass: "bg-amber-50",
      subtitle: `${reimbStats?.totalReimbursements || 0} claims submitted`,
    },
    {
      title: "Approved / Paid",
      value: `₹${(reimbStats?.totalReimbursedAmount || 0).toLocaleString()}`,
      icon: Coins,
      colorClass: "bg-green-500",
      bgClass: "bg-green-50",
      subtitle: `${reimbStats?.totalReimbursements || 0} claims settled`,
    },
    {
      title: "Pending Dues",
      value: `₹${(reimbStats?.totalPendingAmount || 0).toLocaleString()}`,
      icon: Clock,
      colorClass: "bg-rose-500",
      bgClass: "bg-rose-50",
      subtitle: `${reimbStats?.totalPending || 0} awaiting payment`,
    },
  ];

  return (
    <div className="p-4 md:p-8 lg:p-12 animate-in fade-in duration-500">
      <div className="max-w-[1600px] mx-auto space-y-10">
        <PageHeader 
          title="Audits &"
          highlight="Reimbursements"
          subtitle="Audit and settle employee out-of-pocket expenses."
          
        />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {re_stats.map((stat, i) => (
          <StatCard key={i} stat={stat} />
        ))}
      </div>

      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-white p-4 rounded-xl border border-border/50 shadow-sm transition-all hover:shadow-md">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-primary-600" />
          <span className="text-sm font-semibold text-text-primary uppercase tracking-tight">
            Audit Insight Filters
          </span>
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

      <ReimbursementTable
        reimbursements={reimbursements}
        loading={loading}
        onMarkReimbursed={handleMarkPaid}
        page={page}
        setPage={setPage}
        limit={limit}
        setLimit={setLimit}
        meta={meta}
      />

    </div>
  </div>
);
};

export default Reimbursements;
