import { pool } from "../../db/pool";

export interface EntryRow {
  id: number;
  category_id: number;
  amount: string;
  description: string | null;
  occurred_on: Date;
  created_at: Date;
  category_name: string;
  category_type: "income" | "expense";
}

export interface ListEntriesFilters {
  type?: "income" | "expense";
  categoryId?: number;
  from?: string;
  to?: string;
}

export async function listEntries(filters: ListEntriesFilters = {}): Promise<EntryRow[]> {
  const conditions: string[] = [];
  const params: unknown[] = [];

  if (filters.type) {
    params.push(filters.type);
    conditions.push(`c.type = $${params.length}`);
  }
  if (filters.categoryId) {
    params.push(filters.categoryId);
    conditions.push(`e.category_id = $${params.length}`);
  }
  if (filters.from) {
    params.push(filters.from);
    conditions.push(`e.occurred_on >= $${params.length}`);
  }
  if (filters.to) {
    params.push(filters.to);
    conditions.push(`e.occurred_on <= $${params.length}`);
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  const { rows } = await pool.query<EntryRow>(
    `SELECT e.id, e.category_id, e.amount, e.description, e.occurred_on, e.created_at,
            c.name AS category_name, c.type AS category_type
     FROM entries e
     JOIN categories c ON c.id = e.category_id
     ${where}
     ORDER BY e.occurred_on DESC, e.id DESC`,
    params
  );
  return rows;
}

export interface CreateEntryInput {
  categoryId: number;
  amount: number;
  description: string | null;
  occurredOn: string;
}

export async function createEntry(input: CreateEntryInput): Promise<number> {
  const { rows } = await pool.query<{ id: number }>(
    `INSERT INTO entries (category_id, amount, description, occurred_on)
     VALUES ($1, $2, $3, $4) RETURNING id`,
    [input.categoryId, input.amount, input.description, input.occurredOn]
  );
  return rows[0].id;
}

export interface UpdateEntryInput {
  categoryId: number;
  amount: number;
  description: string | null;
  occurredOn: string;
}

export async function updateEntry(id: number, input: UpdateEntryInput): Promise<boolean> {
  const { rowCount } = await pool.query(
    `UPDATE entries SET category_id = $1, amount = $2, description = $3, occurred_on = $4 WHERE id = $5`,
    [input.categoryId, input.amount, input.description, input.occurredOn, id]
  );
  return (rowCount ?? 0) > 0;
}

export async function getEntryById(id: number): Promise<EntryRow | null> {
  const { rows } = await pool.query<EntryRow>(
    `SELECT e.id, e.category_id, e.amount, e.description, e.occurred_on, e.created_at,
            c.name AS category_name, c.type AS category_type
     FROM entries e
     JOIN categories c ON c.id = e.category_id
     WHERE e.id = $1`,
    [id]
  );
  return rows[0] ?? null;
}

export async function deleteEntry(id: number): Promise<boolean> {
  const { rowCount } = await pool.query("DELETE FROM entries WHERE id = $1", [id]);
  return (rowCount ?? 0) > 0;
}

export async function countEntriesByCategory(categoryId: number): Promise<number> {
  const { rows } = await pool.query<{ count: string }>(
    "SELECT COUNT(*) AS count FROM entries WHERE category_id = $1",
    [categoryId]
  );
  return Number(rows[0].count);
}
