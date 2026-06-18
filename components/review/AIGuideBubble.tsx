'use client';

interface AIGuideBubbleProps {
  message: string;
  onAccept: () => void;
}

export default function AIGuideBubble({ message, onAccept }: AIGuideBubbleProps) {
  return (
    <div className="bg-primary-50 rounded-lg px-4 py-3.5 flex items-center justify-between gap-3 animate-in slide-in-from-bottom-2 duration-200">
      <div>
        <p className="text-xs font-semibold text-primary-600 mb-0.5">AI 추천</p>
        <p className="text-base font-medium text-[#121212]">{message}</p>
      </div>
      <button
        onClick={onAccept}
        className="w-10 h-10 shrink-0 rounded-xl bg-primary-500 text-white flex items-center justify-center active:bg-primary-700 transition-colors"
      >
        <span className="text-2xl font-bold leading-none -translate-y-[1px]">+</span>
      </button>
    </div>
  );
}
