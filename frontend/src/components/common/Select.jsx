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
        <label htmlFor={selectId} className="block text-sm font-medium text-neutral-900 mb-1">
          {label} {required && <span className="text-danger">*</span>}
        </label>
      )}
      <select
        ref={ref}
        id={selectId}
        required={required}
        className={`w-full rounded-input border text-sm text-neutral-900 bg-white px-3 py-2 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary disabled:bg-neutral-100 disabled:opacity-75 ${
          error ? 'border-danger focus:ring-danger' : 'border-neutral-300'
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
