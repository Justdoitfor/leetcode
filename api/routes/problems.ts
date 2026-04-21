import express from 'express';
import { z } from 'zod';
import db from '../db/database.js';

const router = express.Router();

const problemSchema = z.object({
  leetcode_id: z.number().optional().nullable(),
  title: z.string().min(1),
  title_zh: z.string().optional().nullable(),
  difficulty: z.enum(['Easy', 'Medium', 'Hard']),
  tags: z.array(z.string()).default([]),
  url: z.string().url().optional().nullable(),
});

// GET /api/problems
router.get('/', (req, res) => {
  const { difficulty, tag, search } = req.query;
  
  let query = 'SELECT p.*, COUNT(c.id) as checkins_count, MAX(c.checked_at) as last_checkin FROM problems p LEFT JOIN checkins c ON p.id = c.problem_id WHERE 1=1';
  const params: any[] = [];

  if (difficulty) {
    query += ' AND p.difficulty = ?';
    params.push(difficulty);
  }
  
  if (tag) {
    query += ' AND p.tags LIKE ?';
    params.push(`%${tag}%`);
  }

  if (search) {
    query += ' AND (p.title LIKE ? OR p.title_zh LIKE ?)';
    params.push(`%${search}%`, `%${search}%`);
  }

  query += ' GROUP BY p.id ORDER BY p.id DESC';

  const stmt = db.prepare(query);
  const rows = stmt.all(...params);

  res.json(rows.map((row: any) => ({
    ...row,
    tags: row.tags ? JSON.parse(row.tags) : []
  })));
});

// POST /api/problems
router.post('/', (req, res) => {
  try {
    const data = problemSchema.parse(req.body);
    const stmt = db.prepare(`
      INSERT INTO problems (leetcode_id, title, title_zh, difficulty, tags, url)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    const result = stmt.run(
      data.leetcode_id,
      data.title,
      data.title_zh,
      data.difficulty,
      JSON.stringify(data.tags),
      data.url
    );
    res.status(201).json({ id: result.lastInsertRowid, ...data });
  } catch (error) {
    res.status(400).json({ error: 'Invalid data', details: error });
  }
});

// GET /api/problems/:id
router.get('/:id', (req, res) => {
  const { id } = req.params;
  const problem = db.prepare('SELECT * FROM problems WHERE id = ?').get(id) as any;
  if (!problem) return res.status(404).json({ error: 'Not found' });
  
  problem.tags = problem.tags ? JSON.parse(problem.tags) : [];
  
  const checkins = db.prepare('SELECT * FROM checkins WHERE problem_id = ? ORDER BY checked_at DESC, created_at DESC').all(id);
  
  res.json({ ...problem, checkins });
});

// PUT /api/problems/:id
router.put('/:id', (req, res) => {
  const { id } = req.params;
  try {
    const data = problemSchema.parse(req.body);
    const stmt = db.prepare(`
      UPDATE problems SET leetcode_id=?, title=?, title_zh=?, difficulty=?, tags=?, url=?
      WHERE id=?
    `);
    stmt.run(
      data.leetcode_id,
      data.title,
      data.title_zh,
      data.difficulty,
      JSON.stringify(data.tags),
      data.url,
      id
    );
    res.json({ id, ...data });
  } catch (error) {
    res.status(400).json({ error: 'Invalid data', details: error });
  }
});

// DELETE /api/problems/:id
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  db.prepare('DELETE FROM problems WHERE id = ?').run(id);
  res.status(204).send();
});

export default router;
