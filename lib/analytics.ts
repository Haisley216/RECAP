type EventParams = Record<string, string | number | boolean | undefined>;

export function track(event: string, params?: EventParams): void {
  if (typeof window === 'undefined') return;
  console.log(`[reco:analytics] ${event}`, params ?? {});
  // TODO: replace with real analytics (e.g. Mixpanel, Amplitude)
}

export const Events = {
  START_REVIEW: 'start_review',
  STEP_COMPLETE: 'step_complete',
  AI_GUIDE_SHOWN: 'ai_guide_shown',
  AI_GUIDE_DISMISSED: 'ai_guide_dismissed',
  AI_GUIDE_ACCEPTED: 'ai_guide_accepted',
  TAG_ADDED: 'tag_added',
  COMPLETE_REVIEW: 'complete_review',
  REPORT_VIEWED: 'report_viewed',
  REPORT_SATISFACTION: 'report_satisfaction',
  REPORT_SHARED: 'report_shared',
  REVIEW_REVISIT: 'review_revisit',
  APP_REVISIT: 'app_revisit',
} as const;
