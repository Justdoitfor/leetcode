import { Hono } from 'hono';
import { cors } from 'hono/cors';

import problemsRouter from './routes/problems';
import checkinsRouter from './routes/checkins';
import reviewsRouter from './routes/reviews';
import statsRouter from './routes/stats';
import type { Bindings } from './routes/problems';

const app = new Hono<{ Bindings: Bindings }>();

app.use('/api/*', cors());

// Routes
app.route('/api/problems', problemsRouter);
app.route('/api/checkins', checkinsRouter);
app.route('/api/reviews', reviewsRouter);
app.route('/api/stats', statsRouter);

export default app;