import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { LogOut, Loader2 } from "lucide-react"

import { useLogoutMutation } from "../../store/authApi";
import { Button } from "../ui/Button";
import { cn } from "../../utils/utils";
import ConfirmModal from "../ui/ConfirmModal";

const Sidebar = ({ open, onClose, menuItems }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [logoutMutation, { isLoading: logoutLoader }] = useLogoutMutation();
  
  const [activeItem, setActiveItem] = useState("");
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  useEffect(() => {
    setActiveItem(location.pathname);
  }, [location.pathname]);

  const handleNavigate = (path) => {
    setActiveItem(path);
    navigate(path);
    if (onClose) onClose();
  };

  const handleLogout = async () => {
    try {
      await logoutMutation().unwrap();
      setShowLogoutConfirm(false);
      navigate("/login");
    } catch (err) {
      console.error("Logout failed:", err);
      // forceLogout in authApi should have already cleared state
      navigate("/login");
    }
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-surface border-r border-border w-64 md:w-68 transition-all">
      {/* Logo Area */}
      <div className="flex items-center justify-center p-3 h-20 bg-white border-b border-border/40">
        <img src="/image.png" alt="Logo" className="h-12 w-auto object-fit" />
      </div>

      <div className="flex-1 overflow-y-auto py-6 px-3 space-y-1">
        {menuItems.map((item) => {
          const isActive = activeItem.startsWith(item.path);
          return (
            <Button
              key={item.path}
              variant="ghost"
              onClick={() => handleNavigate(item.path)}
              className={cn(
                "w-full flex items-center justify-start gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition-all relative group",
                isActive 
                  ? "bg-primary-50 text-primary-600 shadow-sm" 
                  : "text-text-secondary hover:bg-surface-hover hover:text-text-primary"
              )}
            >
              {isActive && (
                <div className="absolute left-0 top-3 bottom-3 w-1.5 bg-primary-600 rounded-r-full shadow-[2px_0_8px_rgba(99,102,241,0.3)]" />
              )}
              <item.icon 
                className={cn(
                  "w-5 h-5 transition-colors", 
                  isActive ? "text-primary-600" : "text-text-muted group-hover:text-text-primary"
                )} 
              />
              {item.text}
            </Button>
          );
        })}
      </div>

      {/* Logout Area */}
      <div className="p-4 border-t border-border/50">
        <Button
          variant="outline"
          onClick={() => setShowLogoutConfirm(true)}
          disabled={logoutLoader}
          isLoading={logoutLoader}
          className="w-full flex items-center justify-start gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-red-600 hover:bg-red-50 hover:text-red-700 border-transparent hover:border-red-100 transition-all disabled:opacity-50"
        >
          {!logoutLoader && <LogOut className="w-5 h-5 transition-transform group-hover:-translate-x-1" />}
          {logoutLoader ? "Logging out..." : "Logout"}
        </Button>
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
    </div>
  );

  return (
    <>
      {/* Mobile Backdrop */}
      {open && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar Wrapper */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 h-screen",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {sidebarContent}
      </aside>
    </>
  );
};

export default Sidebar;
