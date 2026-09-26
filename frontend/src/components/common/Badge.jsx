import React from 'react';

export const Badge = ({ children, status = 'default', className = '' }) => {
  const statusLower = String(status || children || '').toLowerCase();

  let label = 'In Progress';
  let colorClasses = 'bg-blue-50 text-blue-800 border-blue-200';

  if (['pass', 'passed', 'valid', 'verified', 'approved', 'active'].includes(statusLower)) {
    label = 'Passed';
    colorClasses = 'bg-emerald-50 text-emerald-800 border-emerald-200';
  } else if (['fail', 'failed', 'rejected', 'expired', 'danger'].includes(statusLower)) {
    label = 'Failed';
    colorClasses = 'bg-red-50 text-red-800 border-red-200';
  } else if (
    ['submitted', 'under_review', 'assigned', 'in_progress', 'processing', 'pending', 'default'].includes(statusLower)
  ) {
    label = 'In Progress';
    colorClasses = 'bg-blue-50 text-blue-800 border-blue-200';
  } else {
    // Custom non-status badge (e.g., role tags)
    label = typeof children === 'string' ? children : String(status);
    colorClasses = 'bg-slate-100 text-slate-800 border-slate-200';
  }

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${colorClasses} ${className}`}>
      {label}
    </span>
  );
};
