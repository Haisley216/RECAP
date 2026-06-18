import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: NextRequest) {
  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({ message: null, question: null });
  }

  const { company, position, interviewRound, interviewerType, interviewFormat, questions } = await req.json();

  const questionList = questions.map((q: { question: string }, i: number) => `${i + 1}. ${q.question}`).join('\n');
  const lastQuestion = questions[questions.length - 1]?.question ?? '';

  const prompt = `
면접 정보:
- 회사: ${company}
- 직군: ${position}
- 면접 전형: ${interviewRound || '미입력'}
- 면접관 구성: ${interviewerType || '미입력'}
- 면접 방식: ${interviewFormat || '미입력'}

사용자가 이미 기록한 질문들:
${questionList}

마지막 질문: "${lastQuestion}"

역할: 위 면접에서 사용자가 받았을 가능성이 높은 질문 중, 아직 기록하지 않은 것을 하나 추천하세요.

조건:
1. 회사명, 직군, 면접 형식을 고려해 실제로 나올 법한 구체적인 질문을 추천하세요.
2. 이미 기록된 질문과 중복되지 않아야 합니다.
3. 마지막 질문에 꼬리질문이 나올 법하다면 우선 추천하세요. 단, 꼬리질문 추천은 전체 대화 흐름에서 1회를 초과하지 마세요.
4. 확신이 없으면 절대 추천하지 마세요.
5. message는 "~한 질문이 있었나요?" 형태로, question은 실제 질문 텍스트로 작성하세요.

응답 형식 (JSON만, 다른 텍스트 없이):
성공 시: {"message": "가이드 버블 텍스트", "question": "실제 질문 텍스트"}
불확실 시: {"message": null, "question": null}
`.trim();

  try {
    const response = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      max_tokens: 200,
      messages: [{ role: 'user', content: prompt }],
    });

    const text = response.choices[0].message.content ?? '';
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) return NextResponse.json({ message: null, question: null });

    const parsed = JSON.parse(match[0]);
    return NextResponse.json({
      message: parsed.message ?? null,
      question: parsed.question ?? null,
    });
  } catch {
    return NextResponse.json({ message: null, question: null });
  }
}
