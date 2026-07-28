CREATE TABLE IF NOT EXISTS monthly_budgets (
  id         SERIAL PRIMARY KEY,
  month      DATE NOT NULL UNIQUE,
  amount     NUMERIC(12, 2) NOT NULL CHECK (amount >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
