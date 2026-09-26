import React from 'react';

export const Card = ({ children, className = '', title, subtitle, action, headerExtra, accent = false, ruler = false }) => {
  return (
    <div className={`bg-white border border-slate-200 rounded-sm shadow-none p-6 text-left relative overflow-hidden ${className}`}>
      {accent && <div className="h-1 bg-[#C87541] w-full absolute top-0 left-0" />}
      {(title || subtitle || action) && (
        <div className="pb-4 mb-4 border-b border-slate-200 text-left">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              {title && <h2 className="text-base sm:text-lg font-semibold text-[#0B315B] tracking-tight">{title}</h2>}
              {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
            </div>
            {action && <div className="shrink-0">{action}</div>}
          </div>
          {ruler && <div className="vernier-ruler-divider w-full mt-3" />}
        </div>
      )}
      {children}
    </div>
  );
};
