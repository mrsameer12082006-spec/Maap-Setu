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
        <label htmlFor={inputId} className="block text-sm font-medium text-neutral-900 mb-1">
          {label} {required && <span className="text-danger">*</span>}
        </label>
      )}
      <div className="relative rounded-input">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-600">
            <Icon className="w-4 h-4" />
          </div>
        )}
        <input
          ref={ref}
          id={inputId}
          type={type}
          required={required}
          className={`w-full rounded-input border text-sm text-neutral-900 bg-white px-3 py-2 transition-colors placeholder:text-neutral-600 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary disabled:bg-neutral-100 disabled:opacity-75 ${
            Icon ? 'pl-9' : ''
          } ${error ? 'border-danger focus:ring-danger' : 'border-neutral-300'}`}
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
