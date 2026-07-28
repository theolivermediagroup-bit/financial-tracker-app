import { useState } from "react";
import { deleteEntry, updateEntry } from "../api/entries";
import type { Category, Entry, EntryType } from "../types";

interface Props {
  entry: Entry;
  categories: Category[];
  onChange: () => void;
}

function formatCurrency(value: number): string {
  return value.toLocaleString(undefined, { style: "currency", currency: "USD" });
}

export function EntryRow({ entry, categories, onChange }: Props) {
  const [editing, setEditing] = useState(false);
  const [type, setType] = useState<EntryType>(entry.category.type);
  const [categoryId, setCategoryId] = useState(entry.categoryId);
  const [amount, setAmount] = useState(String(entry.amount));
  const [description, setDescription] = useState(entry.description ?? "");
  const [occurredOn, setOccurredOn] = useState(entry.occurredOn);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function startEdit() {
    setType(entry.category.type);
    setCategoryId(entry.categoryId);
    setAmount(String(entry.amount));
    setDescription(entry.description ?? "");
    setOccurredOn(entry.occurredOn);
    setError(null);
    setEditing(true);
  }

  function handleTypeChange(newType: EntryType) {
    setType(newType);
    const firstOfType = categories.find((c) => c.type === newType);
    if (firstOfType) setCategoryId(firstOfType.id);
  }

  async function handleSave() {
    const parsedAmount = Number(amount);
    if (!categoryId || !amount || Number.isNaN(parsedAmount) || parsedAmount <= 0 || !occurredOn) return;

    setPending(true);
    setError(null);
    try {
      await updateEntry(entry.id, {
        categoryId,
        amount: parsedAmount,
        description: description.trim() || undefined,
        occurredOn,
      });
      setEditing(false);
      onChange();
    } catch {
      setError("Could not save changes. Please try again.");
    } finally {
      setPending(false);
    }
  }

  async function handleDelete() {
    setPending(true);
    try {
      await deleteEntry(entry.id);
      onChange();
    } finally {
      setPending(false);
    }
  }

  if (editing) {
    const categoryOptions = categories.filter((c) => c.type === type);
    return (
      <tr>
        <td>
          <input
            type="date"
            value={occurredOn}
            onChange={(e) => setOccurredOn(e.target.value)}
            disabled={pending}
            className="entry-edit-date"
          />
        </td>
        <td>
          <div className="entry-edit-category">
            <select value={type} onChange={(e) => handleTypeChange(e.target.value as EntryType)} disabled={pending}>
              <option value="expense">Expense</option>
              <option value="income">Income</option>
            </select>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(Number(e.target.value))}
              disabled={pending}
            >
              {categoryOptions.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </td>
        <td>
          <input
            type="text"
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={pending}
          />
        </td>
        <td>
          <input
            type="number"
            min="0.01"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            disabled={pending}
            className="entry-edit-amount"
          />
        </td>
        <td>
          <div className="entry-edit-actions">
            <button type="button" onClick={handleSave} disabled={pending || !amount || !occurredOn}>
              Save
            </button>
            <button type="button" className="secondary-btn" onClick={() => setEditing(false)} disabled={pending}>
              Cancel
            </button>
          </div>
          {error && <p className="form-error">{error}</p>}
        </td>
      </tr>
    );
  }

  return (
    <tr>
      <td>{entry.occurredOn}</td>
      <td>{entry.category.name}</td>
      <td>{entry.description ?? "—"}</td>
      <td className={entry.category.type === "income" ? "amount-income" : "amount-expense"}>
        {entry.category.type === "income" ? "+" : "-"}
        {formatCurrency(entry.amount)}
      </td>
      <td>
        <div className="entry-row-actions">
          <button type="button" className="secondary-btn" onClick={startEdit} disabled={pending}>
            Edit
          </button>
          <button type="button" className="delete-btn" onClick={handleDelete} disabled={pending}>
            Delete
          </button>
        </div>
      </td>
    </tr>
  );
}
