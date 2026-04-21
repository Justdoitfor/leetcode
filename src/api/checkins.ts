import { fetchApi } from './client.js';
import type { Checkin } from '../types/index.js';

export const checkinsApi = {
  create: (data: Partial<Checkin>) => fetchApi<Checkin>('/checkins', {
    method: 'POST',
    body: JSON.stringify(data)
  })
};
