import React from 'react';
import { Loader2 } from 'lucide-react';

export const Button = ({
  children,
  variant = 'primary', // primary | secondary | ghost | danger | accent
  size = 'md', // sm | md | lg
  loading = false,
  disabled = false,
  className = '',
  icon: Icon,
  type = 'button',
  onClick,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-button transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-60 disabled:cursor-not-allowed';

  const variants = {
    primary: 'bg-primary hover:bg-primary-dark text-white focus:ring-primary',
    secondary: 'bg-white border border-neutral-300 text-neutral-900 hover:bg-neutral-100 focus:ring-neutral-300',
    ghost: 'bg-transparent text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 focus:ring-neutral-300',
    danger: 'bg-danger text-white hover:bg-red-800 focus:ring-danger',
    accent: 'bg-accent text-white hover:bg-emerald-700 focus:ring-accent'
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs gap-1.5',
    md: 'px-4 py-2 text-sm gap-2',
    lg: 'px-6 py-3 text-base gap-2.5'
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin shrink-0" />
      ) : Icon ? (
        <Icon className="w-4 h-4 shrink-0" />
      ) : null}
      <span>{children}</span>
    </button>
  );
};
