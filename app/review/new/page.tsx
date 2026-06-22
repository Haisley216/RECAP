'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, ArrowLeft } from 'lucide-react';
import {
  InterviewReview, Question,
  InterviewRound, InterviewerType, InterviewFormat,
  Atmosphere, Impression,
} from '@/lib/types';
import { saveReview, genId } from '@/lib/storage';
import { track, Events } from '@/lib/analytics';
import AIGuideBubble from '@/components/review/AIGuideBubble';
import QuestionItem from '@/components/review/QuestionItem';

interface ActiveGuide {
  message: string;
  questionText: string;
}

type AccordionSection = 'company' | 'format' | 'atmosphere';

function createQuestion(overrides: Partial<Question> = {}): Question {
  return { id: genId(), question: '', answer: '', tags: [], ...overrides };
}

const roundLabels: Record<string, string> = {
  '1차': '1차 면접', '2차': '2차 면접', '3차': '3차 면접', '기타': '기타',
};
const interviewerLabels: Record<string, string> = {
  '실무진': '실무 면접', '임원': '임원 면접', '혼합': '혼합 면접',
};

export default function NewReviewPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Step 1
  const [company, setCompany] = useState('');
  const [position, setPosition] = useState('');
  const [interviewRound, setInterviewRound] = useState<InterviewRound | ''>('');
  const [interviewerType, setInterviewerType] = useState<InterviewerType | ''>('');
  const [interviewFormat, setInterviewFormat] = useState<InterviewFormat | ''>('');
  const [atmosphere, setAtmosphere] = useState<Atmosphere | ''>('');
  const [impression, setImpression] = useState<Impression | ''>('');
  const [openSection, setOpenSection] = useState<AccordionSection>('company');

  // Step 2
  const [questions, setQuestions] = useState<Question[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [guide, setGuide] = useState<ActiveGuide | null>(null);
  const shownGuides = useRef<Set<string>>(new Set());
  const suggestTimeout = useRef<NodeJS.Timeout | null>(null);
  const tailQuestionShown = useRef(false);
  const aiGuidedIds = useRef<Set<string>>(new Set());

  // Step 3
  const [goodPoints, setGoodPoints] = useState('');
  const [badPoints, setBadPoints] = useState('');
  const [loading, setLoading] = useState(false);

  const DRAFT_KEY = 'recap_new_draft';

  // 드래프트 복원
  useEffect(() => {
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (!raw) return;
      const d = JSON.parse(raw);
      if (d.step) setStep(d.step);
      if (d.company) setCompany(d.company);
      if (d.position) setPosition(d.position);
      if (d.interviewRound) setInterviewRound(d.interviewRound);
      if (d.interviewerType) setInterviewerType(d.interviewerType);
      if (d.interviewFormat) setInterviewFormat(d.interviewFormat);
      if (d.atmosphere) setAtmosphere(d.atmosphere);
      if (d.impression) setImpression(d.impression);
      if (d.openSection) setOpenSection(d.openSection);
      if (d.questions) setQuestions(d.questions);
      if (d.goodPoints !== undefined) setGoodPoints(d.goodPoints);
      if (d.badPoints !== undefined) setBadPoints(d.badPoints);
    } catch {}
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 드래프트 저장
  useEffect(() => {
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify({
        step, company, position, interviewRound, interviewerType, interviewFormat,
        atmosphere, impression, openSection, questions, goodPoints, badPoints,
      }));
    } catch {}
  }, [step, company, position, interviewRound, interviewerType, interviewFormat,
      atmosphere, impression, openSection, questions, goodPoints, badPoints]);

  useEffect(() => {
    if (step !== 2) return;

    const filledQ = questions.filter((q) => q.question.trim());

    if (suggestTimeout.current) clearTimeout(suggestTimeout.current);

    // Rule 1: 질문 없음 → 자기소개
    if (filledQ.length === 0) {
      const msg = '1분 자기소개가 있었나요?';
      if (!shownGuides.current.has(msg)) {
        setGuide({ message: msg, questionText: '1분 자기소개를 해주세요' });
      }
      return;
    }

    // Rule 2: 자기소개 하나만 있음 → 지원동기
    const hasSelfIntroOnly =
      filledQ.length === 1 && filledQ[0].question.includes('자기소개');
    if (hasSelfIntroOnly) {
      const msg = '지원 동기 질문이 있었나요?';
      if (!shownGuides.current.has(msg)) {
        setGuide({ message: msg, questionText: '지원 동기가 무엇인가요?' });
      }
      return;
    }

    // Rule 3: AI 동적 추천 (debounce 2s)
    setGuide(null);
    suggestTimeout.current = setTimeout(async () => {
      try {
        const res = await fetch('/api/suggest', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            company, position, interviewRound, interviewerType, interviewFormat,
            questions: filledQ,
            tailQuestionShown: tailQuestionShown.current,
          }),
        });
        if (!res.ok) return;
        const { message, question } = await res.json();
        if (message && question && !shownGuides.current.has(message)) {
          setGuide({ message, questionText: question });
        }
      } catch {
        // 추천 실패 시 가이드 숨김
      }
    }, 2000);

    return () => { if (suggestTimeout.current) clearTimeout(suggestTimeout.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [questions, step]);

  useEffect(() => {
    if (!guide) return;
    const isPreset = guide.message.includes('자기소개') || guide.message.includes('지원 동기');
    track(Events.AI_QUESTION_RECOMMENDED, {
      question_text: guide.questionText,
      guide_type: isPreset ? 'preset' : 'ai_dynamic',
    });
  }, [guide]);

  const handleGuideAccept = () => {
    if (!guide) return;
    shownGuides.current.add(guide.message);
    if (guide.questionText.includes('꼬리') || guide.message.includes('꼬리')) {
      tailQuestionShown.current = true;
    }
    track(Events.AI_QUESTION_ADDED, {
      question_text: guide.questionText,
      question_index: questions.length,
    });
    const newQ = createQuestion({ question: guide.questionText });
    aiGuidedIds.current.add(newQ.id);
    setQuestions((prev) => [...prev, newQ]);
    setEditingId(newQ.id);
    setGuide(null);
    setTimeout(() => scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' }), 100);
  };

  const addQuestion = () => {
    const newQ = createQuestion();
    track(Events.QUESTION_ADDED, { question_index: questions.length });
    setQuestions((prev) => [...prev, newQ]);
    setEditingId(newQ.id);
    setTimeout(() => scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' }), 100);
  };

  const updateQuestion = (id: string, updated: Question) => {
    setQuestions((prev) => prev.map((q) => (q.id === id ? updated : q)));
  };

  const completeEdit = () => {
    if (editingId) {
      const q = questions.find((q) => q.id === editingId);
      if (q && !q.question.trim()) {
        setQuestions((prev) => prev.filter((q) => q.id !== editingId));
      } else if (q) {
        const isAiGuided = aiGuidedIds.current.has(editingId);
        track(isAiGuided ? Events.AI_QUESTION_COMPLETED : Events.QUESTION_COMPLETED, {
          has_answer: q.answer.trim().length > 0,
          answer_length: q.answer.trim().length,
          tag_count: q.tags.length,
        });
      }
    }
    setEditingId(null);
  };

  const goNext = () => {
    if (step === 1) {
      track(Events.STEP1_COMPLETED);
    } else if (step === 2) {
      track(Events.STEP2_COMPLETED);
    }
    setStep((s) => s + 1);
    setEditingId(null);
    scrollRef.current?.scrollTo({ top: 0 });
  };

  const goBack = () => {
    if (step === 2 && editingId !== null) {
      completeEdit();
      scrollRef.current?.scrollTo({ top: 0 });
    } else if (step > 1) {
      setStep((s) => s - 1);
      scrollRef.current?.scrollTo({ top: 0 });
    } else {
      router.back();
    }
  };

  const canGoNext1 = company.trim() && position.trim();
  const filledQuestions = questions.filter((q) => q.question.trim());
  const canGoNext2 = filledQuestions.length > 0 && editingId === null;

  const handleCompleteReview = async () => {
    track(Events.STEP3_COMPLETED, { question_count: filledQuestions.length, tag_count: filledQuestions.reduce((n, q) => n + q.tags.length, 0) });

    const review: InterviewReview = {
      id: genId(),
      createdAt: new Date().toISOString(),
      company,
      position,
      interviewRound: interviewRound as InterviewRound,
      interviewerType: interviewerType as InterviewerType,
      interviewFormat: interviewFormat as InterviewFormat,
      atmosphere: atmosphere as Atmosphere,
      impression: impression as Impression,
      questions: filledQuestions,
      goodPoints,
      badPoints,
    };

    saveReview(review);
    localStorage.removeItem(DRAFT_KEY);
    setLoading(true);

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(review),
      });
      if (res.ok) {
        const aiReport = await res.json();
        review.aiReport = aiReport;
        saveReview(review);
      }
    } catch {
      // AI 분석 실패해도 복기 데이터는 저장됨
    }

    router.push(`/review/${review.id}`);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-white gap-4">
        <Loader2 size={40} className="text-primary-500 animate-spin" />
        <div className="text-center">
          <p className="text-base font-semibold text-[#121212]">AI가 분석 중이에요</p>
          <p className="text-sm text-[#999999] mt-1">면접 내용을 꼼꼼히 살펴보고 있어요</p>
        </div>
      </div>
    );
  }

  return (
    <div className="screen relative">
      {/* Back button */}
      <button
        onClick={goBack}
        className="absolute left-[29px] top-8 z-10 text-[#121212] active:opacity-50 transition-opacity"
      >
        <ArrowLeft size={24} />
      </button>

      {/* Content */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 pt-24 space-y-3 pb-32">
        {step === 1 && (
          <Step1
            company={company} setCompany={setCompany}
            position={position} setPosition={setPosition}
            interviewRound={interviewRound} setInterviewRound={setInterviewRound}
            interviewerType={interviewerType} setInterviewerType={setInterviewerType}
            interviewFormat={interviewFormat} setInterviewFormat={setInterviewFormat}
            atmosphere={atmosphere} setAtmosphere={setAtmosphere}
            impression={impression} setImpression={setImpression}
            openSection={openSection} setOpenSection={setOpenSection}
          />
        )}
        {step === 2 && (
          <Step2
            questions={questions}
            editingId={editingId}
            guide={guide}
            onGuideAccept={handleGuideAccept}
            onUpdateQuestion={updateQuestion}
            onAddQuestion={addQuestion}
            onStartEdit={setEditingId}
          />
        )}
        {step === 3 && (
          <Step3
            goodPoints={goodPoints} setGoodPoints={setGoodPoints}
            badPoints={badPoints} setBadPoints={setBadPoints}
          />
        )}
      </div>

      {/* Bottom CTA */}
      <div className="fixed sm:absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] px-5 pb-12 pt-4 bg-gradient-to-t from-[#F8FAFD] to-transparent safe-bottom">
        {step === 1 && (
          <CtaButton onClick={goNext} disabled={!canGoNext1}>다음</CtaButton>
        )}
        {step === 2 && editingId !== null && (
          <CtaButton onClick={completeEdit} disabled={!questions.find(q => q.id === editingId)?.question.trim()}>완료</CtaButton>
        )}
        {step === 2 && editingId === null && (
          <CtaButton onClick={goNext} disabled={!canGoNext2}>다음</CtaButton>
        )}
        {step === 3 && (
          <CtaButton onClick={handleCompleteReview}>AI 분석 받기</CtaButton>
        )}
      </div>
    </div>
  );
}

/* ── Step 1 ───────────────────────────────────── */
function Step1({
  company, setCompany, position, setPosition,
  interviewRound, setInterviewRound,
  interviewerType, setInterviewerType,
  interviewFormat, setInterviewFormat,
  atmosphere, setAtmosphere,
  impression, setImpression,
  openSection, setOpenSection,
}: {
  company: string; setCompany: (v: string) => void;
  position: string; setPosition: (v: string) => void;
  interviewRound: string; setInterviewRound: (v: InterviewRound) => void;
  interviewerType: string; setInterviewerType: (v: InterviewerType) => void;
  interviewFormat: string; setInterviewFormat: (v: InterviewFormat) => void;
  atmosphere: string; setAtmosphere: (v: Atmosphere) => void;
  impression: string; setImpression: (v: Impression) => void;
  openSection: AccordionSection; setOpenSection: (s: AccordionSection) => void;
}) {
  return (
    <>
      <h2 className="text-lg font-bold text-[#121212] mb-1">면접 정보를 입력해주세요</h2>

      {/* 기업 정보 */}
      <AccordionCard
        title="기업 정보"
        isOpen={openSection === 'company'}
        onToggle={() => setOpenSection('company')}
      >
        <div className="space-y-3">
          <div>
            <label className="text-sm font-semibold text-[#121212] mb-1.5 block">기업명</label>
            <input
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="예) 네이버"
              className="input-field"
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-[#121212] mb-1.5 block">직군</label>
            <input
              value={position}
              onChange={(e) => setPosition(e.target.value)}
              placeholder="예) 프로덕트 매니저"
              className="input-field"
            />
          </div>
        </div>
      </AccordionCard>

      {/* 면접 형식 */}
      <AccordionCard
        title="면접 형식"
        isOpen={openSection === 'format'}
        onToggle={() => setOpenSection('format')}
      >
        <div className="space-y-4">
          <div>
            <p className="text-sm font-semibold text-[#121212] mb-2">면접 전형</p>
            <ChipGroup
              options={['1차', '2차', '3차', '기타'] as InterviewRound[]}
              value={interviewRound}
              onChange={(v) => setInterviewRound(v as InterviewRound)}
              labelMap={roundLabels}
            />
          </div>
          <div>
            <p className="text-sm font-semibold text-[#121212] mb-2">면접관 구성</p>
            <ChipGroup
              options={['실무진', '임원', '혼합'] as InterviewerType[]}
              value={interviewerType}
              onChange={(v) => setInterviewerType(v as InterviewerType)}
              labelMap={interviewerLabels}
            />
          </div>
          <div>
            <p className="text-sm font-semibold text-[#121212] mb-2">면접 방식</p>
            <ChipGroup
              options={['일대일', '다대일', '다대다'] as InterviewFormat[]}
              value={interviewFormat}
              onChange={(v) => setInterviewFormat(v as InterviewFormat)}
            />
          </div>
        </div>
      </AccordionCard>

      {/* 면접 분위기 */}
      <AccordionCard
        title="면접 분위기"
        isOpen={openSection === 'atmosphere'}
        onToggle={() => setOpenSection('atmosphere')}
      >
        <div className="space-y-4">
          <div>
            <p className="text-sm font-semibold text-[#121212] mb-2">면접관 분위기</p>
            <ChipGroup
              options={['무난', '우호적', '압박'] as Atmosphere[]}
              value={atmosphere}
              onChange={(v) => setAtmosphere(v as Atmosphere)}
            />
          </div>
          <div>
            <p className="text-sm font-semibold text-[#121212] mb-2">면접 소감</p>
            <ChipGroup
              options={['잘 본 것 같아요', '무난했어요', '아쉬워요'] as Impression[]}
              value={impression}
              onChange={(v) => setImpression(v as Impression)}
            />
          </div>
        </div>
      </AccordionCard>
    </>
  );
}

/* ── Step 2 ───────────────────────────────────── */
function Step2({
  questions, editingId, guide,
  onGuideAccept, onUpdateQuestion, onAddQuestion, onStartEdit,
}: {
  questions: Question[];
  editingId: string | null;
  guide: ActiveGuide | null;
  onGuideAccept: () => void;
  onUpdateQuestion: (id: string, q: Question) => void;
  onAddQuestion: () => void;
  onStartEdit: (id: string) => void;
}) {
  if (editingId !== null) {
    const q = questions.find((q) => q.id === editingId);
    if (q) {
      return (
        <>
          <h2 className="text-lg font-bold text-[#121212] mb-1">면접 질문과 답변을 복기해보세요</h2>
          <QuestionItem
            question={q}
            index={questions.findIndex((item) => item.id === editingId)}
            onChange={(updated) => onUpdateQuestion(q.id, updated)}
          />
        </>
      );
    }
  }

  return (
    <>
      <h2 className="text-lg font-bold text-[#121212] mb-1">면접 질문과 답변을 복기해보세요</h2>

      {questions.filter((q) => q.question.trim()).map((q) => (
        <button
          key={q.id}
          onClick={() => onStartEdit(q.id)}
          className="w-full text-left bg-white rounded-lg p-4 shadow-card active:scale-[0.99] transition-transform"
        >
          <p className="text-base font-bold text-[#121212]">{q.question}</p>
        </button>
      ))}

      <button
        onClick={onAddQuestion}
        className="w-full py-4 border-2 border-dashed border-gray-200 rounded-lg text-sm text-[#999999] font-medium flex items-center justify-center gap-2 active:bg-gray-50"
      >
        + 질문 추가하기
      </button>

      {guide && (
        <div className="!mt-10">
          <AIGuideBubble
            message={guide.message}
            onAccept={onGuideAccept}
          />
        </div>
      )}
    </>
  );
}

/* ── Step 3 ───────────────────────────────────── */
function Step3({
  goodPoints, setGoodPoints, badPoints, setBadPoints,
}: {
  goodPoints: string; setGoodPoints: (v: string) => void;
  badPoints: string; setBadPoints: (v: string) => void;
}) {
  return (
    <>
      <h2 className="text-lg font-bold text-[#121212] mb-1">이번 면접은 어떠셨나요?</h2>

      <div className="bg-white rounded-lg p-4 shadow-card space-y-4">
        <div>
          <label className="text-sm font-semibold text-[#121212] mb-2 block">잘한 점</label>
          <textarea
            value={goodPoints}
            onChange={(e) => setGoodPoints(e.target.value)}
            placeholder="이번 면접에서 잘했다고 생각하는 부분을 적어주세요"
            rows={7}
            className="w-full text-sm text-[#121212] bg-[#F8FAFD] rounded-lg px-3.5 py-2.5 outline-none resize-none placeholder:text-[#999999]"
          />
        </div>

        <div>
          <label className="text-sm font-semibold text-[#121212] mb-2 block">아쉬운 점</label>
          <textarea
            value={badPoints}
            onChange={(e) => setBadPoints(e.target.value)}
            placeholder="다음에는 더 잘하고 싶은 부분을 적어주세요"
            rows={7}
            className="w-full text-sm text-[#121212] bg-[#F8FAFD] rounded-lg px-3.5 py-2.5 outline-none resize-none placeholder:text-[#999999]"
          />
        </div>
      </div>
    </>
  );
}

/* ── Helpers ──────────────────────────────────── */
function AccordionCard({
  title, isOpen, onToggle, children,
}: {
  title: string; isOpen: boolean; onToggle: () => void; children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-lg shadow-card overflow-hidden">
      <button
        type="button"
        onClick={onToggle}
        className="w-full text-left px-4 py-4 flex items-center justify-between"
      >
        <span className="text-base font-bold text-[#121212]">{title}</span>
      </button>
      <div
        className={`grid transition-all duration-200 ease-in-out ${isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}
      >
        <div className="overflow-hidden">
          <div className="px-4 pb-4">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

function ChipGroup<T extends string>({
  options, value, onChange, labelMap,
}: {
  options: T[]; value: string; onChange: (v: T) => void; labelMap?: Record<string, string>;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => {
        const label = labelMap?.[opt] ?? opt;
        const selected = value === opt;
        return (
          <button
            key={opt}
            type="button"
            onClick={() => onChange(opt)}
            className={`px-4 py-2 text-sm rounded-full border font-medium transition-all duration-150 active:scale-95 ${
              selected
                ? 'border-primary-500 text-primary-600 bg-primary-50'
                : 'border-gray-200 text-[#999999] bg-white'
            }`}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}

function CtaButton({
  children, onClick, disabled,
}: {
  children: React.ReactNode; onClick: () => void; disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="w-full py-4 rounded-lg text-base font-semibold transition-all active:scale-[0.98] disabled:cursor-not-allowed bg-[#00CEC0] text-white disabled:bg-gray-200 disabled:text-[#999999] active:bg-[#00A59A]"
    >
      {children}
    </button>
  );
}
