import { useCallback, useEffect, useState } from "react";
import { listCategories } from "../api/categories";
import type { Category } from "../types";
import { AddCategoryForm } from "../components/AddCategoryForm";
import { CategoryList } from "../components/CategoryList";

export function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(() => {
    setError(null);
    return listCategories()
      .then(({ categories }) => setCategories(categories))
      .catch(() => setError("Could not load categories."));
  }, []);

  useEffect(() => {
    setLoading(true);
    refresh().finally(() => setLoading(false));
  }, [refresh]);

  return (
    <div className="page categories-page">
      <header className="dashboard-header">
        <h1>Categories</h1>
      </header>

      {loading && <p>Loading…</p>}
      {error && <p className="form-error">{error}</p>}

      {!loading && !error && (
        <>
          <AddCategoryForm onAdded={refresh} />
          <CategoryList categories={categories} onChange={refresh} />
        </>
      )}
    </div>
  );
}
