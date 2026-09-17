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
    <div className="fixed inset-0 z-[100] w-screen h-screen flex items-center justify-center p-4 bg-transparent animate-in fade-in duration-200">
      <div
        className={`bg-white rounded-card shadow-xl border border-neutral-300 w-full ${maxWidth} max-h-[90vh] flex flex-col overflow-hidden`}
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-300 bg-neutral-100/50">
          <h3 className="text-lg font-semibold text-neutral-900">{title}</h3>
          <button
            onClick={onClose}
            className="text-neutral-600 hover:text-neutral-900 rounded-lg p-1 hover:bg-neutral-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1">{children}</div>

        {/* Footer */}
        {footer && (
          <div className="px-6 py-3 border-t border-neutral-300 bg-neutral-100/50 flex justify-end gap-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};
