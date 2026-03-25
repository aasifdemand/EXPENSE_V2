import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { updateUserProfile, fetchUser } from "../../../store/authSlice";
import { 
  User, 
  Mail, 
  Phone as PhoneIcon, 
  Shield, 
  Calendar as CalendarIcon, 
  CheckCircle2 as VerifiedIcon, 
  Edit as EditIcon,
  Save as SaveIcon,
  X as CancelIcon,
  Badge as BadgeIcon,
  AtSign
} from "lucide-react";
import { Button } from "../../../components/ui/Button";
import { Card, CardContent } from "../../../components/ui/Card";
import { Input } from "../../../components/ui/Input";
import { Badge } from "../../../components/ui/Badge";
import { cn } from "../../../utils/utils";
import { motion,AnimatePresence } from "framer-motion";
import PageHeader from "../../../components/ui/PageHeader";

const Settings = () => {
  const dispatch = useDispatch();
  const { user, updateProfileLoading } = useSelector((state) => state.auth);
  const [isEditing, setIsEditing] = useState(false);

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

  const handleSave = async (e) => {
    e.preventDefault();
    const res = await dispatch(updateUserProfile({ ...formData, userId: user.id || user._id }));
    if (updateUserProfile.fulfilled.match(res)) {
      setIsEditing(false);
      dispatch(fetchUser());
    }
  };

  const getInitials = (name) => {
    if (!name) return "👤";
    return name.split(" ").map(n => n[0]).join("").toUpperCase();
  };

  const getFormattedDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] py-8 px-4 md:px-8 space-y-8 animate-in fade-in duration-500">
      <PageHeader 
        title="Account"
        highlight="Settings"
        subtitle="Manage your account preferences and profile information."
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        {/* Left Column: Profile Overview */}
        <div className="lg:col-span-5 flex flex-col h-full">
          <Card className="rounded-[16px] border border-slate-200/80 bg-white shadow-[0_4px_20px_rgba(0,0,0,0.05)] h-full overflow-hidden flex flex-col">
            <CardContent className="p-10 flex flex-col items-center flex-1">
              <div className="relative mb-6">
                <div className="w-28 h-28 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 text-white border-4 border-white shadow-[0_4px_20px_rgba(124,58,237,0.3)] flex items-center justify-center text-4xl font-semibold">
                  {getInitials(user?.name)}
                </div>
              </div>

              <h2 className="text-2xl font-semibold text-[#1e293b] text-center mb-2">
                {user?.name || "User Name"}
              </h2>

              <Badge variant="outline" className="mb-6 font-semibold flex items-center gap-1.5 px-3 py-1 bg-slate-50 border-slate-200 text-slate-600">
                <BadgeIcon className="w-3.5 h-3.5" />
                {user?.role === "superadmin" ? "Super Admin" : "User"}
              </Badge>

              {!isEditing && (
                <Button 
                  onClick={() => setIsEditing(true)}
                  className="w-full bg-gradient-to-r from-primary-500 to-primary-700 text-white rounded-[12px] py-6 shadow-[0_4px_15px_rgba(124,58,237,0.3)] hover:shadow-[0_6px_20px_rgba(124,58,237,0.4)] transition-all font-semibold"
                >
                  <EditIcon className="w-4 h-4 mr-2" />
                  Edit Profile
                </Button>
              )}

              <div className="w-full border-t border-slate-100 my-8"></div>

              {/* Info Items */}
              <div className="w-full space-y-4">
                <div className="flex items-center gap-4 p-4 rounded-[12px] bg-[#f8fafc] border border-[#e2e8f0] hover:bg-[#f1f5f9] hover:border-[#cbd5e0] transition-all duration-200 cursor-default">
                  <VerifiedIcon className="w-5 h-5 text-[#10b981]" />
                  <div>
                    <p className="text-[10px] text-[#64748b] uppercase font-semibold tracking-wider leading-none mb-1">Account Status</p>
                    <p className="text-sm font-semibold text-[#10b981]">Active</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 rounded-[12px] bg-[#f8fafc] border border-[#e2e8f0] hover:bg-[#f1f5f9] hover:border-[#cbd5e0] transition-all duration-200 cursor-default">
                  <CalendarIcon className="w-5 h-5 text-[#f59e0b]" />
                  <div>
                    <p className="text-[10px] text-[#64748b] uppercase font-semibold tracking-wider leading-none mb-1">Member Since</p>
                    <p className="text-sm font-semibold text-[#1e293b]">{getFormattedDate(user?.createdAt)}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 rounded-[12px] bg-[#f8fafc] border border-[#e2e8f0] hover:bg-[#f1f5f9] hover:border-[#cbd5e0] transition-all duration-200 cursor-default">
                  <Shield className="w-5 h-5 text-[#8b5cf6]" />
                  <div>
                    <p className="text-[10px] text-[#64748b] uppercase font-semibold tracking-wider leading-none mb-1">Security Level</p>
                    <p className="text-sm font-semibold text-[#1e293b]">Standard</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Profile Information */}
        <div className="lg:col-span-7 flex flex-col h-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={isEditing ? "edit" : "view"}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="h-full"
            >
              <Card className="rounded-[16px] border border-slate-200/80 bg-white shadow-[0_4px_20px_rgba(0,0,0,0.05)] h-full overflow-hidden flex flex-col">
                <CardContent className="p-8 md:p-10 flex flex-col h-full">
                  <div className="flex items-center justify-between mb-8">
                    <h3 className="text-xl font-semibold text-[#1e293b] flex items-center gap-2">
                      <User className="w-5 h-5" />
                      Profile Information
                    </h3>
                    <Badge variant="outline" className={cn(
                      "px-3 py-1 rounded-full font-semibold text-[10px] uppercase",
                      isEditing ? "bg-amber-50 text-emerald-600 border-amber-200" : "bg-emerald-50  border-emerald-200"
                    )}>
                      {isEditing ? "Editing Profile" : "Verified Account"}
                    </Badge>
                  </div>

                  {!isEditing ? (
                    /* View Mode */
                    <div className="space-y-6 flex-1">
                      <div className="flex items-center gap-4 p-5 rounded-[12px] bg-[#f8fafc] border border-[#e2e8f0]">
                        <Mail className="w-5 h-5 text-primary-500" />
                        <div className="flex-1">
                          <p className="text-[10px] text-[#64748b] uppercase font-semibold tracking-wider mb-1">Email Address</p>
                          <p className="text-base font-semibold text-[#1e293b]">{user?.email}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 p-5 rounded-[12px] bg-[#f8fafc] border border-[#e2e8f0]">
                        <PhoneIcon className="w-5 h-5 text-[#ef4444]" />
                        <div className="flex-1">
                          <p className="text-[10px] text-[#64748b] uppercase font-semibold tracking-wider mb-1">Phone Number</p>
                          <p className="text-base font-semibold text-[#1e293b]">{user?.phone || "Not set"}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 p-5 rounded-[12px] bg-[#f8fafc] border border-[#e2e8f0]">
                        <BadgeIcon className="w-5 h-5 text-[#8b5cf6]" />
                        <div className="flex-1">
                          <p className="text-[10px] text-[#64748b] uppercase font-semibold tracking-wider mb-1">Account Role</p>
                          <p className="text-base font-semibold text-[#1e293b]">
                            {user?.role === "superadmin" ? "Super Administrator" : "Standard User"}
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* Edit Mode */
                    <form onSubmit={handleSave} className="space-y-6 flex-1">
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-[#334155] ml-1">Full Name</label>
                        <Input 
                          placeholder="Enter your full name"
                          value={formData.name}
                          onChange={e => setFormData({...formData, name: e.target.value})}
                          className="rounded-[12px] bg-[#f8fafc] border-slate-200 h-14 font-medium focus:ring-2 focus:ring-primary-500/20 transition-all"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-[#334155] ml-1">Email Address</label>
                        <Input 
                          type="email"
                          value={formData.email}
                          disabled={true}
                          className="rounded-[12px] bg-slate-50 border-slate-200 h-14 font-medium text-slate-400 cursor-not-allowed"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-[#334155] ml-1">Phone Number</label>
                        <Input 
                          placeholder="Enter your phone number"
                          value={formData.phone}
                          onChange={e => setFormData({...formData, phone: e.target.value})}
                          className="rounded-[12px] bg-[#f8fafc] border-slate-200 h-14 font-medium focus:ring-2 focus:ring-primary-500/20 transition-all"
                        />
                      </div>

                      <div className="pt-6 flex gap-4">
                        <Button 
                          type="submit" 
                          disabled={updateProfileLoading}
                          className="flex-1 bg-gradient-to-r from-primary-500 to-primary-700 text-white rounded-[12px] py-6 shadow-[0_4px_15px_rgba(124,58,237,0.3)] hover:shadow-[0_6px_20px_rgba(124,58,237,0.4)] transition-all font-semibold"
                        >
                          {updateProfileLoading ? "Saving..." : <><SaveIcon className="w-4 h-4 mr-2" /> Save Changes</>}
                        </Button>
                        <Button 
                          type="button"
                          variant="outline"
                          onClick={() => setIsEditing(false)}
                          className="rounded-[12px] px-8 h-[56px] border-slate-200 text-slate-600 font-semibold hover:bg-slate-50"
                        >
                          <CancelIcon className="w-4 h-4 mr-2" />
                          Cancel
                        </Button>
                      </div>
                    </form>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default Settings;
