import { 
  Mail, 
  Shield, 
  Building2, 
  Calendar, 
  Key, 
  Search
} from "lucide-react";
import { Badge } from "../ui/Badge";
import { Card, CardContent } from "../ui/Card";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Select } from "../ui/Select";
import { cn } from "../../utils/utils";

const UserTable = ({
  users,
  loading,
  searchTerm,
  setSearchTerm,
  departmentFilter,
  setDepartmentFilter,
  departments,
  onResetPassword,
  page = 1,
  setPage,
  limit = 10,
  setLimit,
  meta
}) => {
  return (
    <Card className="border-none shadow-sm overflow-hidden">
      <div className="p-6 border-b border-border/50 bg-white flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h3 className="text-lg font-semibold text-text-primary">User Directory</h3>
          <p className="text-sm text-text-muted mt-1">
            {users?.length || 0} active team members
          </p>
        </div>

        <div className="flex flex-row items-center gap-3 w-full lg:w-auto">
          <div className="w-[65%] lg:w-64">
            <Input
              placeholder="SEARCH NAME OR EMAIL..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              icon={Search}
              className="h-9 text-[10px] font-semibold uppercase tracking-widest bg-slate-50/50 border-slate-200/60 focus:bg-white transition-all shadow-none"
            />
          </div>
          
          <div className="w-[35%] lg:w-48">
            <Select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="h-9 text-[10px] font-semibold uppercase tracking-widest w-full bg-slate-50/50 border-slate-200/60 focus:bg-white transition-all shadow-none py-0 flex items-center"
            >
              <option value="all">ALL DEPARTMENTS</option>
              {departments.map((dept) => (
                <option key={dept.value} value={dept.value}>{dept.label?.toUpperCase()}</option>
              ))}
            </Select>
          </div>
        </div>
      </div>

      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-surface-hover/50 text-text-secondary border-b border-border uppercase text-[11px] tracking-wider font-semibold">
              <tr>
                <th className="px-6 py-4">Employee</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Department</th>
                <th className="px-6 py-4">Last Active</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50 bg-white font-medium">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-text-muted">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-6 h-6 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
                      Loading directory...
                    </div>
                  </td>
                </tr>
              ) : users?.length > 0 ? (
                users.map((row) => (
                  <tr key={row.id} className="hover:bg-primary-50/20 transition-colors group">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary-600 text-white flex items-center justify-center font-semibold text-sm shadow-sm ring-2 ring-white">
                          {row.name?.charAt(0).toUpperCase() || "U"}
                        </div>
                        <div>
                          <p className="font-semibold text-text-primary text-[14px] tracking-tight">{row.name}</p>
                          <div className="flex items-center gap-1.5 text-[11px] text-text-muted mt-0.5">
                            <Mail className="w-3 h-3" />
                            {row.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2">
                        <Shield className={cn(
                          "w-3.5 h-3.5",
                          row.role === 'superadmin' ? "text-amber-500" : "text-blue-500"
                        )} />
                        <span className="capitalize font-semibold text-text-secondary text-[12px]">{row.role || 'User'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-text-muted" />
                        <Badge variant="outline" className="text-[10px] font-semibold uppercase tracking-tight bg-slate-50 border-slate-200">
                          {row.department || 'General'}
                        </Badge>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-start gap-2.5">
                        <div className="mt-0.5 p-1 rounded-md bg-slate-50 border border-slate-100/60">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[13px] font-semibold text-slate-700 tracking-tight">
                            {row.updatedAt || row.createdAt
                              ? new Date(row.updatedAt || row.createdAt).toLocaleDateString()
                              : 'Never'}
                          </span>
                          <span className="text-[10px] font-semibold text-primary-600/70 uppercase tracking-widest mt-0.5">
                            {row.updatedAt || row.createdAt
                              ? new Date(row.updatedAt || row.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })
                              : ''}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          onClick={() => onResetPassword(row.id, row.name)}
                          className="p-1.5 h-8 w-8 rounded-lg text-primary-600 hover:bg-primary-50 shadow-sm border border-primary-100"
                          title="Reset Password"
                        >
                          <Key className="w-4 h-4" />
                        </Button>
                        
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-text-muted">
                    No matching users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </CardContent>

      {meta && meta.total > 0 && (
        <div className="p-6 border-t border-border/50 bg-slate-50/30 flex flex-col lg:flex-row justify-between items-center gap-6">
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto">
            <p className="text-[11px] text-text-secondary font-semibold uppercase tracking-widest whitespace-nowrap">
              Showing <span className="text-primary-600">{(page - 1) * limit + 1}</span> to <span className="text-primary-600">{Math.min(page * limit, meta.total)}</span> of <span className="text-primary-600">{meta.total}</span>
            </p>
            
            <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-border/60 shadow-sm">
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
          </div>
          
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
              {[...Array(meta.totalPages)].map((_, i) => {
                const pageNum = i + 1;
                // Basic logic to show limited pages if many
                if (meta.totalPages > 7) {
                  if (pageNum !== 1 && pageNum !== meta.totalPages && (pageNum < page - 1 || pageNum > page + 1)) {
                    if (pageNum === page - 2 || pageNum === page + 2) return <span key={i} className="px-1 text-slate-400">...</span>;
                    return null;
                  }
                }
                
                return (
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
              })}
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

export default UserTable;
