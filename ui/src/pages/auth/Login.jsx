import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, Lock, Eye, EyeOff, LogIn } from "lucide-react";
import { 
  useLoginMutation, 
  useLazyGetCsrfTokenQuery 
} from "../../store/authApi";

import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/Card";
import { loginSchema } from "../../utils/validation";

const Login = () => {
  const navigate = useNavigate();
  const [loginTrigger, { isLoading }] = useLoginMutation();
  const [getCsrfTrigger] = useLazyGetCsrfTokenQuery();

  const [formData, setFormData] = useState({
    name: "",
    password: "",
    rememberMe: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [loginError, setLoginError] = useState("");

  const handleChange = (e) => {
    const { name, value, checked, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    if (errors[name]) setErrors({ ...errors, [name]: "" });
    if (loginError) setLoginError("");
  };

  const validate = () => {
    const result = loginSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors = {};
      result.error.issues.forEach((issue) => {
        fieldErrors[issue.path[0]] = issue.message;
      });
      setErrors(fieldErrors);
      return false;
    }
    setErrors({});
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    
    try {
      const deviceName = navigator.userAgent.split(" ")[0];
      const result = await loginTrigger({
        name: formData.name,
        password: formData.password,
        deviceName,
      }).unwrap();
      
      // Fetch CSRF after login
      await getCsrfTrigger().unwrap();
      
      if (result?.user?.twoFactorPending) navigate("/qr");
      else if (result.user.role === "superadmin") navigate("/admin/dashboard");
      else navigate("/user/dashboard");
    } catch (err) {
      setLoginError(err.data?.message || "Login failed. Please try again.");
    }
  };


  return (
    <Card className="w-full max-w-md relative z-10 shadow-[0_20px_50px_rgba(124,58,237,0.12)] border-border/40 bg-surface/98 backdrop-blur-2xl rounded-2xl overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-linear-to-r from-primary-400 via-primary-600 to-primary-800" />
      
      <CardHeader className="text-center pt-10 pb-6">
        <div className="mx-auto mb-6 bg-white/80 backdrop-blur-md max-w-fit rounded-2xl p-3 border border-primary-100 shadow-sm transition-transform hover:scale-105 duration-300">
          <img
            src="/image.png"
            alt="Logo"
            className="h-10 w-auto object-contain"
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
        </div>
        <CardTitle className="text-3xl font-semibold tracking-tight text-slate-800 mb-1">
          Expense <span className="text-primary-600 font-semibold">Tracker</span>
        </CardTitle>
        <p className="text-sm font-medium text-slate-500">
          Welcome back! Please enter your details.
        </p>
      </CardHeader>

      <CardContent className="px-8 pb-10">
        {loginError && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm font-medium flex items-center gap-3 animate-shake">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            {loginError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[13px] font-medium text-slate-600 ml-1 uppercase tracking-widest">
              Username
            </label>
            <Input
              name="name"
              placeholder="e.g. john_doe"
              value={formData.name}
              onChange={handleChange}
              icon={User}
              error={errors.name}
              className="bg-slate-50/50 border-slate-200 focus:bg-white focus:ring-2 focus:ring-primary-500/20 transition-all duration-200 py-6"
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center ml-1">
              <label className="text-[13px] font-medium text-slate-600 uppercase tracking-widest">
                Password
              </label>
            </div>
            <div className="relative group">
              <Input
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                icon={Lock}
                error={errors.password}
                className="bg-slate-50/50 border-slate-200 focus:bg-white focus:ring-2 focus:ring-primary-500/20 transition-all duration-200 pr-12 py-6"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary-600 transition-colors focus:outline-none"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between py-2">
            <label className="flex items-center gap-3 text-sm font-medium text-slate-600 cursor-pointer group">
              <div className="relative flex items-center justify-center">
                <input
                  type="checkbox"
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleChange}
                  className="peer appearance-none w-5 h-5 border-2 border-slate-200 rounded-md checked:bg-primary-600 checked:border-primary-600 transition-all duration-200 cursor-pointer"
                />
                <div className="absolute text-white opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none">
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 20 20"><path d="M0 11l2-2 5 5L18 3l2 2L7 18z"/></svg>
                </div>
              </div>
              <span className="group-hover:text-slate-900 transition-colors">Remember me</span>
            </label>
            
          </div>

          <Button
            type="submit"
            className="w-full text-base font-semibold py-7 rounded-xl shadow-lg shadow-primary-500/20 hover:shadow-primary-500/30 hover:-translate-y-0.5 transition-all duration-300 relative overflow-hidden group"
            isLoading={isLoading}
          >
            {!isLoading && (
              <div className="flex items-center justify-center gap-2">
                <span>Sign In</span>
                <LogIn className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </div>
            )}
            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
          </Button>

        </form>
      </CardContent>
    </Card>
  );


};

export default Login;
