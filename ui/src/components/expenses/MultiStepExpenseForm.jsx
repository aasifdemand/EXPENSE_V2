import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { 
  ChevronRight, 
  ChevronLeft, 
  Check, 
  Info, 
  Tag, 
  IndianRupee, 
  Calendar,
  AlertCircle,
  Building2
} from "lucide-react";
import { useAddExpenseMutation, useUpdateExpenseMutation } from "../../store/expenseApi";
import { fetchDepartments, fetchSubDepartments } from "../../store/departmentSlice";
import { Input } from "../ui/Input";
import { Button } from "../ui/Button";
import { Badge } from "../ui/Badge";
import { Select } from "../ui/Select";
import { Card } from "../ui/Card";
import { cn } from "../../utils/utils";
import { validateStep } from "../../utils/validation";

// --- Sub-components outside to avoid re-creation ---
const Step1 = ({ formData, handleChange, errors }) => (
    <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="space-y-2.5">
        <label className="text-[11px] font-semibold uppercase tracking-wider text-text-muted ml-0.5">Reason for Expense</label>
        <Input 
          icon={Info} 
          name="description" 
          placeholder="e.g. Client lunch at Mumbai" 
          value={formData.description} 
          onChange={handleChange}
          error={errors.description}
        />
        {errors.description && <p className="text-[10px] text-red-500 ml-1 font-medium">{errors.description}</p>}
      </div>
      <div className="space-y-2.5">
        <label className="text-[11px] font-semibold uppercase tracking-wider text-text-muted ml-0.5">Expense Date</label>
        <Input 
          type="date" 
          icon={Calendar} 
          name="date" 
          value={formData.date} 
          onChange={handleChange}
          error={errors.date}
        />
        {errors.date && <p className="text-[10px] text-red-500 ml-1 font-medium">{errors.date}</p>}
      </div>
    </div>
);

const Step2 = ({ formData, handleChange, departments, subDepartments, errors }) => (
    <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="space-y-2.5">
        <label className="text-[11px] font-semibold uppercase tracking-wider text-text-muted ml-1">Department</label>
        <Select 
          name="departmentId"
          value={formData.departmentId}
          onChange={handleChange}
          icon={Building2}
          error={errors.departmentId}
        >
          <option value="">Select Department</option>
          {departments?.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
        </Select>
        {errors.departmentId && <p className="text-[10px] text-red-500 ml-1 font-medium">{errors.departmentId}</p>}
      </div>
      <div className="space-y-2.5">
        <label className="text-[11px] font-semibold uppercase tracking-wider text-text-muted ml-1">Category (Sub-dept)</label>
        <Select 
          name="subDepartmentId"
          value={formData.subDepartmentId}
          onChange={handleChange}
          disabled={!formData.departmentId}
          icon={Tag}
          error={errors.subDepartmentId}
        >
          <option value="">Select Category</option>
          {subDepartments?.map(sd => <option key={sd.id || sd._id} value={sd.id || sd._id}>{sd.name}</option>)}
        </Select>
        {errors.subDepartmentId && <p className="text-[10px] text-red-500 ml-1 font-medium">{errors.subDepartmentId}</p>}
      </div>
    </div>
);

const Step3 = ({ formData, handleChange, isAdmin, errors }) => (
    <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="space-y-2.5">
        <label className="text-[11px] font-semibold uppercase tracking-wider text-text-muted ml-0.5">Claim Amount</label>
        <Input 
          type="number" 
          icon={IndianRupee} 
          name="amount" 
          placeholder="0.00" 
          value={formData.amount} 
          onChange={handleChange}
          error={errors.amount}
        />
        {errors.amount && <p className="text-[10px] text-red-500 ml-1 font-medium">{errors.amount}</p>}
      </div>
      <div className="space-y-2.5">
        <label className="text-[11px] font-semibold uppercase tracking-wider text-text-muted ml-0.5">Payment Proof / Receipt (Optional)</label>
        <div className="relative">
          <input 
            type="file" 
            name="proof"
            onChange={handleChange}
            className="w-full h-11 rounded-lg border border-border bg-surface px-3 py-2 text-xs font-semibold uppercase tracking-wider text-text-muted outline-none focus:ring-2 focus:ring-primary-500/50 file:mr-4 file:py-1 file:px-4 file:rounded-full file:border-0 file:text-[10px] file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
          />
        </div>
      </div>
      {!isAdmin && (
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-text-secondary flex gap-3">
          <AlertCircle className="w-5 h-5 text-primary-600 shrink-0" />
          <p>If this amount exceeds your allocated monthly budget, it will be automatically flagged for reimbursement approval.</p>
        </div>
      )}
    </div>
);

const Step4 = ({ formData, departments, expenseError }) => (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="grid grid-cols-2 gap-4">
        <Card className="p-4 border border-slate-100 bg-slate-50/50 shadow-none">
          <p className="text-[10px] uppercase font-semibold text-text-muted mb-1">Total Amount</p>
          <p className="text-xl font-semibold text-primary-600">₹{Number(formData.amount).toLocaleString()}</p>
        </Card>
        <Card className="p-4 border border-slate-100 bg-slate-50/50 shadow-none">
          <p className="text-[10px] uppercase font-semibold text-text-muted mb-1">Date</p>
          <p className="text-sm font-semibold text-text-primary">{new Date(formData.date).toLocaleDateString()}</p>
        </Card>
      </div>
      <div className="space-y-3">
         <div className="flex justify-between items-center px-2">
            <span className="text-xs font-semibold text-text-secondary">Description</span>
            <span className="text-sm font-medium text-text-primary underline underline-offset-4 decoration-primary-500/20">{formData.description}</span>
         </div>
         {formData.proof && (
           <div className="flex justify-between items-center px-2 border-t border-slate-50 pt-2">
              <span className="text-xs font-semibold text-text-secondary">Proof</span>
              <Badge variant="ghost" className="text-[10px] font-semibold uppercase truncate max-w-[150px]">{formData.proof.name}</Badge>
           </div>
         )}
         <div className="flex justify-between items-center px-2 border-t border-slate-50 pt-2">
            <span className="text-xs font-semibold text-text-secondary">Department</span>
            <Badge variant="outline" className="text-[10px] font-semibold uppercase border-slate-200">
              {departments?.find(d => d.id === formData.departmentId)?.name || 'N/A'}
            </Badge>
         </div>
      </div>
      {expenseError && (
        <div className="p-3 rounded-lg bg-red-50 border border-red-100 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-500" />
          <p className="text-xs font-semibold text-red-600">{expenseError}</p>
        </div>
      )}
    </div>
);

const MultiStepExpenseForm = ({ onClose, isAdmin = false, initialData = null }) => {
  const dispatch = useDispatch();
  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    description: "",
    date: new Date().toISOString().split('T')[0],
    departmentId: "",
    subDepartmentId: "",
    amount: "",
    paymentType: "CASH",
    proof: null,
  });

  const { departments, subDepartments } = useSelector((state) => state.department);
  
  // RTK Query Mutations
  const [addExpenseTrigger, { isLoading: isAdding, error: addError }] = useAddExpenseMutation();
  const [updateExpenseTrigger, { isLoading: isUpdating, error: updateError }] = useUpdateExpenseMutation();

  const expenseLoading = isAdding || isUpdating;
  const expenseError = (addError?.data?.message || updateError?.data?.message) || null;

  useEffect(() => {
    dispatch(fetchDepartments());
    if (initialData) {
      setFormData({
        description: initialData.description || "",
        date: initialData.date ? new Date(initialData.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        departmentId: initialData.department?.id || initialData.department || "",
        subDepartmentId: initialData.subDepartment?.id || initialData.subDepartment || "",
        amount: initialData.amount || "",
        paymentType: initialData.paymentMode || "CASH",
        proof: null,
      });
    }
  }, [dispatch, initialData]);

  useEffect(() => {
    if (formData.departmentId) {
      dispatch(fetchSubDepartments(formData.departmentId));
    }
  }, [formData.departmentId, dispatch]);

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    if (type === "file") {
      setFormData(prev => ({ ...prev, [name]: files[0] }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const nextStep = () => {
    const validation = validateStep(step, formData);
    if (!validation.success) {
      setErrors(validation.errors);
      return;
    }
    setErrors({});
    setStep(prev => Math.min(prev + 1, 4));
  };
  const prevStep = () => {
    setErrors({});
    setStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    try {
      if (initialData?.id) {
        const updates = {
          description: formData.description,
          amount: Number(formData.amount),
          date: formData.date,
          department: formData.departmentId,
          subDepartment: formData.subDepartmentId,
        };
        await updateExpenseTrigger({ id: initialData.id, updates }).unwrap();
        onClose();
      } else {
        const data = new FormData();
        data.append("description", formData.description);
        data.append("amount", formData.amount);
        data.append("date", formData.date);
        data.append("department", formData.departmentId);
        data.append("subDepartment", formData.subDepartmentId);
        data.append("expenseType", isAdmin ? "ADMIN" : "USER");
        if (formData.proof) {
          data.append("proof", formData.proof);
        }
        await addExpenseTrigger(data).unwrap();
        onClose();
      }
    } catch (err) {
      // Error is handled via expenseError from mutation hook
      console.error("Mutation failed:", err);
    }
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-between mb-8 px-2">
      {[1, 2, 3, 4].map((i) => (
        <React.Fragment key={i}>
          <div className={cn(
            "w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-all duration-300",
            step >= i ? "bg-primary-600 text-white shadow-lg shadow-primary-200" : "bg-slate-100 text-slate-400"
          )}>
            {step > i ? <Check className="w-4 h-4" /> : i}
          </div>
          {i < 4 && <div className={cn("flex-1 h-1 mx-2 rounded-full transition-all duration-300", step > i ? "bg-primary-600" : "bg-slate-100")} />}
        </React.Fragment>
      ))}
    </div>
  );

  return (
    <div className="space-y-6">
      {renderStepIndicator()}
      
      <div className="min-h-[200px]">
        {step === 1 && <Step1 formData={formData} handleChange={handleChange} errors={errors} />}
        {step === 2 && <Step2 formData={formData} handleChange={handleChange} departments={departments} subDepartments={subDepartments} errors={errors} />}
        {step === 3 && <Step3 formData={formData} handleChange={handleChange} isAdmin={isAdmin} errors={errors} />}
        {step === 4 && <Step4 formData={formData} departments={departments} expenseError={expenseError} />}
      </div>

      <div className="flex items-center justify-between pt-6 border-t border-border/50">
        <Button 
          variant="ghost" 
          onClick={step === 1 ? onClose : prevStep}
          className="font-semibold uppercase tracking-wider text-xs"
        >
          {step === 1 ? 'Cancel' : 'Back'}
        </Button>
        <Button 
          onClick={step === 4 ? handleSubmit : nextStep}
          isLoading={expenseLoading}
          className="font-semibold px-8"
        >
          {step === 4 ? 'Submit Expense' : (
            <span className="flex items-center gap-2">
              Next <ChevronRight className="w-4 h-4" />
            </span>
          )}
        </Button>
      </div>
    </div>
  );
};

export default MultiStepExpenseForm;
