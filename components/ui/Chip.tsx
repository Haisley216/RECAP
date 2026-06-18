'use client';

interface ChipProps {
  label: string;
  selected?: boolean;
  onClick?: () => void;
  color?: 'default' | 'green' | 'red' | 'orange';
  size?: 'sm' | 'md';
  className?: string;
}

const colorMap = {
  default: {
    base: 'border-gray-200 text-gray-600 bg-white',
    selected: 'border-primary-500 text-primary-600 bg-primary-50',
  },
  green: {
    base: 'border-gray-200 text-gray-600 bg-white',
    selected: 'border-emerald-400 text-emerald-700 bg-emerald-50',
  },
  red: {
    base: 'border-gray-200 text-gray-600 bg-white',
    selected: 'border-red-400 text-red-600 bg-red-50',
  },
  orange: {
    base: 'border-gray-200 text-gray-600 bg-white',
    selected: 'border-orange-400 text-orange-600 bg-orange-50',
  },
};

export default function Chip({ label, selected, onClick, color = 'default', size = 'md', className = '' }: ChipProps) {
  const c = colorMap[color];
  const sizeClass = size === 'sm' ? 'px-3 py-1 text-xs' : 'px-4 py-2 text-sm';

  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center border rounded-full font-medium transition-all duration-150 select-none
        ${sizeClass}
        ${selected ? c.selected + ' border-2' : c.base + ' border'}
        ${onClick ? 'cursor-pointer active:scale-95' : 'cursor-default'}
        ${className}`}
    >
      {label}
    </button>
  );
}
