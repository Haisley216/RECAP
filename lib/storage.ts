import { InterviewReview } from './types';

let memoryReviews: InterviewReview[] = [];
let memoryCustomTags: string[] = [];

export function getReviews(): InterviewReview[] {
  return memoryReviews;
}

export function getReview(id: string): InterviewReview | undefined {
  return memoryReviews.find((r) => r.id === id);
}

export function saveReview(review: InterviewReview): void {
  const idx = memoryReviews.findIndex((r) => r.id === review.id);
  if (idx >= 0) {
    memoryReviews[idx] = review;
  } else {
    memoryReviews = [review, ...memoryReviews];
  }
}

export function deleteReview(id: string): void {
  memoryReviews = memoryReviews.filter((r) => r.id !== id);
}

export function getCustomTags(): string[] {
  return memoryCustomTags;
}

export function saveCustomTag(tag: string): void {
  if (!memoryCustomTags.includes(tag)) {
    memoryCustomTags = [...memoryCustomTags, tag];
  }
}

export function genId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}
