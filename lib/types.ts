export type InterviewRound = '1차' | '2차' | '3차' | '기타';
export type InterviewerType = '실무진' | '임원' | '혼합';
export type InterviewFormat = '일대일' | '다대일' | '다대다';
export type Atmosphere = '압박' | '우호적' | '무난';
export type Impression = '잘 본 것 같아요' | '무난했어요' | '아쉬워요';

export interface Question {
  id: string;
  question: string;
  answer: string;
  tags: string[];
}

export interface InterviewReview {
  id: string;
  createdAt: string;
  company: string;
  position: string;
  interviewRound: InterviewRound;
  interviewerType: InterviewerType;
  interviewFormat: InterviewFormat;
  atmosphere: Atmosphere;
  impression: Impression;
  questions: Question[];
  goodPoints: string;
  badPoints: string;
  aiReport?: AIReport;
  satisfactionRating?: 'positive' | 'negative';
}

export interface FeedbackItem {
  title: string;
  content: string;
}

export interface ChecklistItem {
  item: string;
  description: string;
}

export interface AIReport {
  interviewCharacteristics: string[];
  feedback: FeedbackItem[];
  checklist: ChecklistItem[];
  expectedQuestions: string[];
  generatedAt: string;
}

export const DEFAULT_TAGS = [
  '공통 질문',
  '면접관이 파고든 질문',
  '예상 못 한 질문',
  '꼬리 질문',
  '당황한 질문',
];

export const IMPRESSION_EMOJI: Record<Impression, string> = {
  '잘 본 것 같아요': '😊',
  '무난했어요': '😐',
  '아쉬워요': '😟',
};
