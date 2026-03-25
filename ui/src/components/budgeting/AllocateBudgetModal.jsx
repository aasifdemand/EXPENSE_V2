import  { useState, useEffect, useMemo } from "react";
import { IndianRupee, Building2, AlertCircle, Users } from "lucide-react";
import { 
  useAllocateBudgetMutation, 
  useUpdateBudgetMutation 
} from "../../store/budgetApi";
import { useGetUsersQuery } from "../../store/authApi";
import { Input } from "../ui/Input";
import { Button } from "../ui/Button";
import { Badge } from "../ui/Badge";
import { Card } from "../ui/Card";
import { Select } from "../ui/Select";
import { budgetSchema } from "../../utils/validation";

const AllocateBudgetModal = ({ onClose, initialData = null }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    userId: "",
    userName: "",
    amount: "",
    company: "Demand Curve marketing",
  });

  // RTK Query hooks
  const { data: userData } = useGetUsersQuery({ limit: 1000 });
  const users = useMemo(() => userData?.users || [], [userData]);
  
  const [allocateBudgetTrigger, { isLoading: isAllocating, error: allocateError }] = useAllocateBudgetMutation();
  const [updateBudgetTrigger, { isLoading: isUpdating, error: updateError }] = useUpdateBudgetMutation();

  const isLoading = isAllocating || isUpdating;
  const apiError = allocateError || updateError;

  useEffect(() => {
    if (initialData) {
      setFormData({
        userId: initialData.user?.id || initialData.userId || "",
        userName: initialData.user?.name || "",
        amount: initialData.amount || initialData.allocatedAmount || "",
        company: initialData.company || "Demand Curve marketing",
      });
      setSearchTerm(initialData.user?.name || "");
    }
  }, [initialData]);

  const filteredUsers = useMemo(() => {
    if (!searchTerm) return users || [];
    return users?.filter(u => 
      u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];
  }, [users, searchTerm]);

  const handleSelectUser = (user) => {
    setFormData(prev => ({ ...prev, userId: user.id || user._id, userName: user.name }));
    setSearchTerm(user.name);
    setShowUserDropdown(false);
    if (errors.userId) setErrors(prev => ({ ...prev, userId: null }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = budgetSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors = {};
      result.error.issues.forEach((issue) => {
        fieldErrors[issue.path[0]] = issue.message;
      });
      setErrors(fieldErrors);
      return;
    }

    try {
      setErrors({});
      if (initialData?.id) {
        await updateBudgetTrigger({
          id: initialData.id,
          updates: {
            userId: formData.userId,
            amount: Number(formData.amount),
            company: formData.company
          }
        }).unwrap();
        onClose();
      } else {
        await allocateBudgetTrigger({
          userId: formData.userId,
          amount: Number(formData.amount),
          company: formData.company
        }).unwrap();
        onClose();
      }
    } catch (err) {
      console.error("Budget operation failed:", err);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 animate-in fade-in zoom-in-95 duration-200">
      {/* User Selection */}
      <div className="space-y-1.5 relative">
        <label className="text-[11px] font-semibold uppercase tracking-wider text-text-muted ml-1">Select User</label>
        <div className="relative">
          <Input 
            icon={Users} 
            placeholder="Search by name or email..." 
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setShowUserDropdown(true);
            }}
            onFocus={() => setShowUserDropdown(true)}
            error={errors.userId}
          />
          {errors.userId && <p className="text-[10px] text-red-500 font-medium ml-1 mt-1">{errors.userId}</p>}
          {showUserDropdown && (
            <Card className="absolute z-50 w-full mt-2 border border-border shadow-2xl max-h-48 overflow-y-auto ring-1 ring-black/5 animate-in fade-in slide-in-from-top-2 duration-200 p-0">
              {filteredUsers.length > 0 ? (
                filteredUsers.map(user => (
                  <div 
                    key={user.id || user._id}
                    onClick={() => handleSelectUser(user)}
                    className="px-4 py-2.5 hover:bg-primary-50 cursor-pointer border-b border-slate-50 last:border-none flex items-center justify-between group transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-semibold text-slate-500 uppercase group-hover:bg-primary-100 group-hover:text-primary-600 transition-all">
                        {user.name?.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-text-primary group-hover:text-primary-600 transition-colors leading-none">{user.name}</p>
                        <p className="text-[10px] font-medium text-text-muted mt-1">{user.email}</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-[9px] uppercase font-semibold px-1.5 border-slate-200 bg-slate-50 text-slate-500">{user.role}</Badge>
                  </div>
                ))
              ) : (
                <div className="px-4 py-8 text-center">
                  <p className="text-xs font-medium text-text-muted italic">No users found matching your search.</p>
                </div>
              )}
            </Card>
          )}
        </div>
      </div>

      {/* Amount & Company */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-[11px] font-semibold uppercase tracking-wider text-text-muted ml-1">Allocation Amount</label>
          <Input 
            type="number" 
            icon={IndianRupee} 
            name="amount" 
            placeholder="0.00" 
            value={formData.amount} 
            onChange={handleChange}
            error={errors.amount}
            required
          />
          {errors.amount && <p className="text-[10px] text-red-500 font-medium ml-1 mt-1">{errors.amount}</p>}
        </div>
        <div className="space-y-1.5">
          <label className="text-[11px] font-semibold uppercase tracking-wider text-text-muted ml-1">COMPANY</label>
          <Select 
            name="company" 
            value={formData.company} 
            onChange={handleChange}
            icon={Building2}
          >
            <option value="Demand Curve marketing">Demand Curve marketing</option>
            <option value="Stack.io">Stack.io</option>
          </Select>
        </div>
      </div>

      {apiError && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-100 flex gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
          <p className="text-xs font-semibold text-red-600 leading-tight">
            {apiError?.data?.message || "Operation failed"}
          </p>
        </div>
      )}

      <div className="pt-6 border-t border-border/50 flex gap-3">
        <Button 
          type="button" 
          variant="ghost" 
          onClick={onClose}
          className="flex-1 font-semibold uppercase text-xs"
        >
          Cancel
        </Button>
        <Button 
          type="submit" 
          isLoading={isLoading}
          className="flex-2 font-semibold"
          disabled={!formData.userId || !formData.amount}
        >
          Confirm Allocation
        </Button>
      </div>
    </form>
  );

};

export default AllocateBudgetModal;
