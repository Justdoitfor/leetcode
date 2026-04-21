DROP TABLE IF EXISTS reviews;
DROP TABLE IF EXISTS checkins;
DROP TABLE IF EXISTS problems;

CREATE TABLE problems (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  leetcode_id INTEGER UNIQUE,
  title TEXT NOT NULL,
  title_zh TEXT,
  difficulty TEXT CHECK(difficulty IN ('Easy','Medium','Hard')) NOT NULL,
  tags TEXT,
  url TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE checkins (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  problem_id INTEGER REFERENCES problems(id) ON DELETE CASCADE,
  checked_at DATE NOT NULL,
  duration_min INTEGER,
  status TEXT CHECK(status IN ('Accepted','WrongAnswer','TimeLimitExceeded')) DEFAULT 'Accepted',
  note TEXT,
  rating INTEGER CHECK(rating IN (1,2,3)),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE reviews (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  problem_id INTEGER UNIQUE REFERENCES problems(id) ON DELETE CASCADE,
  next_review_date DATE NOT NULL,
  interval_days INTEGER DEFAULT 1,
  ease_factor REAL DEFAULT 2.5,
  repetitions INTEGER DEFAULT 0,
  last_rating INTEGER
);

-- Seed Data (Problems)
INSERT INTO problems (leetcode_id, title, title_zh, difficulty, tags, url) VALUES
  (1, 'Two Sum', '两数之和', 'Easy', '["数组", "哈希表"]', 'https://leetcode.cn/problems/two-sum/'),
  (3, 'Longest Substring Without Repeating Characters', '无重复字符的最长子串', 'Medium', '["哈希表", "字符串", "滑动窗口"]', 'https://leetcode.cn/problems/longest-substring-without-repeating-characters/'),
  (23, 'Merge k Sorted Lists', '合并K个升序链表', 'Hard', '["链表", "分治", "堆（优先队列）"]', 'https://leetcode.cn/problems/merge-k-sorted-lists/');

-- Seed Data (Checkins & Reviews)
INSERT INTO checkins (problem_id, checked_at, duration_min, status, note, rating) VALUES
  (1, date('now', '-1 days'), 15, 'Accepted', '## 思路\n哈希表...', 3),
  (2, date('now', '-2 days'), 30, 'WrongAnswer', '## 错题分析\n边界条件...', 1),
  (3, date('now', '-3 days'), 45, 'TimeLimitExceeded', '## TLE\n需要优化...', 2);

INSERT INTO reviews (problem_id, next_review_date, interval_days, ease_factor, repetitions, last_rating) VALUES
  (1, date('now', '+1 days'), 2, 2.6, 1, 3),
  (2, date('now'), 1, 2.5, 0, 1),
  (3, date('now'), 1, 2.35, 1, 2);
