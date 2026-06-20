'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, AlertCircle, CheckCircle2 } from 'lucide-react';
import { InterviewReview, AIReport } from '@/lib/types';
import { getReview, saveReview } from '@/lib/storage';
import { track, Events } from '@/lib/analytics';

type Tab = 'questions' | 'feedback';

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

const impressionStyle: Record<string, { bg: string; color: string }> = {
  '잘 본 것 같아요': { bg: '#DFF1FF', color: '#3DA0F2' },
  '무난했어요': { bg: '#F8F9E7', color: '#E7B73E' },
  '아쉬워요': { bg: '#FFEAE6', color: '#F3816C' },
};

export default function ReportPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const [review, setReview] = useState<InterviewReview | null>(null);
  const [tab, setTab] = useState<Tab>('questions');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const data = getReview(id);
    if (!data) { router.replace('/'); return; }
    setReview(data);
    track(Events.REPORT_VIEWED, { review_id: id });
  }, [id, router]);

  if (!review) return null;

  const { aiReport } = review;
  const imp = impressionStyle[review.impression] ?? { bg: '#F3F4F6', color: '#909090' };

  const handleSatisfaction = (result: 'positive' | 'negative') => {
    track(Events.REPORT_SATISFACTION, { result, review_id: id });
    const updated = { ...review, satisfactionRating: result };
    setReview(updated);
    saveReview(updated);
  };

  const handleShare = async () => {
    const text = buildShareText(review);
    track(Events.REPORT_SHARED, { share_method: 'copy', review_id: id });
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  return (
    <div className="relative flex flex-col bg-[#F8FAFD] h-screen overflow-hidden">
      {/* 뒤로가기 */}
      <button
        onClick={() => router.push('/')}
        className="absolute left-[29px] top-8 z-10 text-[#121212] active:opacity-50 transition-opacity"
      >
        <ArrowLeft size={24} />
      </button>

      {/* 카드 영역 — 헤더 고정 + 콘텐츠 스크롤 */}
      <div className="flex-1 flex flex-col px-5 pt-[72px] pb-[120px] overflow-hidden">
        <div className="bg-white rounded-[10px] shadow-[0px_3px_8px_rgba(0,0,0,0.08)] flex flex-col overflow-hidden h-full">

          {/* 고정 헤더 */}
          <div className="flex-shrink-0 px-[27px] pt-[26px]">
            <p className="font-semibold text-black text-[16px] mb-[13px]">
              {review.company} {review.position}
            </p>

            <div className="flex flex-wrap gap-2 mb-[10px]">
              {review.interviewRound && (
                <span className="text-[14px] font-medium px-3 py-[7px] rounded-[24px] bg-[#d9f8f6] text-[#00a59a]">
                  {roundLabel[review.interviewRound] ?? review.interviewRound}
                </span>
              )}
              {review.interviewerType && (
                <span className="text-[14px] font-medium px-3 py-[7px] rounded-[24px] bg-[#d9f8f6] text-[#00a59a]">
                  {interviewerLabel[review.interviewerType] ?? review.interviewerType}
                </span>
              )}
              {review.interviewFormat && (
                <span className="text-[14px] font-medium px-3 py-[7px] rounded-[24px] bg-[#d9f8f6] text-[#00a59a]">
                  {review.interviewFormat}
                </span>
              )}
              {review.atmosphere && (
                <span className="text-[14px] font-medium px-3 py-[7px] rounded-[24px] bg-[#d9f8f6] text-[#00a59a]">
                  {review.atmosphere}
                </span>
              )}
            </div>

            {review.impression && (
              <span
                className="inline-block text-[14px] font-medium px-3 py-[7px] rounded-[24px] mb-[22px]"
                style={{ backgroundColor: imp.bg, color: imp.color }}
              >
                {review.impression}
              </span>
            )}

            {/* 탭 스위처 */}
            <div className="bg-[#f5f6f8] rounded-[8px] p-[4px] grid grid-cols-2 h-[44px] mb-4">
              <button
                onClick={() => setTab('questions')}
                className={`text-[14px] font-semibold rounded-[8px] transition-all ${
                  tab === 'questions' ? 'bg-white shadow-sm text-black' : 'text-[#727272]'
                }`}
              >
                면접 질문
              </button>
              <button
                onClick={() => setTab('feedback')}
                className={`text-[14px] font-semibold rounded-[8px] transition-all ${
                  tab === 'feedback' ? 'bg-white shadow-sm text-black' : 'text-[#727272]'
                }`}
              >
                AI 분석 피드백
              </button>
            </div>
          </div>

          {/* 스크롤 가능한 탭 콘텐츠 */}
          <div className="flex-1 overflow-y-auto px-[27px] pb-6">
            {tab === 'questions' ? (
              <QuestionsTab review={review} />
            ) : (
              <FeedbackTab
                aiReport={aiReport}
                satisfactionRating={review.satisfactionRating}
                onSatisfaction={handleSatisfaction}
              />
            )}
          </div>

        </div>
      </div>

      {/* 하단 버튼 — 항상 고정 */}
      <div className="absolute bottom-0 left-0 right-0 px-5 pb-12 pt-4 bg-gradient-to-t from-[#F8FAFD] to-transparent safe-bottom pointer-events-none">
        <div className="flex gap-3 pointer-events-auto">
          <button
            onClick={handleShare}
            className="flex-1 py-4 rounded-lg text-base font-semibold bg-[#EFEFEF] text-[#9F9F9F] active:bg-gray-200 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
          >
            {copied ? (
              <><CheckCircle2 size={16} className="text-emerald-500" /> 복사 완료!</>
            ) : (
              '나에게 공유'
            )}
          </button>
          <button
            onClick={() => router.push('/')}
            className="flex-1 py-4 rounded-lg text-base font-semibold bg-[#00CEC0] text-white active:bg-[#00A59A] transition-all active:scale-[0.98]"
          >
            홈으로 돌아가기
          </button>
        </div>
      </div>
    </div>
  );
}

function QuestionsTab({ review }: { review: InterviewReview }) {
  const [openId, setOpenId] = useState<string | null>(null);

  if (review.questions.length === 0) {
    return (
      <p className="text-sm text-[#909090] text-center py-6">기록된 질문이 없어요</p>
    );
  }
  return (
    <div className="space-y-[8px]">
      {review.questions.map((q) => {
        const isOpen = openId === q.id;
        return (
          <button
            key={q.id}
            onClick={() => setOpenId(isOpen ? null : q.id)}
            className="w-full text-left bg-[#f8f8f8] rounded-[10px] px-[22px] py-[13px] active:opacity-70 transition-opacity"
          >
            <div className="flex items-center justify-between gap-3">
              <p className="text-[14px] font-semibold text-black">{q.question}</p>
              <span className={`text-[#999999] text-[18px] leading-none shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>
                ›
              </span>
            </div>
            {isOpen && (
              <div className="mt-3 pt-3 border-t border-[#e8e8e8]">
                {q.answer.trim() ? (
                  <p className="text-[13px] text-[#444444] leading-relaxed whitespace-pre-wrap">{q.answer}</p>
                ) : (
                  <p className="text-[13px] text-[#999999]">입력된 답변이 없어요</p>
                )}
                {q.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2.5">
                    {q.tags.map((tag) => (
                      <span key={tag} className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-[#D9F8F6] text-[#00A59A]">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}

function FeedbackTab({
  aiReport,
  satisfactionRating,
  onSatisfaction,
}: {
  aiReport?: AIReport;
  satisfactionRating?: 'positive' | 'negative';
  onSatisfaction: (result: 'positive' | 'negative') => void;
}) {
  if (!aiReport) {
    return (
      <div className="bg-[#f8f8f8] rounded-[10px] p-6 text-center">
        <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center mx-auto mb-3">
          <AlertCircle size={24} className="text-gray-400" />
        </div>
        <p className="text-sm font-semibold text-gray-600">AI 분석을 불러오지 못했어요</p>
        <p className="text-xs text-gray-400 mt-1">환경 변수에 OPENAI_API_KEY를 설정해주세요</p>
      </div>
    );
  }

  return (
    <div className="space-y-[8px]">
      {/* 이번 면접 특성 */}
      <div className="bg-[#f8f8f8] rounded-[10px] px-[22px] py-[16px]">
        <p className="text-[14px] font-semibold text-black mb-3">이번 면접 특성</p>
        <div className="space-y-2.5">
          {aiReport.interviewCharacteristics.map((char, i) => (
            <div key={i} className="flex gap-2.5 items-start">
              <span className="text-xs font-bold text-[#00CEC0] mt-0.5 shrink-0">
                {String(i + 1).padStart(2, '0')}
              </span>
              <p className="text-[13px] text-[#444444] leading-relaxed">{char}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 나의 답변 피드백 */}
      <div className="bg-[#f8f8f8] rounded-[10px] px-[22px] py-[16px]">
        <p className="text-[14px] font-semibold text-black mb-3">나의 답변 피드백</p>
        <div className="space-y-2.5">
          {aiReport.feedback.map((fb, i) => (
            <div key={i} className="bg-orange-50 rounded-lg p-3 border border-orange-100">
              <p className="text-sm font-semibold text-orange-800 mb-1">{i + 1}. {fb.title}</p>
              <p className="text-[13px] text-orange-700 leading-relaxed">{fb.content}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 다음 면접 체크리스트 */}
      <div className="bg-[#f8f8f8] rounded-[10px] px-[22px] py-[16px]">
        <p className="text-[14px] font-semibold text-black mb-3">다음 면접 체크리스트</p>
        <div className="space-y-2.5">
          {aiReport.checklist.map((item, i) => (
            <div key={i} className="flex items-start gap-2.5">
              <div className="w-5 h-5 rounded border-2 border-emerald-300 bg-emerald-50 shrink-0 mt-0.5" />
              <div>
                <p className="text-[13px] font-semibold text-gray-800">{item.item}</p>
                <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 예상 응용 질문 */}
      <div className="bg-[#f8f8f8] rounded-[10px] px-[22px] py-[16px]">
        <p className="text-[14px] font-semibold text-black mb-3">예상 응용 질문</p>
        <div className="space-y-2">
          {aiReport.expectedQuestions.map((q, i) => (
            <div key={i} className="bg-blue-50 rounded-lg px-3 py-2.5 border border-blue-100">
              <p className="text-[13px] text-blue-800">
                <span className="font-bold text-blue-500">Q{i + 1}.</span> {q}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* 만족도 */}
      <div className="bg-[#f8f8f8] rounded-[10px] px-[22px] py-[16px]">
        <p className="text-[14px] font-semibold text-black mb-3">AI 분석 피드백이 도움됐나요?</p>
        <div className="flex gap-3">
          <button
            onClick={() => onSatisfaction('positive')}
            className={`flex-1 flex items-center justify-center gap-2 h-[40px] rounded-[8px] text-sm font-medium transition-all ${
              satisfactionRating === 'positive'
                ? 'bg-[#D9F8F6] text-black'
                : 'bg-white text-black active:opacity-70'
            }`}
          >
            <img src="/도움됐어요.svg" alt="도움됐어요" width={20} height={20} /> 도움됐어요
          </button>
          <button
            onClick={() => onSatisfaction('negative')}
            className={`flex-1 flex items-center justify-center gap-2 h-[40px] rounded-[8px] text-sm font-medium transition-all ${
              satisfactionRating === 'negative'
                ? 'bg-[#D9F8F6] text-black'
                : 'bg-white text-black active:opacity-70'
            }`}
          >
            <img src="/아쉬워요.svg" alt="아쉬워요" width={20} height={20} /> 아쉬워요
          </button>
        </div>
      </div>
    </div>
  );
}

function buildShareText(review: InterviewReview): string {
  const { aiReport } = review;
  if (!aiReport) return `[rico] ${review.company} 면접 복기 완료`;

  return `[rico] ${review.company} ${review.position} 면접 AI 분석

📌 이번 면접 특성
${aiReport.interviewCharacteristics.map((c, i) => `${i + 1}. ${c}`).join('\n')}

💬 답변 피드백
${aiReport.feedback.map((f, i) => `${i + 1}. ${f.title}\n   ${f.content}`).join('\n')}

✅ 다음 면접 체크리스트
${aiReport.checklist.map((c) => `☐ ${c.item}`).join('\n')}

💡 예상 응용 질문
${aiReport.expectedQuestions.map((q, i) => `Q${i + 1}. ${q}`).join('\n')}

— rico AI 면접 회고 서비스`;
}
