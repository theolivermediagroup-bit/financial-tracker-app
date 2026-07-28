import { pool } from "../../db/pool";

export interface MonthlyBudgetRow {
  id: number;
  month: Date;
  amount: string;
  created_at: Date;
}

export async function getBudgetForMonth(month: string): Promise<MonthlyBudgetRow | null> {
  const { rows } = await pool.query<MonthlyBudgetRow>(
    "SELECT * FROM monthly_budgets WHERE month = $1",
    [month]
  );
  return rows[0] ?? null;
}

export async function upsertBudgetForMonth(
  month: string,
  amount: number
): Promise<MonthlyBudgetRow> {
  const { rows } = await pool.query<MonthlyBudgetRow>(
    `INSERT INTO monthly_budgets (month, amount) VALUES ($1, $2)
     ON CONFLICT (month) DO UPDATE SET amount = EXCLUDED.amount
     RETURNING *`,
    [month, amount]
  );
  return rows[0];
}

export async function getMonthlySpend(month: string): Promise<string> {
  const { rows } = await pool.query<{ total: string }>(
    `SELECT COALESCE(SUM(e.amount), 0) AS total
     FROM entries e
     JOIN categories c ON c.id = e.category_id
     WHERE c.type = 'expense'
       AND e.occurred_on >= $1::date
       AND e.occurred_on < ($1::date + INTERVAL '1 month')`,
    [month]
  );
  return rows[0].total;
}
