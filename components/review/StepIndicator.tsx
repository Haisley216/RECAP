interface StepIndicatorProps {
  current: number;
  total: number;
}

export default function StepIndicator({ current, total }: StepIndicatorProps) {
  return (
    <div className="flex items-center gap-1.5">
      {Array.from({ length: total }, (_, i) => (
        <div
          key={i}
          className={`h-1.5 rounded-full transition-all duration-300 ${
            i + 1 === current
              ? 'w-6 bg-primary-500'
              : i + 1 < current
              ? 'w-3 bg-primary-300'
              : 'w-3 bg-gray-200'
          }`}
        />
      ))}
    </div>
  );
}
