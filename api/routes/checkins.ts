import express from 'express';
import { z } from 'zod';
import db from '../db/database.js';
import { calculateNextReview } from '../utils/sm2.js';

const router = express.Router();

const checkinSchema = z.object({
  problem_id: z.number(),
  checked_at: z.string(),
  duration_min: z.number().optional().nullable(),
  status: z.enum(['Accepted', 'WrongAnswer', 'TimeLimitExceeded']).default('Accepted'),
  note: z.string().optional().nullable(),
  rating: z.number().min(1).max(3).optional().nullable()
});

// GET /api/checkins
router.get('/', (req, res) => {
  const { date, problem_id } = req.query;
  
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

  const stmt = db.prepare(query);
  res.json(stmt.all(...params));
});

// POST /api/checkins
router.post('/', (req, res) => {
  try {
    const data = checkinSchema.parse(req.body);
    
    // Start transaction
    const transaction = db.transaction(() => {
      const insertStmt = db.prepare(`
        INSERT INTO checkins (problem_id, checked_at, duration_min, status, note, rating)
        VALUES (?, ?, ?, ?, ?, ?)
      `);
      const result = insertStmt.run(
        data.problem_id,
        data.checked_at,
        data.duration_min,
        data.status,
        data.note,
        data.rating
      );
      const checkinId = result.lastInsertRowid;

      // Handle Review algorithm if rating exists
      if (data.rating) {
        const review = db.prepare('SELECT * FROM reviews WHERE problem_id = ?').get(data.problem_id) as any;
        
        if (!review) {
          // Initialize SM-2
          const nextDate = new Date(data.checked_at);
          nextDate.setDate(nextDate.getDate() + 1);
          
          db.prepare(`
            INSERT INTO reviews (problem_id, next_review_date, interval_days, ease_factor, repetitions, last_rating)
            VALUES (?, ?, ?, ?, ?, ?)
          `).run(
            data.problem_id,
            nextDate.toISOString().split('T')[0],
            1,
            2.5,
            0,
            data.rating
          );
        } else {
          // Update SM-2
          const sm2 = calculateNextReview(
            data.rating,
            review.repetitions,
            review.interval_days,
            review.ease_factor,
            data.checked_at
          );
          
          db.prepare(`
            UPDATE reviews 
            SET next_review_date = ?, interval_days = ?, ease_factor = ?, repetitions = ?, last_rating = ?
            WHERE id = ?
          `).run(
            sm2.nextReviewDate,
            sm2.interval,
            sm2.easeFactor,
            sm2.repetitions,
            data.rating,
            review.id
          );
        }
      }

      return checkinId;
    });

    const id = transaction();
    res.status(201).json({ id, ...data });
  } catch (error) {
    res.status(400).json({ error: 'Invalid data', details: error });
  }
});

// PUT /api/checkins/:id
router.put('/:id', (req, res) => {
  const { id } = req.params;
  try {
    const data = checkinSchema.parse(req.body);
    const stmt = db.prepare(`
      UPDATE checkins SET problem_id=?, checked_at=?, duration_min=?, status=?, note=?, rating=?
      WHERE id=?
    `);
    stmt.run(
      data.problem_id,
      data.checked_at,
      data.duration_min,
      data.status,
      data.note,
      data.rating,
      id
    );
    res.json({ id, ...data });
  } catch (error) {
    res.status(400).json({ error: 'Invalid data', details: error });
  }
});

// DELETE /api/checkins/:id
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  db.prepare('DELETE FROM checkins WHERE id = ?').run(id);
  res.status(204).send();
});

export default router;
