import { fetchApi } from './client.js';
import type { OverviewStats } from '../types/index.js';

export const statsApi = {
  overview: () => fetchApi<OverviewStats>('/stats/overview'),
  
  heatmap: () => fetchApi<{ date: string; count: number }[]>('/stats/heatmap'),
  
  tags: () => fetchApi<{ name: string; count: number }[]>('/stats/tags'),
  
  weekly: () => fetchApi<{ date: string; Easy: number; Medium: number; Hard: number }[]>('/stats/weekly')
};
