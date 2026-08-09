import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type?: 'success' | 'error' | 'info';
  title: string;
  description?: string;
  duration?: number;
}

interface ToastProps {
  toast: ToastMessage | null;
  onDismiss: () => void;
}

export const Toast: React.FC<ToastProps> = ({ toast, onDismiss }) => {
  useEffect(() => {
    if (!toast) return;

    const timer = setTimeout(() => {
      onDismiss();
    }, toast.duration || 3500);

    return () => clearTimeout(timer);
  }, [toast, onDismiss]);

  if (!toast) return null;

  const getIcon = () => {
    switch (toast.type) {
      case 'error':
        return <AlertCircle className="w-5 h-5 text-accent-red flex-shrink-0" />;
      case 'info':
        return <Info className="w-5 h-5 text-accent-blue flex-shrink-0" />;
      default:
        return <CheckCircle2 className="w-5 h-5 text-accent-green flex-shrink-0" />;
    }
  };

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 max-w-md w-full px-4 pointer-events-none select-none animate-slide-up">
      <div className="surface-elevated p-3.5 rounded-modal border border-vg-border-strong shadow-2xl flex items-center justify-between gap-3 pointer-events-auto bg-vg-secondary/95 backdrop-blur-md">
        <div className="flex items-center space-x-3 min-w-0">
          <div className="p-1 rounded-full bg-vg-tertiary border border-vg-border">
            {getIcon()}
          </div>
          <div className="min-w-0">
            <h4 className="text-xs font-bold text-text-primary truncate">{toast.title}</h4>
            {toast.description && (
              <p className="text-[11px] text-text-secondary truncate mt-0.5">{toast.description}</p>
            )}
          </div>
        </div>

        <button
          onClick={onDismiss}
          className="p-1 rounded-button text-text-muted hover:text-text-primary hover:bg-vg-elevated transition-colors flex-shrink-0"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
