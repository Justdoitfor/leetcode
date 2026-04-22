import { create } from 'zustand';
import { problemsApi } from '../api/problems.js';
import { checkinsApi } from '../api/checkins.js';
import { reviewsApi } from '../api/reviews.js';
import { statsApi } from '../api/stats.js';
import type { Problem, ProblemDetail, Checkin, Review, OverviewStats, ScatterData } from '../types/index.js';

interface AppState {
  problems: Problem[];
  currentProblem: ProblemDetail | null;
  reviews: Review[];
  stats: OverviewStats | null;
  heatmap: { date: string; count: number }[];
  tagsStats: { name: string; count: number }[];
  weeklyStats: { date: string; Easy: number; Medium: number; Hard: number }[];
  scatterStats: ScatterData[];
  
  loading: boolean;
  error: string | null;
  
  fetchProblems: (params?: { difficulty?: string; tag?: string; search?: string }) => Promise<void>;
  fetchProblem: (id: number) => Promise<void>;
  createProblem: (data: Partial<Problem>) => Promise<Problem>;
  updateProblem: (id: number, data: Partial<Problem>) => Promise<Problem>;
  deleteProblem: (id: number) => Promise<void>;
  
  createCheckin: (data: Partial<Checkin>) => Promise<void>;
  
  fetchTodayReviews: () => Promise<void>;
  respondReview: (id: number, rating: number) => Promise<void>;
  
  fetchStats: () => Promise<void>;
}

export const useAppStore = create<AppState>((set, get) => ({
  problems: [],
  currentProblem: null,
  reviews: [],
  stats: null,
  heatmap: [],
  tagsStats: [],
  weeklyStats: [],
  scatterStats: [],
  
  loading: false,
  error: null,
  
  fetchProblems: async (params) => {
    set({ loading: true, error: null });
    try {
      const data = await problemsApi.list(params);
      set({ problems: data, loading: false });
    } catch (e: any) {
      set({ error: e.message, loading: false });
    }
  },
  
  fetchProblem: async (id) => {
    set({ loading: true, error: null });
    try {
      const data = await problemsApi.get(id);
      set({ currentProblem: data, loading: false });
    } catch (e: any) {
      set({ error: e.message, loading: false });
    }
  },
  
  createProblem: async (data) => {
    set({ loading: true, error: null });
    try {
      const result = await problemsApi.create(data);
      set((state) => ({ problems: [result, ...state.problems], loading: false }));
      return result;
    } catch (e: any) {
      set({ error: e.message, loading: false });
      throw e;
    }
  },
  
  updateProblem: async (id, data) => {
    set({ loading: true, error: null });
    try {
      const result = await problemsApi.update(id, data);
      set((state) => ({ 
        problems: state.problems.map(p => p.id === id ? result : p),
        currentProblem: state.currentProblem?.id === id ? { ...state.currentProblem, ...result } : state.currentProblem,
        loading: false 
      }));
      return result;
    } catch (e: any) {
      set({ error: e.message, loading: false });
      throw e;
    }
  },

  deleteProblem: async (id) => {
    set({ loading: true, error: null });
    try {
      await problemsApi.delete(id);
      set((state) => ({
        problems: state.problems.filter(p => p.id !== id),
        currentProblem: state.currentProblem?.id === id ? null : state.currentProblem,
        loading: false
      }));
    } catch (e: any) {
      set({ error: e.message, loading: false });
      throw e;
    }
  },
  
  createCheckin: async (data) => {
    set({ loading: true, error: null });
    try {
      await checkinsApi.create(data);
      set({ loading: false });
      // Refresh current problem and reviews
      if (get().currentProblem?.id === data.problem_id) {
        await get().fetchProblem(data.problem_id!);
      }
      get().fetchTodayReviews();
    } catch (e: any) {
      set({ error: e.message, loading: false });
      throw e;
    }
  },
  
  fetchTodayReviews: async () => {
    try {
      const data = await reviewsApi.getToday();
      set({ reviews: data });
    } catch (e: any) {
      set({ error: e.message });
    }
  },
  
  respondReview: async (id, rating) => {
    try {
      await reviewsApi.respond(id, rating);
      // Remove review from list
      set((state) => ({
        reviews: state.reviews.filter((r) => r.id !== id)
      }));
    } catch (e: any) {
      set({ error: e.message });
      throw e;
    }
  },
  
  fetchStats: async () => {
    set({ loading: true, error: null });
    try {
      const [overview, heatmap, tags, weekly, scatter] = await Promise.all([
        statsApi.overview(),
        statsApi.heatmap(),
        statsApi.tags(),
        statsApi.weekly(),
        statsApi.scatter()
      ]);
      set({
        stats: overview,
        heatmap,
        tagsStats: tags,
        weeklyStats: weekly,
        scatterStats: scatter,
        loading: false
      });
    } catch (e: any) {
      set({ error: e.message, loading: false });
    }
  }
}));
