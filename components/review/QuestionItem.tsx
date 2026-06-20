'use client';

import { Question, DEFAULT_TAGS } from '@/lib/types';
import TagSelector from './TagSelector';

interface QuestionItemProps {
  question: Question;
  index: number;
  onChange: (q: Question) => void;
}

export default function QuestionItem({ question, index, onChange }: QuestionItemProps) {
  return (
    <div className="bg-white rounded-lg shadow-card overflow-hidden">
      <div className="px-5 pt-5 pb-4">
        <input
          value={question.question}
          onChange={(e) => onChange({ ...question, question: e.target.value })}
          placeholder="질문을 입력해주세요"
          className="w-full text-base font-bold text-[#121212] outline-none placeholder:text-[#CCCCCC] bg-transparent"
        />
      </div>
      <div className="px-5 pb-5">
        <textarea
          value={question.answer}
          onChange={(e) => onChange({ ...question, answer: e.target.value })}
          placeholder="나의 답변을 적어주세요"
          rows={6}
          className="w-full text-sm text-[#121212] bg-[#F8FAFD] rounded-lg p-3.5 outline-none resize-none placeholder:text-[#999999]"
        />
      </div>
      <div className="px-5 pb-5">
        <p className="text-sm font-semibold text-[#121212] mb-2.5">태그</p>
        <TagSelector
          selected={question.tags}
          onChange={(tags) => {
            onChange({ ...question, tags });
          }}
        />
      </div>
    </div>
  );
}
