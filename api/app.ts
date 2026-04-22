import { Hono } from 'hono';
import { cors } from 'hono/cors';

import problemsRouter from './routes/problems';
import checkinsRouter from './routes/checkins';
import reviewsRouter from './routes/reviews';
import statsRouter from './routes/stats';
import type { Bindings } from './routes/problems';

const app = new Hono<{ Bindings: Bindings }>();

app.use('/api/*', cors());

// Error handling
app.onError((err, c) => {
  console.error(`[API Error] ${err.message}`, err);
  // Specifically check for D1 database binding errors
  if (err instanceof TypeError && err.message.includes('prepare')) {
    return c.json({ 
      error: 'Database connection failed. Please ensure you have bound the D1 Database to the "DB" variable in Cloudflare Pages Settings -> Settings -> Bindings -> D1 database bindings.',
      details: err.message
    }, 500);
  }
  return c.json({ error: err.message || 'Internal Server Error' }, 500);
});

// Routes
app.route('/api/problems', problemsRouter);
app.route('/api/checkins', checkinsRouter);
app.route('/api/reviews', reviewsRouter);
app.route('/api/stats', statsRouter);

export default app;