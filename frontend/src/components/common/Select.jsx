import React from 'react';

export const Select = React.forwardRef(({
  label,
  options = [],
  error,
  helperText,
  className = '',
  id,
  required = false,
  placeholder = 'Select an option...',
  ...props
}, ref) => {
  const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label htmlFor={selectId} className="block text-xs font-medium text-slate-700 mb-1.5 text-left">
          {label} {required && <span className="text-red-600">*</span>}
        </label>
      )}
      <select
        ref={ref}
        id={selectId}
        required={required}
        className={`w-full rounded-sm border text-sm text-slate-800 bg-white px-3.5 py-2.5 min-h-[44px] transition-colors focus:outline-none focus:ring-1 focus:ring-[#0B315B] focus:border-[#0B315B] disabled:bg-slate-100 disabled:opacity-75 ${
          error ? 'border-red-500 focus:ring-red-500' : 'border-slate-300'
        }`}
        {...props}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((opt) => {
          const val = typeof opt === 'object' ? opt.value : opt;
          const lbl = typeof opt === 'object' ? opt.label : opt;
          return (
            <option key={val} value={val}>
              {lbl}
            </option>
          );
        })}
      </select>
      {error && <p className="mt-1 text-xs text-danger font-medium">{error}</p>}
      {!error && helperText && <p className="mt-1 text-xs text-neutral-600">{helperText}</p>}
    </div>
  );
});

Select.displayName = 'Select';
