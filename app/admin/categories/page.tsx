"use client";

import { useEffect, useState } from "react";
import { Trash2, Plus } from "lucide-react";
import toast from "react-hot-toast";
import { listenToCategories, createCategory, deleteCategory } from "@/lib/db";
import type { Category } from "@/types";

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => listenToCategories(setCategories), []);

  const handleAdd = async () => {
    if (!name.trim()) {
      toast.error("Category name is required");
      return;
    }
    setSaving(true);
    try {
      await createCategory({ name: name.trim() } as Omit<Category, "id">);
      setName("");
      toast.success("Category created");
    } catch {
      toast.error("Failed to create category");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this category?")) return;
    try {
      await deleteCategory(id);
      toast.success("Category deleted");
    } catch {
      toast.error("Delete failed");
    }
  };

  return (
    <div>
      <h1 className="font-display text-2xl font-bold mb-1">Categories</h1>
      <p className="text-sm text-brand-gray-400 mb-6">Manage product categories</p>

      <div className="bg-white border border-brand-gray-100 rounded-xl p-5 mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Category name"
            className="flex-1 border border-brand-gray-200 rounded-lg px-3 py-2.5 text-sm"
          />
          <button
            onClick={handleAdd}
            disabled={saving}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-full bg-brand-black text-white text-sm font-semibold disabled:opacity-60"
          >
            <Plus size={15} /> Add Category
          </button>
        </div>
      </div>

      <div className="bg-white border border-brand-gray-100 rounded-xl overflow-hidden">
        {categories.length === 0 ? (
          <p className="text-sm text-brand-gray-400 py-10 text-center">No categories found</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-brand-gray-50 border-b border-brand-gray-100">
              <tr>
                <th className="text-left py-3 px-4 text-xs uppercase tracking-wider text-brand-gray-400">Name</th>
                <th className="text-right py-3 px-4 text-xs uppercase tracking-wider text-brand-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((category) => (
                <tr key={category.id} className="border-b border-brand-gray-50">
                  <td className="py-3 px-4">{category.name}</td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => handleDelete(category.id)}
                      className="inline-flex items-center justify-center p-1.5 rounded-md text-red-500 hover:bg-red-50"
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
