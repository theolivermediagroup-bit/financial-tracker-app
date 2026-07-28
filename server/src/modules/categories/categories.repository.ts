import { pool } from "../../db/pool";

export interface CategoryRow {
  id: number;
  name: string;
  type: "income" | "expense";
  created_at: Date;
}

export async function listCategories(type?: "income" | "expense"): Promise<CategoryRow[]> {
  if (type) {
    const { rows } = await pool.query<CategoryRow>(
      "SELECT * FROM categories WHERE type = $1 ORDER BY name ASC",
      [type]
    );
    return rows;
  }
  const { rows } = await pool.query<CategoryRow>("SELECT * FROM categories ORDER BY name ASC");
  return rows;
}

export async function createCategory(
  name: string,
  type: "income" | "expense"
): Promise<CategoryRow> {
  const { rows } = await pool.query<CategoryRow>(
    "INSERT INTO categories (name, type) VALUES ($1, $2) RETURNING *",
    [name, type]
  );
  return rows[0];
}

export async function getCategoryById(id: number): Promise<CategoryRow | null> {
  const { rows } = await pool.query<CategoryRow>("SELECT * FROM categories WHERE id = $1", [id]);
  return rows[0] ?? null;
}

export async function deleteCategory(id: number): Promise<boolean> {
  const { rowCount } = await pool.query("DELETE FROM categories WHERE id = $1", [id]);
  return (rowCount ?? 0) > 0;
}
