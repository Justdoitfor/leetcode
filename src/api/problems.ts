import { fetchApi } from './client.js';
import type { Problem, ProblemDetail } from '../types/index.js';

export const problemsApi = {
  list: (params?: { difficulty?: string; tag?: string; search?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.difficulty) searchParams.set('difficulty', params.difficulty);
    if (params?.tag) searchParams.set('tag', params.tag);
    if (params?.search) searchParams.set('search', params.search);
    
    const qs = searchParams.toString();
    return fetchApi<Problem[]>(`/problems${qs ? `?${qs}` : ''}`);
  },
  
  get: (id: number) => fetchApi<ProblemDetail>(`/problems/${id}`),
  
  create: (data: Partial<Problem>) => fetchApi<Problem>('/problems', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  
  update: (id: number, data: Partial<Problem>) => fetchApi<Problem>(`/problems/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),
  
  delete: (id: number) => fetchApi<void>(`/problems/${id}`, { method: 'DELETE' })
};
