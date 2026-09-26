import React from 'react';

export const Card = ({ children, className = '', title, subtitle, action, headerExtra }) => {
  return (
    <div className={`bg-white border border-slate-200 rounded-md shadow-none p-6 text-left ${className}`}>
      {(title || subtitle || action) && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 mb-4 border-b border-slate-200 text-left">
          <div>
            {title && <h2 className="text-base sm:text-lg font-medium text-[#0B315B]">{title}</h2>}
            {subtitle && <p className="text-xs text-slate-500 mt-1">{subtitle}</p>}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}
      {children}
    </div>
  );
};
