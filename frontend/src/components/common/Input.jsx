import React from 'react';

export const Input = React.forwardRef(({
  label,
  error,
  helperText,
  icon: Icon,
  className = '',
  id,
  type = 'text',
  required = false,
  ...props
}, ref) => {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label htmlFor={inputId} className="block text-xs font-medium text-slate-700 mb-1.5 text-left">
          {label} {required && <span className="text-red-600">*</span>}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Icon className="w-4 h-4" />
          </div>
        )}
        <input
          ref={ref}
          id={inputId}
          type={type}
          required={required}
          className={`w-full rounded-md border text-sm text-slate-800 bg-white px-3.5 py-2.5 min-h-[44px] transition-colors placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[#0B315B] focus:border-[#0B315B] disabled:bg-slate-100 disabled:opacity-75 ${
            Icon ? 'pl-10' : ''
          } ${error ? 'border-red-500 focus:ring-red-500' : 'border-slate-300'}`}
          {...props}
        />
      </div>
      {error && (
        <p className="mt-1 text-xs text-danger font-medium">{error}</p>
      )}
      {!error && helperText && (
        <p className="mt-1 text-xs text-neutral-600">{helperText}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';
