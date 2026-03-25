import React from "react";
import { Outlet } from "react-router-dom";
import { Square, Triangle } from "lucide-react";

/**
 * AuthLayout - A premium layout for authentication pages.
 * Features a vibrant primary-colored background with decorative, animated geometric shapes.
 * Designed to be bright and welcoming ("no darkened bg").
 */
const AuthLayout = () => {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 bg-slate-50 relative overflow-hidden">
      {/* Premium Mesh Gradient Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-5%] w-[60vw] h-[60vw] rounded-full bg-primary-100/40 blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[50vw] h-[50vw] rounded-full bg-primary-200/30 blur-[100px] animate-pulse delay-700" />
        <div className="absolute top-[20%] right-[10%] w-[30vw] h-[30vw] rounded-full bg-primary-50/50 blur-[80px]" />
      </div>
      
      {/* Decorative Geometric Objects - Vibrant and Animated */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Shape 1: Large Outlined Top Right - Triangle */}
        <div className="absolute top-[8%] right-[12%] text-primary-400 opacity-30 transform scale-[2] rotate-15 animate-float">
            <Triangle size={80} strokeWidth={1} />
        </div>

        {/* Shape 2: Medium Filled Middle Left - Square */}
        <div className="absolute top-[35%] left-[6%] text-primary-500 opacity-35 transform -rotate-20 animate-float-delayed">
            <Square size={60} fill="currentColor" strokeWidth={0} />
        </div>

        {/* Shape 3: Large Filled Bottom Left - Triangle */}
        <div className="absolute bottom-[12%] left-[15%] text-primary-300 opacity-40 transform rotate-35 animate-float">
            <Triangle size={100} fill="currentColor" strokeWidth={0} />
        </div>

        {/* Shape 4: Extra Large Outlined Bottom Right - Square */}
        <div className="absolute bottom-[18%] right-[8%] text-primary-400 opacity-25 transform -rotate-30 animate-float-delayed scale-150">
            <Square size={120} strokeWidth={1.5} />
        </div>

        {/* Floating Texture Shapes */}
        <div className="absolute top-[22%] left-[28%] text-primary-500 opacity-[0.15] animate-float">
            <Square size={36} fill="currentColor" strokeWidth={0} />
        </div>
        <div className="absolute top-[65%] right-[22%] text-primary-400 opacity-[0.2] animate-float-delayed">
            <Triangle size={28} strokeWidth={2} />
        </div>
        <div className="absolute bottom-[40%] right-[35%] text-primary-300 opacity-[0.15] animate-float">
            <Square size={44} fill="currentColor" strokeWidth={0} />
        </div>
      </div>

      {/* Content wrapper */}
      <main className="relative z-10 w-full flex flex-col items-center justify-center">
        <Outlet />
      </main>

      {/* Shared Footer */}
      <footer className="relative z-10 mt-12 text-center text-primary-900/30 font-normal">
        <p className="text-[11px] tracking-widest uppercase">
          © {new Date().getFullYear()} Expense System. Demand Curve Marketing
        </p>
      </footer>

     
    </div>
  );
};

export default AuthLayout;
