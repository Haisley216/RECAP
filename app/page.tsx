'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { InterviewReview } from '@/lib/types';
import { getReviews } from '@/lib/storage';
import { track, Events } from '@/lib/analytics';
import ReviewCard from '@/components/home/ReviewCard';

export default function HomePage() {
  const router = useRouter();
  const [reviews, setReviews] = useState<InterviewReview[]>([]);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    const isAnonymous = localStorage.getItem('rico_started') === 'true';
    if (!isAnonymous) {
      router.replace('/login');
      return;
    }
    setAuthChecked(true);
    setReviews(getReviews());
    track(Events.APP_REVISIT);
  }, [router]);

  const handleNewReview = () => {
    track(Events.START_REVIEW);
    router.push('/review/new');
  };

  const handleCardClick = (review: InterviewReview) => {
    const daysSince = Math.floor(
      (Date.now() - new Date(review.createdAt).getTime()) / (1000 * 60 * 60 * 24)
    );
    track(Events.REVIEW_REVISIT, { review_id: review.id, days_since_created: daysSince });
    router.push(`/review/${review.id}`);
  };

  if (!authChecked) return null;

  return (
    <div className="screen">
      {/* Content */}
      <div className="flex-1 px-[23px] overflow-y-auto pb-32">
        <h2 className="text-lg font-bold text-[#121212] pt-24 pb-5">나의 면접 기록</h2>
        {reviews.length === 0 ? (
          <EmptyState onStart={handleNewReview} />
        ) : (
          <div className="space-y-[15px]">
            {reviews.map((review) => (
              <ReviewCard key={review.id} review={review} onClick={() => handleCardClick(review)} />
            ))}
          </div>
        )}
      </div>

      {/* Bottom CTA */}
      <div className="fixed sm:absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] px-5 pb-12 pt-4 bg-gradient-to-t from-[#F8FAFD] to-transparent pointer-events-none safe-bottom">
        <button
          onClick={handleNewReview}
          className="w-full pointer-events-auto bg-[#00CEC0] text-white font-semibold py-4 rounded-lg shadow-float active:bg-[#00A59A] transition-all active:scale-[0.98] flex items-center justify-center"
        >
          새로운 면접 복기하기
        </button>
      </div>
    </div>
  );
}

function EmptyState({ onStart }: { onStart: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <h3 className="text-[18px] font-semibold text-black mb-2">아직 복기한 면접이 없어요</h3>
      <p className="text-[16px] font-medium text-[#909090] leading-[21px]">
        기억이 휘발되기 전에<br />
        AI와 함께 복기하고 피드백을 받아보세요
      </p>
    </div>
  );
}
