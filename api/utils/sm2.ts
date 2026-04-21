// SM-2 Review Algorithm
// https://en.wikipedia.org/wiki/SuperMemo#Description_of_SM-2_algorithm

export function calculateNextReview(
  rating: number, // 1: 忘记, 2: 模糊, 3: 掌握
  currentRepetitions: number,
  currentInterval: number,
  currentEaseFactor: number,
  currentDateStr: string
) {
  let repetitions = currentRepetitions;
  let interval = currentInterval;
  let easeFactor = currentEaseFactor;

  if (rating === 1) { // 忘记
    repetitions = 0;
    interval = 1;
    // easeFactor 不变
  } else if (rating === 2) { // 模糊
    repetitions += 1;
    interval = Math.max(1, interval - 1);
    easeFactor = Math.max(1.3, easeFactor - 0.15);
  } else if (rating === 3) { // 掌握
    repetitions += 1;
    if (repetitions === 1) {
      interval = 1;
    } else if (repetitions === 2) {
      interval = 6;
    } else {
      interval = Math.round(interval * easeFactor);
    }
    easeFactor = easeFactor + 0.1;
  }

  const nextReviewDate = new Date(currentDateStr);
  nextReviewDate.setDate(nextReviewDate.getDate() + interval);

  return {
    nextReviewDate: nextReviewDate.toISOString().split('T')[0],
    interval,
    easeFactor,
    repetitions,
  };
}
