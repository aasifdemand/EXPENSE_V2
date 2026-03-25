import React, { useState } from "react";

import { 
  useGetUsersQuery,
  useCreateUserMutation,
  useResetPasswordMutation
} from "../../../store/authApi";
import { 
  Users as UsersIcon, 
  UserPlus, 
  ShieldCheck, 
  Activity,
  Eye,
  EyeOff
} from "lucide-react";
import { Button } from "../../../components/ui/Button";
import { StatCard } from "../../../components/ui/StatCard";
import UserTable from "../../../components/admin/UserTable";
import Modal from "../../../components/ui/Modal";
import { Input } from "../../../components/ui/Input";
import PageHeader from "../../../components/ui/PageHeader";
import { userSchema, resetPasswordSchema } from "../../../utils/validation";

const UserManagement = () => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  
  // RTK Query hooks
  const { data: userData, isFetching: loading } = useGetUsersQuery({ page, limit });
  const [createUserTrigger] = useCreateUserMutation();
  const [resetPasswordTrigger] = useResetPasswordMutation();

  const users = userData?.users || [];
  const meta = userData?.meta || { total: 0, page, limit };
  
  const [searchTerm, setSearchTerm] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [resetPasswordData, setResetPasswordData] = useState({ isOpen: false, userId: null, userName: "", password: "", confirmPassword: "" });
  const [errors, setErrors] = useState({});
  const [passwordErrors, setPasswordErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [newUser, setNewUser] = useState({ name: "", email: "", password: "", department: "GENERAL", role: "user" });

  const departments = [
    { value: "GENERAL", label: "General" },
    { value: "HR", label: "HR" },
    { value: "IT", label: "IT" },
    { value: "DATA", label: "Data" },
    { value: "SALES", label: "Sales" },
  ];

  const userStats = [
    { 
      title: "Total Users", 
      value: meta?.total || users?.length || 0, 
      icon: UsersIcon, 
      colorClass: "bg-blue-500", 
      subtitle: "Active directory" 
    },
    { 
      title: "Active Recently", 
      value: users?.filter(u => {
        const lastActive = new Date(u.updatedAt || u.createdAt);
        const now = new Date();
        return (now - lastActive) < 24 * 60 * 60 * 1000;
      }).length || 0, 
      icon: Activity, 
      colorClass: "bg-green-500", 
      subtitle: "Last 24 hours" 
    },
    { 
      title: "HR Admins", 
      value: users?.filter(u => u.department === "HR").length || 0, 
      icon: ShieldCheck, 
      colorClass: "bg-purple-500", 
      subtitle: "Privileged access" 
    },
  ];

  const filteredUsers = users?.filter((u) => {
    const matchesSearch = u.name?.toLowerCase().includes(searchTerm.toLowerCase()) || u.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = departmentFilter === "all" || u.department === departmentFilter;
    return matchesSearch && matchesDept;
  });

  const handleAddUser = async (e) => {
    e.preventDefault();
    const result = userSchema.safeParse(newUser);
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
      await createUserTrigger(newUser).unwrap();
      setIsAddModalOpen(false);
      setNewUser({ name: "", email: "", password: "", department: "GENERAL", role: "user" });
    } catch (err) {
      console.error("Create user failed:", err);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    const result = resetPasswordSchema.safeParse(resetPasswordData);
    if (!result.success) {
      const fieldErrors = {};
      result.error.issues.forEach((issue) => {
        fieldErrors[issue.path[0]] = issue.message;
      });
      setPasswordErrors(fieldErrors);
      return;
    }

    try {
      setPasswordErrors({});
      await resetPasswordTrigger({ 
        userId: resetPasswordData.userId, 
        password: resetPasswordData.password 
      }).unwrap();
      setResetPasswordData({ isOpen: false, userId: null, userName: "", password: "", confirmPassword: "" });
    } catch (err) {
      console.error("Reset password failed:", err);
    }
  };


  return (
    <div className="p-4 md:p-8 space-y-10 animate-in fade-in duration-500">
      <PageHeader
        title="User"
        highlight="Management"
        subtitle="Configure user accounts and access policies."
        actions={
          <Button 
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-6 py-2.5 rounded-lg shadow-sm font-semibold"
          >
            <UserPlus className="w-4 h-4" />
            Add New User
          </Button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {userStats.map((stat, i) => <StatCard key={i} stat={stat} />)}
      </div>

      <UserTable 
        users={filteredUsers}
        loading={loading}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        departmentFilter={departmentFilter}
        setDepartmentFilter={setDepartmentFilter}
        departments={departments}
        onResetPassword={(id, name) => setResetPasswordData({ ...resetPasswordData, isOpen: true, userId: id, userName: name })}
        page={page}
        setPage={setPage}
        limit={limit}
        setLimit={setLimit}
        meta={meta}
      />

      {/* Add User Modal */}
      <Modal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        title="Add New Account"
        className="max-w-md"
      >
        <form onSubmit={handleAddUser} className="space-y-4">
          <Input 
            label="Full Name" 
            placeholder="John Doe" 
            value={newUser.name} 
            onChange={e => {
              setNewUser({ ...newUser, name: e.target.value });
              if (errors.name) setErrors(prev => ({ ...prev, name: null }));
            }} 
            error={errors.name}
            required 
          />
          {errors.name && <p className="text-[10px] text-red-500 font-medium -mt-3 ml-1">{errors.name}</p>}
          <Input 
            label="Email Address" 
            placeholder="john@example.com" 
            type="email" 
            value={newUser.email} 
            onChange={e => {
              setNewUser({ ...newUser, email: e.target.value });
              if (errors.email) setErrors(prev => ({ ...prev, email: null }));
            }} 
            error={errors.email}
            required 
          />
          {errors.email && <p className="text-[10px] text-red-500 font-medium -mt-3 ml-1">{errors.email}</p>}
          <Input 
            label="Initial Password" 
            type={showPassword ? "text" : "password"} 
            value={newUser.password} 
            onChange={e => {
              setNewUser({ ...newUser, password: e.target.value });
              if (errors.password) setErrors(prev => ({ ...prev, password: null }));
            }}
            error={errors.password}
            required 
            rightIcon={
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-text-muted hover:text-text-primary p-1"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            }
          />
          {errors.password && <p className="text-[10px] text-red-500 font-medium -mt-3 ml-1">{errors.password}</p>}
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-text-secondary uppercase tracking-tight">Department</label>
            <select 
              className="w-full p-2.5 bg-background border border-border rounded-lg text-sm font-medium focus:ring-2 focus:ring-primary-500/20"
              value={newUser.department}
              onChange={e => setNewUser({ ...newUser, department: e.target.value })}
            >
              {departments.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
            </select>
          </div>
          <div className="pt-4">
            <Button type="submit" className="w-full py-3 rounded-xl font-semibold shadow-md">Create User Access</Button>
          </div>
        </form>
      </Modal>

      {/* Reset Password Modal */}
      <Modal 
        isOpen={resetPasswordData.isOpen} 
        onClose={() => setResetPasswordData({ ...resetPasswordData, isOpen: false })} 
        title={`Reset Password: ${resetPasswordData.userName}`}
      >
        <form onSubmit={handleResetPassword} className="space-y-4">
          <Input 
            label="New Password" 
            type={showNewPassword ? "text" : "password"} 
            value={resetPasswordData.password} 
            onChange={e => {
              setResetPasswordData({ ...resetPasswordData, password: e.target.value });
              if (passwordErrors.password) setPasswordErrors(prev => ({ ...prev, password: null }));
            }} 
            error={passwordErrors.password}
            required 
            placeholder="••••••••"
            rightIcon={
              <button 
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="text-text-muted hover:text-text-primary p-1"
              >
                {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            }
          />
          {passwordErrors.password && <p className="text-[10px] text-red-500 font-medium -mt-3 ml-1">{passwordErrors.password}</p>}
          <Input 
            label="Confirm Password" 
            type={showConfirmPassword ? "text" : "password"} 
            value={resetPasswordData.confirmPassword} 
            onChange={e => {
              setResetPasswordData({ ...resetPasswordData, confirmPassword: e.target.value });
              if (passwordErrors.confirmPassword) setPasswordErrors(prev => ({ ...prev, confirmPassword: null }));
            }} 
            error={passwordErrors.confirmPassword}
            required 
            placeholder="••••••••"
            rightIcon={
              <button 
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="text-text-muted hover:text-text-primary p-1"
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            }
          />
          {passwordErrors.confirmPassword && <p className="text-[10px] text-red-500 font-medium -mt-3 ml-1">{passwordErrors.confirmPassword}</p>}
          <div className="pt-4">
            <Button type="submit" className="w-full py-3 rounded-xl font-semibold shadow-md shadow-primary-500/10">Update Password</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default UserManagement;
