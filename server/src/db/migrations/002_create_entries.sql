CREATE TABLE IF NOT EXISTS entries (
  id          SERIAL PRIMARY KEY,
  category_id INTEGER NOT NULL REFERENCES categories(id),
  amount      NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
  description TEXT,
  occurred_on DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS entries_category_id_idx ON entries (category_id);
CREATE INDEX IF NOT EXISTS entries_occurred_on_idx ON entries (occurred_on);
