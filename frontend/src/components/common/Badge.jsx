import React from 'react';

export const Badge = ({ children, status = 'default', className = '' }) => {
  const statusLower = String(status || children || '').toLowerCase();

  let label = 'In Progress';
  let colorClasses = 'bg-cyan-100 text-cyan-900 border-cyan-300';

  if (['pass', 'passed', 'valid', 'verified', 'approved', 'active'].includes(statusLower)) {
    label = 'Passed';
    colorClasses = 'bg-emerald-100 text-emerald-800 border-emerald-300';
  } else if (['fail', 'failed', 'rejected', 'expired', 'danger'].includes(statusLower)) {
    label = 'Failed';
    colorClasses = 'bg-red-100 text-red-800 border-red-300';
  } else if (
    ['submitted', 'under_review', 'assigned', 'in_progress', 'processing', 'pending', 'default'].includes(statusLower)
  ) {
    label = 'In Progress';
    colorClasses = 'bg-cyan-100 text-cyan-900 border-cyan-300';
  } else {
    // Custom non-status badge (e.g., role tags)
    label = typeof children === 'string' ? children : String(status);
    colorClasses = 'bg-neutral-100 text-neutral-900 border-neutral-300';
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${colorClasses} ${className}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 shrink-0" />
      {label}
    </span>
  );
};
