import React, { useEffect } from 'react';
import { LogOut, X, AlertTriangle } from 'lucide-react';

export const PortalExitConfirmModal = ({ isOpen, onCancel, onConfirm, loading, error }) => {
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen && !loading) {
        onCancel();
      }
    };
    if (isOpen) document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onCancel, loading]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-[#003943]/40 backdrop-blur-sm transition-opacity"
        onClick={() => !loading && onCancel()}
      />
      
      {/* Modal Dialog */}
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-xl border border-[#003943]/10 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#003943]/10 flex items-center justify-between bg-[#FDF9F6]">
          <h3 className="text-lg font-bold text-[#003943] font-serif flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            Leave Portal?
          </h3>
          <button 
            onClick={onCancel}
            disabled={loading}
            className="p-2 -mr-2 rounded-full text-[#003943]/60 hover:text-[#003943] hover:bg-[#003943]/5 transition-colors disabled:opacity-50"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          <p className="text-[#003943]/80 text-sm leading-relaxed">
            You are signed in to the MaapSetu portal. Leaving this page will sign you out of your current session.
          </p>
          <p className="text-[#003943]/80 text-sm leading-relaxed mt-2 font-medium">
            Do you want to continue?
          </p>

          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-[#003943]/5 flex items-center justify-end gap-3">
          <button
            onClick={onCancel}
            disabled={loading}
            className="px-4 py-2 text-sm font-bold text-[#003943]/70 hover:text-[#003943] hover:bg-[#003943]/5 rounded-xl transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="px-4 py-2 text-sm font-bold text-white bg-red-600 hover:bg-red-700 active:bg-red-800 rounded-xl transition-colors flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed shadow-sm"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Signing Out...
              </>
            ) : (
              <>
                <LogOut className="w-4 h-4" />
                Continue & Sign Out
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};
