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
  START_REVIEW: 'start_review',
  STEP_COMPLETE: 'step_complete',
  STEP1_SECTION_COMPLETE: 'step1_section_complete',
  AI_GUIDE_SHOWN: 'ai_guide_shown',
  AI_GUIDE_DISMISSED: 'ai_guide_dismissed',
  AI_GUIDE_ACCEPTED: 'ai_guide_accepted',
  QUESTION_ADDED: 'question_added',
  QUESTION_COMPLETED: 'question_completed',
  TAG_ADDED: 'tag_added',
  TAG_REMOVED: 'tag_removed',
  CUSTOM_TAG_CREATED: 'custom_tag_created',
  COMPLETE_REVIEW: 'complete_review',
  REPORT_VIEWED: 'report_viewed',
  REPORT_SATISFACTION: 'report_satisfaction',
  REPORT_SHARED: 'report_shared',
  REVIEW_REVISIT: 'review_revisit',
  APP_REVISIT: 'app_revisit',
} as const;
