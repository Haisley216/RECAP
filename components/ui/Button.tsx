'use client';

import { ReactNode } from 'react';

interface ButtonProps {
  children: ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  type?: 'button' | 'submit';
  className?: string;
  fullWidth?: boolean;
}

export default function Button({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  disabled,
  type = 'button',
  className = '',
  fullWidth,
}: ButtonProps) {
  const variants = {
    primary: 'bg-primary-500 text-white active:bg-primary-700 disabled:bg-gray-200 disabled:text-gray-400',
    secondary: 'bg-primary-50 text-primary-600 active:bg-primary-100 border border-primary-200',
    ghost: 'bg-transparent text-gray-500 active:bg-gray-100',
  };
  const sizes = {
    sm: 'px-4 py-2 text-sm rounded-xl',
    md: 'px-5 py-3 text-sm rounded-2xl',
    lg: 'px-6 py-4 text-base rounded-2xl font-semibold',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`
        inline-flex items-center justify-center font-medium transition-all duration-150
        active:scale-[0.98] disabled:cursor-not-allowed select-none
        ${variants[variant]} ${sizes[size]}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
    >
      {children}
    </button>
  );
}
