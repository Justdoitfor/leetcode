import { Hono } from 'hono';
import type { Bindings } from './problems';

const app = new Hono<{ Bindings: Bindings }>();

// GET /api/stats/overview
app.get('/overview', async (c) => {
  const total = await c.env.DB.prepare('SELECT COUNT(*) as count FROM problems').first() as { count: number };
  const completed = await c.env.DB.prepare('SELECT COUNT(DISTINCT problem_id) as count FROM checkins').first() as { count: number };
  const easy = await c.env.DB.prepare("SELECT COUNT(*) as count FROM problems WHERE difficulty = 'Easy'").first() as { count: number };
  const medium = await c.env.DB.prepare("SELECT COUNT(*) as count FROM problems WHERE difficulty = 'Medium'").first() as { count: number };
  const hard = await c.env.DB.prepare("SELECT COUNT(*) as count FROM problems WHERE difficulty = 'Hard'").first() as { count: number };
  
  // This week/month completed
  const today = new Date();
  const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const lastMonth = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  
  const weekly = await c.env.DB.prepare('SELECT COUNT(DISTINCT problem_id) as count FROM checkins WHERE checked_at >= ?').bind(lastWeek).first() as { count: number };
  const monthly = await c.env.DB.prepare('SELECT COUNT(DISTINCT problem_id) as count FROM checkins WHERE checked_at >= ?').bind(lastMonth).first() as { count: number };
  
  // Calculate streak
  const { results: streakRows } = await c.env.DB.prepare('SELECT DISTINCT checked_at FROM checkins ORDER BY checked_at DESC').all() as { results: { checked_at: string }[] };
  let streak = 0;
  let currentDate = today;
  for (const row of streakRows) {
    const rowDate = new Date(row.checked_at);
    const diff = Math.floor((currentDate.getTime() - rowDate.getTime()) / (1000 * 60 * 60 * 24));
    if (diff === 0 || diff === 1) {
      if (diff === 1 || streak === 0) streak++;
      currentDate = rowDate;
    } else {
      break;
    }
  }

  return c.json({
    total: total?.count || 0,
    completed: completed?.count || 0,
    easy: easy?.count || 0,
    medium: medium?.count || 0,
    hard: hard?.count || 0,
    weekly: weekly?.count || 0,
    monthly: monthly?.count || 0,
    streak
  });
});

// GET /api/stats/heatmap
app.get('/heatmap', async (c) => {
  const query = `
    SELECT checked_at as date, COUNT(*) as count
    FROM checkins
    WHERE checked_at >= date('now', '-365 days')
    GROUP BY checked_at
    ORDER BY checked_at ASC
  `;
  const { results } = await c.env.DB.prepare(query).all();
  return c.json(results);
});

// GET /api/stats/tags
app.get('/tags', async (c) => {
  const { results: problems } = await c.env.DB.prepare('SELECT tags FROM problems').all() as { results: { tags: string }[] };
  const tagCounts: Record<string, number> = {};
  
  for (const p of problems) {
    if (p.tags) {
      const tags = JSON.parse(p.tags);
      for (const tag of tags) {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      }
    }
  }
  
  const result = Object.entries(tagCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);
    
  return c.json(result);
});

// GET /api/stats/weekly
app.get('/weekly', async (c) => {
  const query = `
    SELECT c.checked_at as date, p.difficulty, COUNT(*) as count
    FROM checkins c
    JOIN problems p ON c.problem_id = p.id
    WHERE c.checked_at >= date('now', '-7 days')
    GROUP BY c.checked_at, p.difficulty
    ORDER BY c.checked_at ASC
  `;
  const { results: rows } = await c.env.DB.prepare(query).all() as { results: { date: string, difficulty: string, count: number }[] };
  
  // Transform to chart format
  const byDate: Record<string, any> = {};
  for (const row of rows) {
    if (!byDate[row.date]) {
      byDate[row.date] = { date: row.date, Easy: 0, Medium: 0, Hard: 0 };
    }
    byDate[row.date][row.difficulty] = row.count;
  }
  
  return c.json(Object.values(byDate).sort((a, b) => a.date.localeCompare(b.date)));
});

export default app;