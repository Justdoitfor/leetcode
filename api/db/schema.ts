import db from './database.js';

export function initDb() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS problems (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      leetcode_id INTEGER UNIQUE,
      title TEXT NOT NULL,
      title_zh TEXT,
      difficulty TEXT CHECK(difficulty IN ('Easy','Medium','Hard')) NOT NULL,
      tags TEXT,
      url TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS checkins (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      problem_id INTEGER REFERENCES problems(id) ON DELETE CASCADE,
      checked_at DATE NOT NULL,
      duration_min INTEGER,
      status TEXT CHECK(status IN ('Accepted','WrongAnswer','TimeLimitExceeded')) DEFAULT 'Accepted',
      note TEXT,
      rating INTEGER CHECK(rating IN (1,2,3)),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS reviews (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      problem_id INTEGER UNIQUE REFERENCES problems(id) ON DELETE CASCADE,
      next_review_date DATE NOT NULL,
      interval_days INTEGER DEFAULT 1,
      ease_factor REAL DEFAULT 2.5,
      repetitions INTEGER DEFAULT 0,
      last_rating INTEGER
    );
  `);

  // Seed data if empty
  const stmt = db.prepare('SELECT COUNT(*) as count FROM problems');
  const result = stmt.get() as { count: number };
  
  if (result.count === 0) {
    seedData();
  }
}

function seedData() {
  const insertProblem = db.prepare(`
    INSERT INTO problems (leetcode_id, title, title_zh, difficulty, tags, url)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  const problems = [
    [1, 'Two Sum', '两数之和', 'Easy', JSON.stringify(['数组', '哈希表']), 'https://leetcode.cn/problems/two-sum/'],
    [3, 'Longest Substring Without Repeating Characters', '无重复字符的最长子串', 'Medium', JSON.stringify(['哈希表', '字符串', '滑动窗口']), 'https://leetcode.cn/problems/longest-substring-without-repeating-characters/'],
    [23, 'Merge k Sorted Lists', '合并K个升序链表', 'Hard', JSON.stringify(['链表', '分治', '堆（优先队列）']), 'https://leetcode.cn/problems/merge-k-sorted-lists/'],
    [206, 'Reverse Linked List', '反转链表', 'Easy', JSON.stringify(['链表', '递归']), 'https://leetcode.cn/problems/reverse-linked-list/'],
    [15, '3Sum', '三数之和', 'Medium', JSON.stringify(['数组', '双指针', '排序']), 'https://leetcode.cn/problems/3sum/'],
    [42, 'Trapping Rain Water', '接雨水', 'Hard', JSON.stringify(['栈', '数组', '双指针', '动态规划', '单调栈']), 'https://leetcode.cn/problems/trapping-rain-water/'],
    [121, 'Best Time to Buy and Sell Stock', '买卖股票的最佳时机', 'Easy', JSON.stringify(['数组', '动态规划']), 'https://leetcode.cn/problems/best-time-to-buy-and-sell-stock/'],
    [5, 'Longest Palindromic Substring', '最长回文子串', 'Medium', JSON.stringify(['字符串', '动态规划']), 'https://leetcode.cn/problems/longest-palindromic-substring/'],
    [76, 'Minimum Window Substring', '最小覆盖子串', 'Hard', JSON.stringify(['哈希表', '字符串', '滑动窗口']), 'https://leetcode.cn/problems/minimum-window-substring/'],
    [141, 'Linked List Cycle', '环形链表', 'Easy', JSON.stringify(['哈希表', '链表', '双指针']), 'https://leetcode.cn/problems/linked-list-cycle/'],
    [200, 'Number of Islands', '岛屿数量', 'Medium', JSON.stringify(['深度优先搜索', '广度优先搜索', '并查集', '数组', '矩阵']), 'https://leetcode.cn/problems/number-of-islands/'],
    [25, 'Reverse Nodes in k-Group', 'K 个一组翻转链表', 'Hard', JSON.stringify(['链表', '递归']), 'https://leetcode.cn/problems/reverse-nodes-in-k-group/'],
    [21, 'Merge Two Sorted Lists', '合并两个有序链表', 'Easy', JSON.stringify(['递归', '链表']), 'https://leetcode.cn/problems/merge-two-sorted-lists/'],
    [53, 'Maximum Subarray', '最大子数组和', 'Medium', JSON.stringify(['数组', '分治', '动态规划']), 'https://leetcode.cn/problems/maximum-subarray/'],
    [4, 'Median of Two Sorted Arrays', '寻找两个正序数组的中位数', 'Hard', JSON.stringify(['数组', '二分查找', '分治']), 'https://leetcode.cn/problems/median-of-two-sorted-arrays/'],
    [70, 'Climbing Stairs', '爬楼梯', 'Easy', JSON.stringify(['记忆化搜索', '数学', '动态规划']), 'https://leetcode.cn/problems/climbing-stairs/'],
    [33, 'Search in Rotated Sorted Array', '搜索旋转排序数组', 'Medium', JSON.stringify(['数组', '二分查找']), 'https://leetcode.cn/problems/search-in-rotated-sorted-array/'],
    [32, 'Longest Valid Parentheses', '最长有效括号', 'Hard', JSON.stringify(['栈', '字符串', '动态规划']), 'https://leetcode.cn/problems/longest-valid-parentheses/'],
    [20, 'Valid Parentheses', '有效的括号', 'Easy', JSON.stringify(['栈', '字符串']), 'https://leetcode.cn/problems/valid-parentheses/'],
    [46, 'Permutations', '全排列', 'Medium', JSON.stringify(['数组', '回溯']), 'https://leetcode.cn/problems/permutations/']
  ];

  for (const p of problems) {
    insertProblem.run(...p);
  }

  // Seed checkins for the last 60 days
  const insertCheckin = db.prepare(`
    INSERT INTO checkins (problem_id, checked_at, duration_min, status, note, rating)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  
  const insertReview = db.prepare(`
    INSERT INTO reviews (problem_id, next_review_date, interval_days, ease_factor, repetitions, last_rating)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  const now = new Date();
  for (let i = 0; i < 150; i++) {
    const daysAgo = Math.floor(Math.random() * 60);
    const date = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
    const dateStr = date.toISOString().split('T')[0];
    
    const problemId = Math.floor(Math.random() * 20) + 1;
    const duration = Math.floor(Math.random() * 60) + 10;
    const statuses = ['Accepted', 'Accepted', 'Accepted', 'WrongAnswer', 'TimeLimitExceeded'];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const rating = Math.floor(Math.random() * 3) + 1;
    
    const note = `# 题解笔记\n\n这是一段自动生成的题解笔记。\n\n## 思路\n这里记录了解题思路...\n\n\`\`\`javascript\nfunction solve() {\n  return true;\n}\n\`\`\`\n`;
    
    insertCheckin.run(problemId, dateStr, duration, status, note, rating);
    
    // Simple review init for each checkin just for demo
    const nextReview = new Date(date.getTime() + 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    try {
      insertReview.run(problemId, nextReview, 1, 2.5, 0, rating);
    } catch(e) {
      // Ignore unique constraint or multiple inserts for simplicity
    }
  }
}
