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
