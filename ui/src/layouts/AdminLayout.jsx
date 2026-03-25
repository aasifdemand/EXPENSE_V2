import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import { 
  LayoutDashboard, 
  Wallet, 
  Receipt, 
  Users, 
  Settings, 
  FileBox, 
  Banknote
} from "lucide-react";

import Sidebar from "../components/layout/Sidebar";
import Navbar from "../components/layout/Navbar";

const adminMenuItems = [
  { text: "Dashboard", icon: LayoutDashboard, path: "/admin/dashboard" },
  { text: "Budgeting", icon: Banknote, path: "/admin/budget" },
  { text: "Expenses", icon: Receipt, path: "/admin/expenses" },
  { text: "Reimbursements", icon: Wallet, path: "/admin/reimbursements" },
  { text: "Reports", icon: FileBox, path: "/admin/report" },
  { text: "Users", icon: Users, path: "/admin/user" },
  { text: "Settings", icon: Settings, path: "/admin/settings" },
];

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden relative">
      {/* Sidebar - Controlled by state for mobile */}
      <Sidebar 
        open={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
        menuItems={adminMenuItems} 
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col w-full h-full overflow-hidden">
        
        {/* Navbar */}
        <Navbar onMenuClick={() => setSidebarOpen(true)} />

        {/* Scrollable Page Content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto w-full">
          <Outlet />
        </main>

      </div>
    </div>
  );
}
