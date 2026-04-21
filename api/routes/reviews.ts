import { Hono } from 'hono';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import { calculateNextReview } from '../utils/sm2';
import type { Bindings } from './problems';

const app = new Hono<{ Bindings: Bindings }>();

const respondSchema = z.object({
  rating: z.number().min(1).max(3),
});

// GET /api/reviews/today
app.get('/today', async (c) => {
  const today = new Date().toISOString().split('T')[0];
  const query = `
    SELECT r.*, p.title, p.title_zh, p.difficulty, p.tags
    FROM reviews r
    JOIN problems p ON r.problem_id = p.id
    WHERE r.next_review_date <= ?
    ORDER BY r.next_review_date ASC, p.difficulty DESC
  `;
  const { results } = await c.env.DB.prepare(query).bind(today).all();

  return c.json(results.map((row: any) => ({
    ...row,
    tags: row.tags ? JSON.parse(row.tags) : []
  })));
});

// POST /api/reviews/:id/respond
app.post('/:id/respond', zValidator('json', respondSchema), async (c) => {
  const id = c.req.param('id');
  const { rating } = c.req.valid('json');
  const today = new Date().toISOString().split('T')[0];

  try {
    const review = await c.env.DB.prepare('SELECT * FROM reviews WHERE id = ?').bind(id).first() as any;
    if (!review) return c.json({ error: 'Review not found' }, 404);

    const sm2 = calculateNextReview(
      rating,
      review.repetitions,
      review.interval_days,
      review.ease_factor,
      today
    );

    await c.env.DB.prepare(`
      UPDATE reviews 
      SET next_review_date = ?, interval_days = ?, ease_factor = ?, repetitions = ?, last_rating = ?
      WHERE id = ?
    `).bind(
      sm2.nextReviewDate,
      sm2.interval,
      sm2.easeFactor,
      sm2.repetitions,
      rating,
      id
    ).run();

    return c.json(sm2);
  } catch (error) {
    return c.json({ error: 'Invalid data', details: error }, 400);
  }
});

export default app;