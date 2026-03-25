import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import { 
  LayoutDashboard, 
  PieChart, 
  Wallet, 
  Settings,
  CreditCard,
  FileText
} from "lucide-react";

import Sidebar from "../components/layout/Sidebar";
import Navbar from "../components/layout/Navbar";

const userMenuItems = [
  { text: "Dashboard", icon: LayoutDashboard, path: "/user/dashboard" },
  { text: "Budgeting", icon: PieChart, path: "/user/budgeting" },
  { text: "Expenses", icon: Wallet, path: "/user/expenses" },
  { text: "Reimbursements", icon: CreditCard, path: "/user/reimbursements" },
  { text: "Reports", icon: FileText, path: "/user/report" },
  { text: "Settings", icon: Settings, path: "/user/settings" },
];

export default function UserLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden relative">
      {/* Sidebar - Controlled by state for mobile */}
      <Sidebar 
        open={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
        menuItems={userMenuItems} 
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
