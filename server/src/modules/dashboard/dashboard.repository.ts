import { pool } from "../../db/pool";

export interface Totals {
  total_income: string;
  total_expenses: string;
}

export async function getTotals(): Promise<Totals> {
  const { rows } = await pool.query<Totals>(
    `SELECT
       COALESCE(SUM(e.amount) FILTER (WHERE c.type = 'income'), 0) AS total_income,
       COALESCE(SUM(e.amount) FILTER (WHERE c.type = 'expense'), 0) AS total_expenses
     FROM entries e
     JOIN categories c ON c.id = e.category_id`
  );
  return rows[0];
}

export interface CategorySpendingRow {
  category_id: number;
  category_name: string;
  total: string;
}

export async function getSpendingByCategory(): Promise<CategorySpendingRow[]> {
  const { rows } = await pool.query<CategorySpendingRow>(
    `SELECT c.id AS category_id, c.name AS category_name, SUM(e.amount) AS total
     FROM categories c
     JOIN entries e ON e.category_id = c.id
     WHERE c.type = 'expense'
     GROUP BY c.id, c.name
     ORDER BY total DESC`
  );
  return rows;
}

export async function getSavingsTotal(): Promise<string> {
  const { rows } = await pool.query<{ total: string }>(
    `SELECT COALESCE(SUM(e.amount), 0) AS total
     FROM entries e
     JOIN categories c ON c.id = e.category_id
     WHERE c.name = 'Savings'`
  );
  return rows[0].total;
}
