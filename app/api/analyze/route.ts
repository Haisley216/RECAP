import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { InterviewReview, AIReport } from '@/lib/types';

export async function POST(req: NextRequest) {
  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({ error: 'OPENAI_API_KEY not set' }, { status: 503 });
  }
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const review: InterviewReview = await req.json();

  const questionsText = review.questions
    .map(
      (q, i) =>
        `질문 ${i + 1}: ${q.question}\n답변: ${q.answer || '(답변 미입력)'}\n태그: ${q.tags.join(', ') || '없음'}`
    )
    .join('\n\n');

  const userPrompt = `
면접 기본 정보:
- 회사명: ${review.company}
- 직군: ${review.position}
- 면접 유형: ${review.interviewRound}차 / ${review.interviewerType} / ${review.interviewFormat}
- 면접 분위기: ${review.atmosphere}
- 면접 소감: ${review.impression}

질문 및 답변 (총 ${review.questions.length}개):
${questionsText}

나의 회고:
잘한 점: ${review.goodPoints || '(미입력)'}
아쉬운 점: ${review.badPoints || '(미입력)'}
`.trim();

  const systemPrompt = `당신은 취업 준비생의 면접 코치 전문가입니다.
사용자가 제공한 면접 복기 내용을 분석하여 건설적이고 구체적인 피드백을 한국어로 제공합니다.

분석 관점:
- 질문 태그(당황/예상/파고든 질문 등)와 질문 흐름의 맥락
- 직군·도메인 특성 및 면접 유형(실무진/임원 등)
- 답변의 구체성, 논리성, 직무 적합성

출력 원칙:
- 과도한 긍정 표현 자제, 개선 가능한 구체적 액션 아이템 중심
- 반드시 아래 JSON 형식으로만 응답 (다른 텍스트 없이)

{
  "interviewCharacteristics": [
    "회사·직군·질문 흐름을 종합한 이 면접의 특성을 설명하는 문장 (예: 스타트업 특성상 빠른 실행력과 자기주도성을 중점 평가하는 면접이었습니다)",
    "두 번째 특성 문장",
    "세 번째 특성 문장"
  ],
  "feedback": [
    {"title": "제목", "content": "구체적인 피드백 내용"}
  ],
  "checklist": [
    {"item": "체크리스트 항목", "description": "구체적인 준비 방향"}
  ],
  "expectedQuestions": ["예상 질문1", "예상 질문2"]
}

interviewCharacteristics는 정확히 3개의 완성된 문장으로, 회사·직군·면접 유형·질문 흐름을 종합해 이 면접만의 특성을 구체적으로 기술하세요.
feedback·checklist·expectedQuestions는 각 최대 5개.`;

  try {
    const message = await client.chat.completions.create({
      model: 'gpt-4o',
      max_tokens: 2048,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
    });

    const text = message.choices[0].message.content ?? '';
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('Invalid JSON response');

    const parsed = JSON.parse(jsonMatch[0]);
    const report: AIReport = {
      interviewCharacteristics: parsed.interviewCharacteristics?.slice(0, 5) ?? [],
      feedback: parsed.feedback?.slice(0, 5) ?? [],
      checklist: parsed.checklist?.slice(0, 5) ?? [],
      expectedQuestions: parsed.expectedQuestions?.slice(0, 5) ?? [],
      generatedAt: new Date().toISOString(),
    };

    return NextResponse.json(report);
  } catch (err) {
    console.error('[reco:analyze]', err);
    return NextResponse.json({ error: 'Analysis failed' }, { status: 500 });
  }
}
