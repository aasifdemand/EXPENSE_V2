import React, { useState } from "react";
import { useSelector } from "react-redux";
import { Menu, LogOut, Building2, User, ChevronDown } from "lucide-react";

import { useLocation as useRouteLocation, useNavigate } from "react-router-dom";
import { useLocation } from "../../contexts/LocationContext";
import { useLogoutMutation } from "../../store/authApi";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { Select } from "../ui/Select";
import { cn } from "../../utils/utils";
import ConfirmModal from "../ui/ConfirmModal";

const locations = [
  { id: "overall", name: "Overall", value: "OVERALL", color: "text-green-500" },
  { id: "bangalore", name: "Bangalore", value: "BENGALURU", color: "text-blue-500" },
  { id: "mumbai", name: "Mumbai", value: "MUMBAI", color: "text-red-500" },
];

const Navbar = ({ onMenuClick }) => {
  const navigate = useNavigate();
  const [logoutMutation, { isLoading: logoutLoader }] = useLogoutMutation();
  const { user } = useSelector((state) => state?.auth || {});
  const { currentLoc, setCurrentLoc } = useLocation();
  const routeLocation = useRouteLocation();
  const isAdminPanel = routeLocation.pathname.startsWith("/admin");

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isLocDropdownOpen, setIsLocDropdownOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleLogout = async () => {
    try {
      await logoutMutation().unwrap();
      setShowLogoutConfirm(false);
      setIsProfileOpen(false);
      navigate("/login");
    } catch (err) {
      console.error("Logout failed:", err);
      navigate("/login");
    }
  };

  const currentLocationRecord = locations.find((l) => l.value === currentLoc) || locations[0];

  return (
    <header className="sticky top-0 z-30 bg-surface border-b border-border h-20 flex items-center justify-between px-4 sm:px-8 transition-all backdrop-blur-md bg-surface/95">
      <div className="flex items-center gap-4">
        {/* Mobile Menu Toggle */}
        <button
          onClick={onMenuClick}
          className="md:hidden p-2 rounded-lg text-text-secondary hover:bg-surface-hover transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>
        
        <div className="flex items-center gap-2">
          <Badge variant={isAdminPanel ? "primary" : "secondary"} className="px-4 py-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] rounded-lg shadow-sm border-none bg-primary-50 text-primary-700">
            {isAdminPanel ? "Admin Panel" : "User Panel"}
          </Badge>
        </div>
      </div>

      <div className="flex items-center gap-3 sm:gap-6">
        {/* Location Dropdown (Superadmin only) */}
        {user?.role === "superadmin" && (
          <div className="relative">
            <button
              onClick={() => setIsLocDropdownOpen(!isLocDropdownOpen)}
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border hover:bg-surface-hover transition-colors shadow-sm"
            >
              <Building2 className={cn("w-4 h-4", currentLocationRecord.color)} />
              <span className="text-sm font-semibold text-text-primary">{currentLocationRecord.name}</span>
              <ChevronDown className="w-4 h-4 text-text-muted" />
            </button>

            {isLocDropdownOpen && (
              <>
                <div 
                  className="fixed inset-0 z-10" 
                  onClick={() => setIsLocDropdownOpen(false)} 
                />
                <Card className="absolute right-0 mt-2 w-48 shadow-xl py-1 z-20 overflow-hidden border border-border/50 p-0">
                  {locations.map((loc) => (
                    <button
                      key={loc.id}
                      onClick={() => {
                        setCurrentLoc(loc.value);
                        setIsLocDropdownOpen(false);
                      }}
                      className={cn(
                        "w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors hover:bg-surface-hover",
                        currentLoc === loc.value ? "bg-primary-50 text-primary-600 font-bold border-l-2 border-primary-600" : "text-text-secondary"
                      )}
                    >
                      <Building2 className={cn("w-4 h-4", loc.color)} />
                      {loc.name}
                    </button>
                  ))}
                </Card>
              </>
            )}
          </div>
        )}

        {/* Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-3 p-1.5 rounded-full hover:bg-surface-hover transition-all group"
          >
            <div className="w-8 h-8 rounded-full bg-primary-600 text-white flex items-center justify-center font-bold text-xs shadow-sm shadow-primary-500/20">
              {user?.avatarUrl ? (
                <img src={user.avatarUrl} alt="avatar" className="w-full h-full rounded-full object-cover" />
              ) : (
                user?.name ? user.name.charAt(0).toUpperCase() : "U"
              )}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-sm font-semibold text-text-primary leading-tight">
                {user?.name || "User"}
              </p>
              <p className="text-[10px] font-medium text-text-muted uppercase tracking-tighter">
                {user?.role || "Member"}
              </p>
            </div>
            <ChevronDown className="w-4 h-4 text-text-muted hidden sm:block group-hover:text-text-primary transition-colors ml-1" />
          </button>

          {isProfileOpen && (
            <>
              <div 
                className="fixed inset-0 z-10" 
                onClick={() => setIsProfileOpen(false)} 
              />
              <Card className="absolute right-0 mt-2 w-56 shadow-lg border border-border/50 py-1 z-20 p-0">
                <div className="px-4 py-3 border-b border-border/50">
                  <p className="text-sm font-bold text-text-primary">{user?.name || "User"}</p>
                  <p className="text-xs text-text-muted capitalize">{user?.role || "Member"}</p>
                </div>
                
                {user?.role === "superadmin" && (
                  <div className="sm:hidden px-4 py-3 border-b border-border/50 space-y-2">
                    <p className="text-xs font-semibold text-text-muted uppercase tracking-wider">Location</p>
                    <Select
                      value={currentLoc || "OVERALL"}
                      onChange={(e) => {
                        setCurrentLoc(e.target.value);
                        setIsProfileOpen(false);
                      }}
                      icon={Building2}
                      className="h-10 text-xs font-bold uppercase"
                    >
                      {locations.map((loc) => (
                        <option key={loc.id} value={loc.value}>{loc.name}</option>
                      ))}
                    </Select>
                  </div>
                )}

                <div className="py-1">
                  <Button
                    variant="ghost"
                    onClick={() => setShowLogoutConfirm(true)}
                    className="w-full flex items-center justify-start gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors rounded-none font-bold"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </Button>
                </div>
              </Card>
            </>
          )}
        </div>
      </div>

      <ConfirmModal 
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={handleLogout}
        title="Confirm Logout"
        message="Are you sure you want to sign out of your account?"
        confirmText="Logout"
        type="info"
        isLoading={logoutLoader}
      />
    </header>
  );
};

export default Navbar;
