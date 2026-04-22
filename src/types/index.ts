export interface Problem {
  id: number;
  leetcode_id: number | null;
  title: string;
  title_zh: string | null;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  tags: string[];
  url: string | null;
  created_at: string;
  checkins_count?: number;
  last_checkin?: string;
}

export interface Checkin {
  id: number;
  problem_id: number;
  checked_at: string;
  duration_min: number | null;
  status: 'Accepted' | 'WrongAnswer' | 'TimeLimitExceeded';
  note: string | null;
  rating: number | null;
  created_at: string;
}

export interface Review {
  id: number;
  problem_id: number;
  next_review_date: string;
  interval_days: number;
  ease_factor: number;
  repetitions: number;
  last_rating: number | null;
  title?: string;
  title_zh?: string | null;
  difficulty?: 'Easy' | 'Medium' | 'Hard';
  tags?: string[];
}

export interface ProblemDetail extends Problem {
  checkins: Checkin[];
}

export interface OverviewStats {
  total: number;
  completed: number;
  easy: number;
  medium: number;
  hard: number;
  weekly: number;
  monthly: number;
  avg_time: number;
  streak: number;
}

export interface ScatterData {
  date: string;
  time: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  title_zh: string | null;
  title: string;
}
