INSERT INTO categories (name, type) VALUES
  ('Savings', 'expense')
ON CONFLICT (name) DO NOTHING;
