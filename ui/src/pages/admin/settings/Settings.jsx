import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { updateUserProfile, fetchUser } from "../../../store/authSlice";
import { 
  User, 
  Mail, 
  Phone as PhoneIcon,
  CheckCircle2 as VerifiedIcon,
  Lock,
  Smartphone,
  AlertCircle,
  Copy,
  ChevronRight,
  ShieldCheck,
  Server
} from "lucide-react";
import { Button } from "../../../components/ui/Button";
import { Card, CardContent } from "../../../components/ui/Card";
import { Input } from "../../../components/ui/Input";
import { Badge } from "../../../components/ui/Badge";
import { cn } from "../../../utils/utils";
import { motion, AnimatePresence } from "framer-motion";
import PageHeader from "../../../components/ui/PageHeader";
import { 
  useGenerate2faSecretMutation, 
  useEnable2faMutation, 
  useDisable2faMutation 
} from "../../../store/authApi";
import { useToastMessage } from "../../../hooks/useToast";

const Settings = () => {
  const dispatch = useDispatch();
  const { user, updateProfileLoading } = useSelector((state) => state.auth);
  const { success, error } = useToastMessage();
  const [isEditing, setIsEditing] = useState(false);

  // 2FA Flow State
  const [is2faModalOpen, setIs2faModalOpen] = useState(false);
  const [twoFactorStep, setTwoFactorStep] = useState("idle");
  const [qrCodeData, setQrCodeData] = useState(null);
  const [otpToken, setOtpToken] = useState("");

  const [generate2fa] = useGenerate2faSecretMutation();
  const [enable2fa] = useEnable2faMutation();
  const [disable2fa] = useDisable2faMutation();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
      });
    }
  }, [user]);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      await dispatch(updateUserProfile({ ...formData, userId: user.id })).unwrap();
      setIsEditing(false);
      success("Admin profile updated");
      dispatch(fetchUser());
    } catch (err) {
      error("Failed to update admin profile");
    }
  };

  const handleToggle2FA = async () => {
    if (user?.twoFactorEnabled) {
      setTwoFactorStep("disable");
      setIs2faModalOpen(true);
    } else {
      try {
        const res = await generate2fa().unwrap();
        setQrCodeData(res.qr);
        setTwoFactorStep("qr");
        setIs2faModalOpen(true);
      } catch (err) {
        error("Failed to initiate 2FA setup");
      }
    }
  };

  const handleConfirmEnable = async () => {
    if (otpToken.length !== 6) return error("Please enter a 6-digit code");
    try {
      await enable2fa(otpToken).unwrap();
      success("2FA enabled successfully");
      setIs2faModalOpen(false);
      setOtpToken("");
      dispatch(fetchUser());
    } catch (err) {
      error(err?.data?.message || "Invalid OTP code");
    }
  };

  const handleConfirmDisable = async () => {
    if (otpToken.length !== 6) return error("Please enter a 6-digit code");
    try {
      await disable2fa(otpToken).unwrap();
      success("2FA disabled successfully");
      setIs2faModalOpen(false);
      setOtpToken("");
      dispatch(fetchUser());
    } catch (err) {
      error(err?.data?.message || "Invalid OTP code");
    }
  };

  const getInitials = (name) => {
    if (!name) return "AD";
    return name.split(" ").map(n => n[0]).join("").toUpperCase();
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 md:px-8 space-y-8 animate-in fade-in duration-500">
      <PageHeader 
        title="Administrative"
        highlight="Settings"
        subtitle="Manage your administrative credentials and security layer."
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Summary Panel */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="rounded-[20px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-white border-0 overflow-hidden">
            <div className="h-24 bg-linear-to-r from-primary-600 to-indigo-600" />
            <CardContent className="px-6 pb-8 -mt-12 text-center">
              <div className="inline-flex relative">
                <div className="w-24 h-24 rounded-full bg-white p-1.5 shadow-xl">
                  <div className="w-full h-full rounded-full bg-linear-to-br from-primary-500 to-indigo-600 flex items-center justify-center text-white text-3xl font-bold border-4 border-white">
                    {getInitials(user?.name)}
                  </div>
                </div>
                <div className="absolute bottom-1 right-1 bg-emerald-500 text-white p-1.5 rounded-full border-2 border-white">
                  <ShieldCheck className="w-3.5 h-3.5" />
                </div>
              </div>
              
              <h3 className="mt-4 text-xl font-bold text-slate-900">{user?.name}</h3>
              <p className="text-slate-500 text-sm font-medium mb-4">{user?.email}</p>
              
              <Badge className="bg-primary-600 text-white border-0 px-4 py-1.5 rounded-full font-bold text-[10px] tracking-widest uppercase self-center">
                System Administrator
              </Badge>

              <div className="mt-8 pt-8 border-t border-slate-100 space-y-4 text-left">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500 font-medium">System Role</span>
                  <span className="text-slate-900 font-bold">SuperAdmin</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500 font-medium">Instance</span>
                  <span className="text-slate-900 font-bold flex items-center gap-1.5">
                    <Server className="w-3.5 h-3.5 text-blue-500" /> Production
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-[20px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-white border-0 p-6">
             <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Security Overview</h4>
             <div className="space-y-4">
                <div className="flex items-center gap-3 text-sm">
                  <div className={cn("p-1.5 rounded-full", user?.twoFactorEnabled ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600")}>
                    {user?.twoFactorEnabled ? <VerifiedIcon className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                  </div>
                  <span className="font-semibold text-slate-700">
                    {user?.twoFactorEnabled ? "Access is Multi-Factor Secured" : "Single Factor Access Enabled"}
                  </span>
                </div>
             </div>
          </Card>
        </div>

        {/* Right: Detailed Panels */}
        <div className="lg:col-span-8 space-y-8">
          <Card className="rounded-[20px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-white border-0">
            <CardContent className="p-8">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <User className="w-5 h-5 text-primary-500" />
                  Admin Profile
                </h3>
                {!isEditing && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setIsEditing(true)}
                    className="rounded-full px-5 border-slate-200 text-slate-600 font-bold hover:bg-slate-50"
                  >
                    Modify Credentials
                  </Button>
                )}
              </div>

              <AnimatePresence mode="wait">
                {isEditing ? (
                  <motion.form 
                    key="edit-form"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    onSubmit={handleSaveProfile} 
                    className="grid grid-cols-1 md:grid-cols-2 gap-6"
                  >
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 ml-1 uppercase">Display Name</label>
                      <Input 
                        value={formData.name}
                        onChange={e => setFormData({...formData, name: e.target.value})}
                        className="h-12 rounded-xl bg-slate-50 border-0 focus:ring-2 focus:ring-primary-500/20 font-medium"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 ml-1 uppercase">Admin Phone</label>
                      <Input 
                        value={formData.phone}
                        onChange={e => setFormData({...formData, phone: e.target.value})}
                        className="h-12 rounded-xl bg-slate-50 border-0 focus:ring-2 focus:ring-primary-500/20 font-medium"
                      />
                    </div>
                    <div className="md:col-span-2 pt-4 flex gap-3">
                       <Button type="submit" size="lg" className="rounded-xl px-8 bg-slate-900 hover:bg-slate-800 text-white shadow-lg">
                          Update Administrative Identity
                       </Button>
                       <Button type="button" variant="ghost" onClick={() => setIsEditing(false)} className="rounded-xl px-8 font-bold text-slate-500">
                          Discard
                       </Button>
                    </div>
                  </motion.form>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-slate-50 rounded-2xl text-slate-400">
                        <Mail className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Root Email</p>
                        <p className="text-slate-900 font-bold">{user?.email}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-slate-50 rounded-2xl text-slate-400">
                        <PhoneIcon className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Emergency Contact</p>
                        <p className="text-slate-900 font-bold">{user?.phone || "Registry Private"}</p>
                      </div>
                    </div>
                  </div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>

          <Card className="rounded-[20px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-white border-0">
            <CardContent className="p-8">
              <h4 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-8">
                <Lock className="w-5 h-5 text-indigo-500" />
                Root Security Controls
              </h4>

              <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between p-6 rounded-2xl bg-slate-50/50 border border-slate-100 gap-4">
                   <div className="flex items-center gap-4">
                      <div className={cn(
                        "p-4 rounded-2xl shadow-sm",
                        user?.twoFactorEnabled ? "bg-emerald-500 text-white" : "bg-white text-slate-400 border border-slate-200"
                      )}>
                        <Smartphone className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900">MFA via Authenticator</h4>
                        <p className="text-xs text-slate-500 font-medium">Secondary verification for administrative login.</p>
                      </div>
                   </div>
                   <div className="flex items-center gap-4">
                      <Badge variant="secondary" className={cn(
                        "rounded-full px-4 py-1.5 font-bold text-[10px] border-0",
                        user?.twoFactorEnabled ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-500"
                      )}>
                        {user?.twoFactorEnabled ? "SYSTEM ENFORCED" : "DEACTIVATED"}
                      </Badge>
                      <div 
                        onClick={handleToggle2FA}
                        className={cn(
                          "w-12 h-6 rounded-full relative cursor-pointer transition-all duration-300",
                          user?.twoFactorEnabled ? "bg-primary-600" : "bg-slate-300"
                        )}
                      >
                         <motion.div 
                           animate={{ x: user?.twoFactorEnabled ? 24 : 2 }}
                           className="w-[20px] h-[20px] bg-white rounded-full absolute top-[2px] shadow-sm"
                         />
                      </div>
                   </div>
                </div>

                <div className="flex items-center justify-between p-6 rounded-2xl bg-white border border-slate-100 group hover:border-primary-200 transition-all cursor-pointer">
                   <div className="flex items-center gap-4">
                      <div className="p-4 bg-slate-50 rounded-2xl text-slate-400 group-hover:bg-primary-50 group-hover:text-primary-500 transition-all">
                        <Lock className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900">Change Root Password</h4>
                        <p className="text-xs text-slate-500 font-medium">Update the primary administrative key.</p>
                      </div>
                   </div>
                   <ChevronRight className="w-5 h-5 text-slate-300" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* 2FA Workflow Modal */}
      <AnimatePresence>
        {is2faModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
             <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               onClick={() => setIs2faModalOpen(false)}
               className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
             />
             <motion.div 
               initial={{ opacity: 0, scale: 0.9, y: 20 }}
               animate={{ opacity: 1, scale: 1, y: 0 }}
               exit={{ opacity: 0, scale: 0.9, y: 20 }}
               className="relative w-full max-w-md bg-white rounded-[32px] shadow-2xl overflow-hidden p-8"
             >
                <div className="text-center space-y-4">
                   <div className="w-16 h-16 bg-primary-50 rounded-3xl flex items-center justify-center mx-auto text-primary-600">
                      {twoFactorStep === "disable" ? <AlertCircle className="w-8 h-8" /> : <Smartphone className="w-8 h-8" />}
                   </div>
                   <h3 className="text-xl font-bold text-slate-900">
                      {twoFactorStep === "qr" ? "MFA Configuration" : 
                       twoFactorStep === "disable" ? "Security Modification" : "Identity Check"}
                   </h3>
                   <p className="text-slate-500 text-[11px] font-medium px-4 leading-relaxed">
                      {twoFactorStep === "qr" ? "Scan the vault key with your supervisor's authenticator app." : 
                       twoFactorStep === "disable" ? "Administrative confirmation required to lower security level." : 
                       "Confirm root access with your mobile token."}
                   </p>
                </div>

                <div className="mt-8 space-y-6">
                   {twoFactorStep === "qr" && qrCodeData && (
                     <div className="flex flex-col items-center">
                        <div className="p-3 bg-white border-4 border-slate-50 rounded-2xl shadow-inner mb-4">
                           <img src={qrCodeData} alt="QR Code" className="w-48 h-48" />
                        </div>
                        <Button variant="link" size="sm" className="text-xs font-bold text-primary-600 flex items-center gap-1.5 hover:no-underline">
                           <Copy className="w-3.5 h-3.5" /> Registry Key
                        </Button>
                     </div>
                   )}

                   <div className="space-y-4">
                      <Input 
                        type="text"
                        maxLength={6}
                        placeholder="000 000"
                        value={otpToken}
                        onChange={e => setOtpToken(e.target.value.replace(/[^0-9]/g, ""))}
                        className="h-14 rounded-2xl bg-slate-50 border-0 text-center text-xl font-bold tracking-[0.4em] focus:ring-4 focus:ring-primary-500/10 placeholder:text-slate-300"
                      />
                      
                      <Button 
                        onClick={twoFactorStep === "disable" ? handleConfirmDisable : handleConfirmEnable}
                        className="w-full h-14 rounded-2xl bg-primary-600 hover:bg-primary-700 text-white font-bold text-base shadow-lg shadow-primary-500/20 transition-all active:scale-[0.98]"
                      >
                         {twoFactorStep === "disable" ? "Remove MFA Enforcer" : "Secure Root Access"}
                      </Button>
                      
                      <Button 
                        variant="ghost" 
                        onClick={() => setIs2faModalOpen(false)}
                        className="w-full h-12 rounded-2xl font-bold text-slate-500 hover:bg-slate-100"
                      >
                         Cancel Protocol
                      </Button>
                   </div>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Settings;
