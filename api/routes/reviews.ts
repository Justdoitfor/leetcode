import express from 'express';
import { z } from 'zod';
import db from '../db/database.js';
import { calculateNextReview } from '../utils/sm2.js';

const router = express.Router();

const respondSchema = z.object({
  rating: z.number().min(1).max(3),
});

// GET /api/reviews/today
router.get('/today', (req, res) => {
  const today = new Date().toISOString().split('T')[0];
  const query = `
    SELECT r.*, p.title, p.title_zh, p.difficulty, p.tags
    FROM reviews r
    JOIN problems p ON r.problem_id = p.id
    WHERE r.next_review_date <= ?
    ORDER BY r.next_review_date ASC, p.difficulty DESC
  `;
  const stmt = db.prepare(query);
  const rows = stmt.all(today);

  res.json(rows.map((row: any) => ({
    ...row,
    tags: row.tags ? JSON.parse(row.tags) : []
  })));
});

// POST /api/reviews/:id/respond
router.post('/:id/respond', (req, res) => {
  const { id } = req.params;
  try {
    const { rating } = respondSchema.parse(req.body);
    const today = new Date().toISOString().split('T')[0];

    const transaction = db.transaction(() => {
      const review = db.prepare('SELECT * FROM reviews WHERE id = ?').get(id) as any;
      if (!review) throw new Error('Review not found');

      const sm2 = calculateNextReview(
        rating,
        review.repetitions,
        review.interval_days,
        review.ease_factor,
        today
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
        rating,
        id
      );

      return sm2;
    });

    const result = transaction();
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: 'Invalid data', details: error });
  }
});

export default router;
