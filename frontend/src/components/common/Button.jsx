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
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-60 disabled:cursor-not-allowed text-left';

  const variants = {
    primary: 'bg-[#0B315B] hover:bg-[#082240] text-white border border-[#0B315B] focus:ring-[#0B315B]/30',
    secondary: 'bg-white border border-[#C87541] text-[#C87541] hover:bg-[#FDF3EC] focus:ring-[#C87541]/30',
    outline: 'bg-white border border-slate-300 text-slate-800 hover:bg-slate-50 focus:ring-slate-300',
    ghost: 'bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900 focus:ring-slate-300',
    danger: 'bg-red-700 text-white hover:bg-red-800 border border-red-700 focus:ring-red-600',
    accent: 'bg-[#C87541] hover:bg-[#B36332] text-white border border-[#C87541] focus:ring-[#C87541]/30'
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs min-h-[36px] gap-1.5',
    md: 'px-4 py-2.5 text-sm min-h-[44px] gap-2',
    lg: 'px-6 py-3 text-base min-h-[48px] gap-2.5'
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
