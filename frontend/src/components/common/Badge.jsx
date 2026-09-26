import React from 'react';

export const Badge = ({
  children,
  status = 'default',
  variant = 'stamp', // 'stamp' (tactile metrology stamp) or 'standard'
  subtext,
  className = ''
}) => {
  const statusLower = String(status || children || '').toLowerCase();

  let label = 'IN PROGRESS';
  let colorClasses = 'bg-blue-50/70 text-blue-900 border-blue-400/40';
  let defaultSubtext = 'QUEUE ACTIVE';

  if (['pass', 'passed', 'valid', 'verified', 'approved', 'active'].includes(statusLower)) {
    label = 'VERIFIED';
    colorClasses = 'bg-emerald-50/70 text-emerald-900 border-emerald-600/40';
    defaultSubtext = 'OIML COMPLIANT';
  } else if (['fail', 'failed', 'rejected', 'expired', 'danger'].includes(statusLower)) {
    label = 'DEFECTIVE';
    colorClasses = 'bg-red-50/70 text-red-900 border-red-500/40';
    defaultSubtext = 'MPE EXCEEDED';
  } else if (['awaiting_assignment', 'unassigned', 'submitted', 'pending'].includes(statusLower)) {
    label = 'AWAITING ASSIGN';
    colorClasses = 'bg-amber-50/70 text-amber-900 border-amber-500/40';
    defaultSubtext = 'ROUTING PENDING';
  } else if (
    ['under_review', 'assigned', 'in_progress', 'processing', 'default'].includes(statusLower)
  ) {
    label = 'IN VERIFICATION';
    colorClasses = 'bg-blue-50/70 text-blue-900 border-blue-400/40';
    defaultSubtext = 'FIELD TESTING';
  } else {
    // Custom non-status badge (e.g., model class, role tags)
    label = typeof children === 'string' ? children.toUpperCase() : String(status).toUpperCase();
    colorClasses = 'bg-slate-50 text-slate-800 border-slate-300';
    defaultSubtext = null;
  }

  const effectiveSubtext = subtext !== undefined ? subtext : defaultSubtext;

  if (variant === 'stamp' && effectiveSubtext) {
    return (
      <div
        className={`inline-block border px-2 py-0.5 text-center rounded-xs select-none ${colorClasses} ${className}`}
      >
        <div className="text-[10px] font-mono uppercase font-bold tracking-wider leading-tight">
          {label}
        </div>
        <div className="text-[8px] font-mono opacity-80 tracking-tight leading-none mt-0.5">
          {effectiveSubtext}
        </div>
      </div>
    );
  }

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-xs text-[11px] font-mono font-semibold uppercase tracking-wider border ${colorClasses} ${className}`}
    >
      {label}
    </span>
  );
};
