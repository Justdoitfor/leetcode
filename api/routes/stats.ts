import express from 'express';
import db from '../db/database.js';

const router = express.Router();

// GET /api/stats/overview
router.get('/overview', (req, res) => {
  const total = db.prepare('SELECT COUNT(*) as count FROM problems').get() as { count: number };
  const completed = db.prepare('SELECT COUNT(DISTINCT problem_id) as count FROM checkins').get() as { count: number };
  const easy = db.prepare("SELECT COUNT(*) as count FROM problems WHERE difficulty = 'Easy'").get() as { count: number };
  const medium = db.prepare("SELECT COUNT(*) as count FROM problems WHERE difficulty = 'Medium'").get() as { count: number };
  const hard = db.prepare("SELECT COUNT(*) as count FROM problems WHERE difficulty = 'Hard'").get() as { count: number };
  
  // This week/month completed
  const today = new Date();
  const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const lastMonth = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  
  const weekly = db.prepare('SELECT COUNT(DISTINCT problem_id) as count FROM checkins WHERE checked_at >= ?').get(lastWeek) as { count: number };
  const monthly = db.prepare('SELECT COUNT(DISTINCT problem_id) as count FROM checkins WHERE checked_at >= ?').get(lastMonth) as { count: number };
  
  // Calculate streak
  const streakRows = db.prepare('SELECT DISTINCT checked_at FROM checkins ORDER BY checked_at DESC').all() as { checked_at: string }[];
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

  res.json({
    total: total.count,
    completed: completed.count,
    easy: easy.count,
    medium: medium.count,
    hard: hard.count,
    weekly: weekly.count,
    monthly: monthly.count,
    streak
  });
});

// GET /api/stats/heatmap
router.get('/heatmap', (req, res) => {
  const query = `
    SELECT checked_at as date, COUNT(*) as count
    FROM checkins
    WHERE checked_at >= date('now', '-365 days')
    GROUP BY checked_at
    ORDER BY checked_at ASC
  `;
  const rows = db.prepare(query).all();
  res.json(rows);
});

// GET /api/stats/tags
router.get('/tags', (req, res) => {
  const problems = db.prepare('SELECT tags FROM problems').all() as { tags: string }[];
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
    
  res.json(result);
});

// GET /api/stats/weekly
router.get('/weekly', (req, res) => {
  const query = `
    SELECT c.checked_at as date, p.difficulty, COUNT(*) as count
    FROM checkins c
    JOIN problems p ON c.problem_id = p.id
    WHERE c.checked_at >= date('now', '-7 days')
    GROUP BY c.checked_at, p.difficulty
    ORDER BY c.checked_at ASC
  `;
  const rows = db.prepare(query).all() as { date: string, difficulty: string, count: number }[];
  
  // Transform to chart format
  const byDate: Record<string, any> = {};
  for (const row of rows) {
    if (!byDate[row.date]) {
      byDate[row.date] = { date: row.date, Easy: 0, Medium: 0, Hard: 0 };
    }
    byDate[row.date][row.difficulty] = row.count;
  }
  
  res.json(Object.values(byDate).sort((a, b) => a.date.localeCompare(b.date)));
});

export default router;
