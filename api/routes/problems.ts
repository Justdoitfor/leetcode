import { Hono } from 'hono';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';

export type Bindings = {
  DB: D1Database;
};

const app = new Hono<{ Bindings: Bindings }>();

const problemSchema = z.object({
  leetcode_id: z.number().optional().nullable(),
  title: z.string().min(1),
  title_zh: z.string().optional().nullable(),
  difficulty: z.enum(['Easy', 'Medium', 'Hard']),
  tags: z.array(z.string()).default([]),
  url: z.string().url().optional().nullable(),
});

// GET /api/problems
app.get('/', async (c) => {
  const difficulty = c.req.query('difficulty');
  const tag = c.req.query('tag');
  const search = c.req.query('search');
  
  let query = 'SELECT p.*, COUNT(ch.id) as checkins_count, MAX(ch.checked_at) as last_checkin FROM problems p LEFT JOIN checkins ch ON p.id = ch.problem_id WHERE 1=1';
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

  const { results } = await c.env.DB.prepare(query).bind(...params).all();

  return c.json(results.map((row: any) => ({
    ...row,
    tags: row.tags ? JSON.parse(row.tags) : []
  })));
});

// POST /api/problems
app.post('/', zValidator('json', problemSchema), async (c) => {
  const data = c.req.valid('json');
  
  try {
    const result = await c.env.DB.prepare(`
      INSERT INTO problems (leetcode_id, title, title_zh, difficulty, tags, url)
      VALUES (?, ?, ?, ?, ?, ?) RETURNING id
    `).bind(
      data.leetcode_id ?? null,
      data.title,
      data.title_zh ?? null,
      data.difficulty,
      JSON.stringify(data.tags),
      data.url ?? null
    ).first();
    
    return c.json({ id: result?.id, ...data }, 201);
  } catch (error) {
    return c.json({ error: 'Invalid data or duplicate leetcode_id' }, 400);
  }
});

// GET /api/problems/:id
app.get('/:id', async (c) => {
  const id = c.req.param('id');
  const problem = await c.env.DB.prepare('SELECT * FROM problems WHERE id = ?').bind(id).first();
  if (!problem) return c.json({ error: 'Not found' }, 404);
  
  problem.tags = problem.tags ? JSON.parse(problem.tags as string) : [];
  
  const { results: checkins } = await c.env.DB.prepare('SELECT * FROM checkins WHERE problem_id = ? ORDER BY checked_at DESC, created_at DESC').bind(id).all();
  
  return c.json({ ...problem, checkins });
});

// PUT /api/problems/:id
app.put('/:id', zValidator('json', problemSchema), async (c) => {
  const id = c.req.param('id');
  const data = c.req.valid('json');
  
  try {
    await c.env.DB.prepare(`
      UPDATE problems SET leetcode_id=?, title=?, title_zh=?, difficulty=?, tags=?, url=?
      WHERE id=?
    `).bind(
      data.leetcode_id ?? null,
      data.title,
      data.title_zh ?? null,
      data.difficulty,
      JSON.stringify(data.tags),
      data.url ?? null,
      id
    ).run();
    return c.json({ id: parseInt(id), ...data });
  } catch (error) {
    return c.json({ error: 'Invalid data' }, 400);
  }
});

// DELETE /api/problems/:id
app.delete('/:id', async (c) => {
  const id = c.req.param('id');
  await c.env.DB.prepare('DELETE FROM problems WHERE id = ?').bind(id).run();
  return new Response(null, { status: 204 });
});

export default app;