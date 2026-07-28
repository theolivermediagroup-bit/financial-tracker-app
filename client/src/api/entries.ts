import { apiFetch } from "./client";
import type { Entry, EntryType } from "../types";

export interface ListEntriesFilters {
  type?: EntryType;
  categoryId?: number;
}

export function listEntries(filters: ListEntriesFilters = {}): Promise<{ entries: Entry[] }> {
  const params = new URLSearchParams();
  if (filters.type) params.set("type", filters.type);
  if (filters.categoryId) params.set("categoryId", String(filters.categoryId));
  const query = params.toString();
  return apiFetch(`/api/entries${query ? `?${query}` : ""}`);
}

export interface CreateEntryInput {
  categoryId: number;
  amount: number;
  description?: string;
  occurredOn: string;
}

export function createEntry(input: CreateEntryInput): Promise<{ entry: Entry }> {
  return apiFetch("/api/entries", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export interface UpdateEntryInput {
  categoryId: number;
  amount: number;
  description?: string;
  occurredOn: string;
}

export function updateEntry(id: number, input: UpdateEntryInput): Promise<{ entry: Entry }> {
  return apiFetch(`/api/entries/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export function deleteEntry(id: number): Promise<void> {
  return apiFetch(`/api/entries/${id}`, { method: "DELETE" });
}
