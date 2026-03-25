import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { cn } from "../../utils/utils";

const Modal = ({ isOpen, onClose, title, children, className }) => {
  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" 
        onClick={onClose} 
      />
      <div className={cn(
        "relative bg-white rounded-2xl shadow-2xl w-full max-w-md transform transition-all animate-in zoom-in-95 duration-200 overflow-hidden",
        className
      )}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-border/50 bg-slate-50/50">
          <h3 className="text-lg font-semibold text-text-primary tracking-tight">{title}</h3>
          <button 
            onClick={onClose}
            className="p-1 px-2 rounded-lg hover:bg-slate-200 text-text-muted transition-colors font-semibold text-sm"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default Modal;
