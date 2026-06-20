import mixpanel from 'mixpanel-browser';

type EventParams = Record<string, string | number | boolean | undefined>;

let initialized = false;

function init(): boolean {
  if (typeof window === 'undefined') return false;
  if (initialized) return true;
  const token = process.env.NEXT_PUBLIC_MIXPANEL_TOKEN;
  if (!token) return false;
  mixpanel.init(token, {
    track_pageview: false,
    persistence: 'localStorage',
  });
  initialized = true;
  return true;
}

export function identify(userId: string): void {
  if (!init()) return;
  mixpanel.identify(userId);
}

export function track(event: string, params?: EventParams): void {
  if (!init()) return;
  mixpanel.track(event, params);
}

export const Events = {
  PAGE_VIEW: 'page_view',
  START_SERVICE: 'start_service',
  SERVICE_REVISIT: 'service_revisit',
  START_REVIEW: 'start_review',
  STEP1_COMPLETED: 'step1_completed',
  QUESTION_ADDED: 'question_added',
  QUESTION_COMPLETED: 'question_completed',
  AI_QUESTION_RECOMMENDED: 'ai_question_recommended',
  AI_QUESTION_ADDED: 'ai_question_added',
  AI_QUESTION_COMPLETED: 'ai_question_completed',
  STEP2_COMPLETED: 'step2_completed',
  STEP3_COMPLETED: 'step3_completed',
  REVIEW_COMPLETED: 'review_completed',
  REVIEW_SATISFIED: 'review_satisfied',
  REVIEW_UNSATISFIED: 'review_unsatisfied',
  REVIEW_SHARED: 'review_shared',
  REVIEW_REVISIT: 'review_revisit',
} as const;
