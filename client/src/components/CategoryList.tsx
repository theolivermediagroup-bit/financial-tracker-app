import { useState } from "react";
import { ApiError } from "../api/client";
import { deleteCategory } from "../api/categories";
import type { Category } from "../types";

interface Props {
  categories: Category[];
  onChange: () => void;
}

export function CategoryList({ categories, onChange }: Props) {
  const [pendingId, setPendingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete(id: number) {
    setPendingId(id);
    setError(null);
    try {
      await deleteCategory(id);
      onChange();
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        setError(err.message);
      } else {
        setError("Could not delete category. Please try again.");
      }
    } finally {
      setPendingId(null);
    }
  }

  const income = categories.filter((c) => c.type === "income");
  const expense = categories.filter((c) => c.type === "expense");

  function renderGroup(title: string, group: Category[]) {
    return (
      <div className="category-group">
        <h3>{title}</h3>
        {group.length === 0 ? (
          <p className="empty-state">No categories yet.</p>
        ) : (
          <ul className="category-list">
            {group.map((c) => (
              <li key={c.id}>
                <span>{c.name}</span>
                <button
                  type="button"
                  className="delete-btn"
                  onClick={() => handleDelete(c.id)}
                  disabled={pendingId === c.id}
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  }

  return (
    <div className="category-lists">
      {error && <p className="form-error">{error}</p>}
      {renderGroup("Expense categories", expense)}
      {renderGroup("Income categories", income)}
    </div>
  );
}
