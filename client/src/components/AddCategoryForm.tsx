import { useState } from "react";
import type { FormEvent } from "react";
import { createCategory } from "../api/categories";
import type { EntryType } from "../types";

export function AddCategoryForm({ onAdded }: { onAdded: () => void }) {
  const [name, setName] = useState("");
  const [type, setType] = useState<EntryType>("expense");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;

    setPending(true);
    setError(null);
    try {
      await createCategory(name.trim(), type);
      setName("");
      onAdded();
    } catch {
      setError("Could not add category. Please try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form className="add-category-form" onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="New category (e.g. Groceries)"
        value={name}
        onChange={(e) => setName(e.target.value)}
        disabled={pending}
      />
      <select value={type} onChange={(e) => setType(e.target.value as EntryType)} disabled={pending}>
        <option value="expense">Expense</option>
        <option value="income">Income</option>
      </select>
      <button type="submit" disabled={pending || !name.trim()}>
        Add category
      </button>
      {error && <p className="form-error">{error}</p>}
    </form>
  );
}
