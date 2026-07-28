import { useEffect, useState } from "react";
import { listCategories } from "../api/categories";
import type { Category, Entry } from "../types";
import { EntryRow } from "./EntryRow";

interface Props {
  entries: Entry[];
  onChange: () => void;
}

export function EntryList({ entries, onChange }: Props) {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    listCategories().then(({ categories }) => setCategories(categories));
  }, []);

  if (entries.length === 0) {
    return <p className="empty-state">No entries yet — add one above to get started.</p>;
  }

  return (
    <table className="entry-table">
      <thead>
        <tr>
          <th>Date</th>
          <th>Category</th>
          <th>Description</th>
          <th>Amount</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {entries.map((entry) => (
          <EntryRow key={entry.id} entry={entry} categories={categories} onChange={onChange} />
        ))}
      </tbody>
    </table>
  );
}
