import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export const Modal = ({ isOpen, onClose, title, children, maxWidth = 'max-w-2xl', footer }) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] w-screen h-screen flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className={`bg-white rounded-sm shadow-xl border border-slate-300 w-full ${maxWidth} max-h-[90vh] flex flex-col overflow-hidden text-left`}
        role="dialog"
        aria-modal="true"
      >
        {/* Subtle top accent line in Warm Copper */}
        <div className="h-1 bg-[#C87541] w-full shrink-0"></div>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/70 relative">
          <h2 className="text-base sm:text-lg font-semibold text-[#0B315B] tracking-tight">{title}</h2>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-slate-800 rounded-sm p-1 hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="vernier-ticks-sm absolute bottom-0 left-0 right-0" />
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 text-slate-800 text-sm text-left">{children}</div>

        {/* Footer */}
        {footer && (
          <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex justify-end gap-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};
