import { 
  Hourglass, 
  CheckCircle2,
} from "lucide-react";
import { Badge } from "../ui/Badge";
import { Card, CardContent } from "../ui/Card";
import { Button } from "../ui/Button";
import { cn } from "../../utils/utils";


const ReimbursementTable = ({
  reimbursements,
  loading,
  onMarkReimbursed,
  page = 1,
  setPage,
  limit = 10,
  setLimit,
  meta
}) => {
  return (
    <Card className="border-none shadow-sm overflow-hidden bg-white">
      <div className="p-6 border-b border-border/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-lg font-semibold text-text-primary tracking-tight">Pending Approval</h3>
          <p className="text-sm text-text-muted mt-1 font-medium">{meta?.total || 0} claims awaiting review</p>
        </div>
        
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

      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-surface-hover/50 text-text-secondary border-b border-border uppercase text-[11px] tracking-wider font-semibold">
              <tr>
                <th className="px-6 py-4">Employee</th>
                <th className="px-6 py-4">Claim Amount</th>
                <th className="px-6 py-4">From Budget</th>
                <th className="px-6 py-4">Date</th>
             
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50 font-medium text-text-primary">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-text-muted">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-6 h-6 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
                      Fetching claims...
                    </div>
                  </td>
                </tr>
              ) : reimbursements?.length > 0 ? (
                reimbursements.map((row) => (
                  <tr key={row.id} className="hover:bg-primary-50/20 transition-colors group">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-semibold text-slate-600 text-[13px]">
                          {row.requestedBy?.name?.charAt(0).toUpperCase() || "U"}
                        </div>
                        <div>
                          <p className="font-semibold text-text-primary text-[14px] leading-tight">{row.requestedBy?.name}</p>
                          <p className="text-[11px] text-text-muted mt-0.5 font-medium">{row.requestedBy?.userLoc}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex flex-col">
                        <span className="font-semibold text-rose-600 text-[15px]">₹{Number(row.expense?.fromReimbursement || 0).toLocaleString()}</span>
                        <span className="text-[10px] text-text-muted uppercase font-semibold tracking-tighter">Total: ₹{Number(row.expense?.amount || 0).toLocaleString()}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className="text-blue-600 font-semibold">₹{Number(row.expense?.fromAllocation || 0).toLocaleString()}</span>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="text-text-primary text-[13px] font-semibold">{row.createdAt ? new Date(row.createdAt).toLocaleDateString() : '-'}</span>
                        <span className="text-[10px] text-text-muted font-medium">{row.createdAt ? new Date(row.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}</span>
                      </div>
                    </td>
                   
                    <td className="px-6 py-5 text-right">
                      {!row.isReimbursed && (
                        <Button 
                          onClick={() => onMarkReimbursed(row.id)}
                          className="px-4 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider"
                        >
                          Approve Payment
                        </Button>
                      )}
                      {row.isReimbursed && (
                        <Badge variant="success" className="px-4 py-1.5 rounded-lg text-[10px] font-semibold uppercase tracking-widest border-none flex items-center gap-1.5 w-fit ml-auto">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Settled / Paid
                        </Badge>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-text-muted italic">
                    All clear! No pending reimbursements.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </CardContent>

      {meta && meta.total > 0 && (
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
                const totalPages = meta.totalPages;
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
              disabled={page === meta.totalPages}
              onClick={() => setPage(page + 1)}
              className="h-9 px-4 text-[10px] font-semibold uppercase tracking-widest bg-white border-slate-200 hover:bg-slate-50 transition-all rounded-xl disabled:opacity-40"
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
};

export default ReimbursementTable;
