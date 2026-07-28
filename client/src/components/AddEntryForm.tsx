import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { todayLocalISODate } from "../api/client";
import { listCategories } from "../api/categories";
import { createEntry } from "../api/entries";
import type { Category, EntryType } from "../types";

export function AddEntryForm({ onAdded }: { onAdded: () => void }) {
  const [type, setType] = useState<EntryType>("expense");
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryId, setCategoryId] = useState<number | "">("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [occurredOn, setOccurredOn] = useState(todayLocalISODate());
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    listCategories(type).then(({ categories }) => {
      setCategories(categories);
      setCategoryId(categories[0]?.id ?? "");
    });
  }, [type]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const parsedAmount = Number(amount);
    if (!categoryId || !amount || Number.isNaN(parsedAmount) || parsedAmount <= 0) return;

    setPending(true);
    setError(null);
    try {
      await createEntry({
        categoryId: Number(categoryId),
        amount: parsedAmount,
        description: description.trim() || undefined,
        occurredOn,
      });
      setAmount("");
      setDescription("");
      onAdded();
    } catch {
      setError("Could not add entry. Please try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form className="add-entry-form" onSubmit={handleSubmit}>
      <h2>Add entry</h2>
      <div className="form-row">
        <label>
          Type
          <select value={type} onChange={(e) => setType(e.target.value as EntryType)} disabled={pending}>
            <option value="expense">Expense</option>
            <option value="income">Income</option>
          </select>
        </label>
        <label>
          Category
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(Number(e.target.value))}
            disabled={pending || categories.length === 0}
          >
            {categories.length === 0 && <option value="">No categories yet</option>}
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="form-row">
        <label>
          Amount
          <input
            type="number"
            min="0.01"
            step="0.01"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            disabled={pending}
          />
        </label>
        <label>
          Date
          <input
            type="date"
            value={occurredOn}
            onChange={(e) => setOccurredOn(e.target.value)}
            disabled={pending}
          />
        </label>
      </div>
      <label>
        Description (optional)
        <input
          type="text"
          placeholder="e.g. Groceries"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          disabled={pending}
        />
      </label>
      <button type="submit" disabled={pending || !categoryId || !amount}>
        Add entry
      </button>
      {error && <p className="form-error">{error}</p>}
    </form>
  );
}
