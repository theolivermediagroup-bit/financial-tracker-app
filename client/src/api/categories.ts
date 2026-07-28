import { apiFetch } from "./client";
import type { Category, EntryType } from "../types";

export function listCategories(type?: EntryType): Promise<{ categories: Category[] }> {
  const query = type ? `?type=${type}` : "";
  return apiFetch(`/api/categories${query}`);
}

export function createCategory(name: string, type: EntryType): Promise<{ category: Category }> {
  return apiFetch("/api/categories", {
    method: "POST",
    body: JSON.stringify({ name, type }),
  });
}

export function deleteCategory(id: number): Promise<void> {
  return apiFetch(`/api/categories/${id}`, { method: "DELETE" });
}
