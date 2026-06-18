'use client';

import { InterviewReview } from '@/lib/types';

interface ReviewCardProps {
  review: InterviewReview;
  onClick: () => void;
}

const impressionStyle: Record<string, string> = {
  '잘 본 것 같아요': 'text-[#3DA0F2]',
  '무난했어요': 'text-[#E7B73E]',
  '아쉬워요': 'text-[#F3816C]',
};

const impressionBg: Record<string, string> = {
  '잘 본 것 같아요': '#DFF1FF',
  '무난했어요': '#F8F9E7',
  '아쉬워요': '#FFEAE6',
};

const roundLabel: Record<string, string> = {
  '1차': '1차 면접',
  '2차': '2차 면접',
  '3차': '3차 면접',
  '기타': '기타',
};

const interviewerLabel: Record<string, string> = {
  '실무진': '실무 면접',
  '임원': '임원 면접',
  '혼합': '혼합 면접',
};

export default function ReviewCard({ review, onClick }: ReviewCardProps) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-white rounded-[10px] pl-[27px] pr-4 pt-[26px] pb-5 shadow-[0px_3px_8px_rgba(0,0,0,0.08)] active:scale-[0.99] transition-transform"
    >
      <p className="font-semibold text-black text-[16px] mb-[13px]">
        {review.company} {review.position}
      </p>
      <div className="flex flex-wrap gap-2">
        {review.interviewRound && (
          <span className="text-[14px] font-medium px-3 py-[7px] rounded-[24px] bg-primary-50 text-primary-600">
            {roundLabel[review.interviewRound] ?? review.interviewRound}
          </span>
        )}
        {review.interviewerType && (
          <span className="text-[14px] font-medium px-3 py-[7px] rounded-[24px] bg-primary-50 text-primary-600">
            {interviewerLabel[review.interviewerType] ?? review.interviewerType}
          </span>
        )}
        {review.impression && (
          <span
            className={`text-[14px] font-medium px-3 py-[7px] rounded-[24px] ${impressionStyle[review.impression] ?? 'text-gray-500'}`}
            style={{ backgroundColor: impressionBg[review.impression] ?? '#F3F4F6' }}
          >
            {review.impression}
          </span>
        )}
      </div>
    </button>
  );
}
