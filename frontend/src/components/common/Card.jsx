import React from 'react';

export const Card = ({ children, className = '', title, subtitle, action, headerExtra }) => {
  return (
    <div className={`bg-white border border-neutral-300 rounded-card shadow-sm p-6 ${className}`}>
      {(title || subtitle || action) && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 mb-4 border-b border-neutral-300">
          <div>
            {title && <h3 className="text-neutral-900 font-semibold">{title}</h3>}
            {subtitle && <p className="text-sm text-neutral-600 mt-0.5">{subtitle}</p>}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}
      {children}
    </div>
  );
};
