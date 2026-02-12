'use client';

import { useProgress } from './useProgress';
import { getNearReview, getFarReview, getWeeklyReview, ReviewTask } from '@/lib/review-engine';

export function useReviewSchedule() {
  const { progress } = useProgress();

  const nearReview: ReviewTask = getNearReview(progress);
  const farReview: ReviewTask | null = getFarReview(progress);
  const weeklyReview: ReviewTask = getWeeklyReview(progress);

  return { nearReview, farReview, weeklyReview };
}
