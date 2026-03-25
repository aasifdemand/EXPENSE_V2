import React from 'react';
import { Wallet } from 'lucide-react';

const Loader = () => {
  return (
    <div className="fixed inset-0 z-9999 flex items-center justify-center bg-white/80 backdrop-blur-md">
      <div className="relative flex flex-col items-center">
        {/* Animated Background Circles */}
        <div className="absolute -inset-4 animate-pulse rounded-full bg-primary-500/10 blur-xl"></div>
        <div className="absolute -inset-8 animate-pulse rounded-full bg-primary-400/5 blur-2xl delay-700"></div>
        
        {/* Main Logo Container */}
        <div className="relative flex h-24 w-24 items-center justify-center rounded-2xl bg-white shadow-2xl shadow-primary-500/20">
          <div className="absolute inset-0 animate-spin-slow rounded-2xl border-4 border-t-primary-600 border-r-transparent border-b-primary-200 border-l-transparent"></div>
          
          <div className="relative animate-bounce-subtle">
            <Wallet className="h-10 w-10 text-primary-600" strokeWidth={1.5} />
          </div>
        </div>

        {/* Loading Text */}
        <div className="mt-8 flex flex-col items-center gap-2">
          <h3 className="text-lg font-bold tracking-tight text-text-primary">
            Syncing Finances
          </h3>
          <div className="flex gap-1.5">
            <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary-400"></div>
            <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary-500 delay-150"></div>
            <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary-600 delay-300"></div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes bounce-subtle {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
        .animate-bounce-subtle {
          animation: bounce-subtle 2s ease-in-out infinite;
        }
        .animate-spin-slow {
          animation: spin 3s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default Loader;
