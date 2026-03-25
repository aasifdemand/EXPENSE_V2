import React from "react";
import Modal from "./Modal";
import { Button } from "./Button";
import { AlertTriangle, LogOut, Trash2 } from "lucide-react";
import { cn } from "../../utils/utils";

const ConfirmModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = "Are you sure?", 
  message = "This action cannot be undone.", 
  confirmText = "Confirm", 
  cancelText = "Cancel",
  type = "danger", // 'danger' | 'warning' | 'info'
  isLoading = false
}) => {
  const icons = {
    danger: <Trash2 className="w-6 h-6 text-red-600" />,
    warning: <AlertTriangle className="w-6 h-6 text-amber-600" />,
    info: <LogOut className="w-6 h-6 text-primary-600" />
  };

  const colors = {
    danger: "bg-red-50",
    warning: "bg-amber-50",
    info: "bg-primary-50"
  };

  const buttonColors = {
    danger: "bg-red-600 hover:bg-red-700 shadow-red-500/20",
    warning: "bg-amber-600 hover:bg-amber-700 shadow-amber-500/20",
    info: "bg-primary-600 hover:bg-primary-700 shadow-primary-500/20"
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} className="max-w-sm">
      <div className="flex flex-col items-center text-center space-y-4">
        <div className={cn("p-4 rounded-full", colors[type])}>
          {icons[type]}
        </div>
        
        <div className="space-y-2">
          <p className="text-sm text-text-muted leading-relaxed">
            {message}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 w-full pt-4">
          <Button 
            variant="outline" 
            onClick={onClose}
            disabled={isLoading}
            className="rounded-xl border-slate-200 text-text-secondary hover:bg-slate-50"
          >
            {cancelText}
          </Button>
          <Button 
            onClick={onConfirm}
            disabled={isLoading}
            className={cn(
              "rounded-xl font-semibold shadow-lg transition-transform active:scale-95",
              buttonColors[type]
            )}
          >
            {isLoading ? "Processing..." : confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmModal;
