import { Hono } from 'hono';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import { calculateNextReview } from '../utils/sm2.js';
import type { Bindings } from './problems.js';

const app = new Hono<{ Bindings: Bindings }>();

const checkinSchema = z.object({
  problem_id: z.number(),
  checked_at: z.string(),
  duration_min: z.number().optional().nullable(),
  status: z.enum(['Accepted', 'WrongAnswer', 'TimeLimitExceeded']).default('Accepted'),
  note: z.string().optional().nullable(),
  rating: z.number().min(1).max(3).optional().nullable()
});

// GET /api/checkins
app.get('/', async (c) => {
  const date = c.req.query('date');
  const problem_id = c.req.query('problem_id');
  
  let query = 'SELECT * FROM checkins WHERE 1=1';
  const params: any[] = [];

  if (date) {
    query += ' AND checked_at = ?';
    params.push(date);
  }
  
  if (problem_id) {
    query += ' AND problem_id = ?';
    params.push(problem_id);
  }

  query += ' ORDER BY checked_at DESC, created_at DESC';

  const { results } = await c.env.DB.prepare(query).bind(...params).all();
  return c.json(results);
});

// POST /api/checkins
app.post('/', zValidator('json', checkinSchema), async (c) => {
  const data = c.req.valid('json');
  
  try {
    const stmts: D1PreparedStatement[] = [];

    // Insert Checkin
    const insertCheckin = c.env.DB.prepare(`
      INSERT INTO checkins (problem_id, checked_at, duration_min, status, note, rating)
      VALUES (?, ?, ?, ?, ?, ?) RETURNING id
    `).bind(
      data.problem_id,
      data.checked_at,
      data.duration_min ?? null,
      data.status,
      data.note ?? null,
      data.rating ?? null
    );

    // D1 doesn't return inserted ID easily in a batch without doing it first.
    // So we do sequential for now.
    const result = await insertCheckin.first();
    const checkinId = result?.id;

    // Handle Review algorithm if rating exists
    if (data.rating) {
      const review = await c.env.DB.prepare('SELECT * FROM reviews WHERE problem_id = ?').bind(data.problem_id).first() as any;
      
      if (!review) {
        // Initialize SM-2
        const nextDate = new Date(data.checked_at);
        nextDate.setDate(nextDate.getDate() + 1);
        
        await c.env.DB.prepare(`
          INSERT INTO reviews (problem_id, next_review_date, interval_days, ease_factor, repetitions, last_rating)
          VALUES (?, ?, ?, ?, ?, ?)
        `).bind(
          data.problem_id,
          nextDate.toISOString().split('T')[0],
          1,
          2.5,
          0,
          data.rating
        ).run();
      } else {
        // Update SM-2
        const sm2 = calculateNextReview(
          data.rating,
          review.repetitions as number,
          review.interval_days as number,
          review.ease_factor as number,
          data.checked_at
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
          data.rating,
          review.id
        ).run();
      }
    }

    return c.json({ id: checkinId, ...data }, 201);
  } catch (error) {
    return c.json({ error: 'Invalid data', details: error }, 400);
  }
});

// PUT /api/checkins/:id
app.put('/:id', zValidator('json', checkinSchema), async (c) => {
  const id = c.req.param('id');
  const data = c.req.valid('json');
  
  try {
    await c.env.DB.prepare(`
      UPDATE checkins SET problem_id=?, checked_at=?, duration_min=?, status=?, note=?, rating=?
      WHERE id=?
    `).bind(
      data.problem_id,
      data.checked_at,
      data.duration_min ?? null,
      data.status,
      data.note ?? null,
      data.rating ?? null,
      id
    ).run();
    return c.json({ id: parseInt(id), ...data });
  } catch (error) {
    return c.json({ error: 'Invalid data' }, 400);
  }
});

// DELETE /api/checkins/:id
app.delete('/:id', async (c) => {
  const id = c.req.param('id');
  await c.env.DB.prepare('DELETE FROM checkins WHERE id = ?').bind(id).run();
  return new Response(null, { status: 204 });
});

export default app;