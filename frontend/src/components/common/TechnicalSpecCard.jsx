import React from 'react';
import { Badge } from './Badge';

export const TechnicalSpecCard = ({
  recordId,
  title,
  modelClass,
  serialNumber,
  verificationUnit,
  maxCapacity,
  deviation,
  status = 'verified',
  stampLabel = 'LMD Verified',
  stampSubtext = 'NPL Traceable',
  dueDate,
  actionButton,
  className = ''
}) => {
  return (
    <div
      className={`relative bg-white border border-slate-300 rounded-xs shadow-none overflow-hidden text-left ${className}`}
    >
      {/* Subtle top accent line in Warm Copper */}
      <div className="h-1 bg-[#C87541] w-full" />

      {/* Header with Technical Stamp */}
      <div className="p-4 sm:p-5 border-b border-slate-200 flex items-start justify-between bg-slate-50/70 gap-3">
        <div className="space-y-0.5">
          <span className="text-[10px] font-mono tracking-widest uppercase text-slate-500 block">
            {recordId ? `Calibration Record • ${recordId}` : 'Legal Calibration Record • Sec. 24(1)'}
          </span>
          <h3 className="text-sm sm:text-base font-semibold text-[#0B315B] tracking-tight">
            {title}
          </h3>
        </div>

        {/* Tactile Stamp Badge */}
        <Badge
          status={status}
          variant="stamp"
          subtext={stampSubtext}
          className="shrink-0"
        >
          {stampLabel}
        </Badge>
      </div>

      {/* Vernier scale divider line */}
      <div className="vernier-ticks-sm" />

      {/* High-Density Spec Grid */}
      <dl className="grid grid-cols-2 text-xs divide-x divide-y divide-slate-100 border-b border-slate-200">
        <div className="p-3">
          <dt className="text-slate-500 font-mono text-[10px] uppercase">SERIAL NO.</dt>
          <dd className="font-mono font-medium text-slate-900 mt-0.5 tabular-nums text-xs">
            {serialNumber || 'N/A'}
          </dd>
        </div>
        <div className="p-3">
          <dt className="text-slate-500 font-mono text-[10px] uppercase">VERIFICATION UNIT</dt>
          <dd className="font-medium text-slate-900 mt-0.5 text-xs">
            {verificationUnit || (modelClass ? `Class: ${modelClass}` : 'Standard Grade')}
          </dd>
        </div>
        <div className="p-3">
          <dt className="text-slate-500 font-mono text-[10px] uppercase">MAX CAPACITY</dt>
          <dd className="font-mono font-medium text-slate-900 mt-0.5 tabular-nums text-xs">
            {maxCapacity || 'N/A'}
          </dd>
        </div>
        <div className="p-3">
          <dt className="text-slate-500 font-mono text-[10px] uppercase">DEVIATION / MPE</dt>
          <dd className={`font-mono font-medium mt-0.5 tabular-nums text-xs ${
            status === 'failed' ? 'text-red-700' : 'text-emerald-700'
          }`}>
            {deviation || 'Within ±0.5e Limit'}
          </dd>
        </div>
      </dl>

      {/* Grounded Actions Footer */}
      {(dueDate || actionButton) && (
        <div className="p-3 bg-slate-50/80 flex flex-wrap items-center justify-between gap-2 text-xs">
          <span className="text-[11px] font-mono text-slate-500 tabular-nums">
            {dueDate ? `Inspection Due: ${dueDate}` : 'Statutory Status: Verified'}
          </span>
          {actionButton}
        </div>
      )}
    </div>
  );
};
