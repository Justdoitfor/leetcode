import { fetchApi } from './client.js';
import type { Review } from '../types/index.js';

export const reviewsApi = {
  getToday: () => fetchApi<Review[]>('/reviews/today'),
  
  respond: (id: number, rating: number) => fetchApi<any>(`/reviews/${id}/respond`, {
    method: 'POST',
    body: JSON.stringify({ rating })
  })
};
