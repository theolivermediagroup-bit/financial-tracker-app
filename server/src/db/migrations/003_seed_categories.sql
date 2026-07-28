INSERT INTO categories (name, type) VALUES
  ('Food', 'expense'),
  ('Mortgage', 'expense'),
  ('Transportation', 'expense'),
  ('Entertainment', 'expense'),
  ('Utilities', 'expense'),
  ('Healthcare', 'expense'),
  ('Salary', 'income'),
  ('Other Income', 'income')
ON CONFLICT (name) DO NOTHING;
