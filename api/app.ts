import { Hono } from 'hono';
import { cors } from 'hono/cors';

import problemsRouter from './routes/problems.js';
import checkinsRouter from './routes/checkins.js';
import reviewsRouter from './routes/reviews.js';
import statsRouter from './routes/stats.js';
import type { Bindings } from './routes/problems.js';

const app = new Hono<{ Bindings: Bindings }>();

app.use('/api/*', cors());

// Routes
app.route('/api/problems', problemsRouter);
app.route('/api/checkins', checkinsRouter);
app.route('/api/reviews', reviewsRouter);
app.route('/api/stats', statsRouter);

export default app;