"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { Plus, Pencil, Trash2, X } from "lucide-react";
import toast from "react-hot-toast";
import {
  listenToProducts,
  listenToCategories,
  updateProduct,
  deleteProduct,
} from "@/lib/db";
import type { Product, Category } from "@/types";
import AddProductDrawer from "@/components/admin/AddProductDrawer";
import { getDiscountPercent } from "@/lib/pricing";

const EMPTY_FORM = {
  name: "",
  description: "",
  price: "",
  salePrice: "",
  categoryId: "",
  imageUrl: "",
  stock: "",
};

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [showAddDrawer, setShowAddDrawer] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    const unsubProducts = listenToProducts(setProducts);
    const unsubCategories = listenToCategories(setCategories);
    return () => {
      unsubProducts();
      unsubCategories();
    };
  }, []);

  const categoryMap = useMemo(
    () => categories.reduce((acc, c) => ({ ...acc, [c.id]: c.name }), {} as Record<string, string>),
    [categories]
  );

  const openCreate = () => {
    setShowAddDrawer(true);
  };

  const openEdit = (product: Product) => {
    setEditing(product);
    setForm({
      name: product.name,
      description: product.description,
      price: String(product.price),
      salePrice: typeof product.salePrice === "number" && product.salePrice > 0 ? String(product.salePrice) : "",
      categoryId: product.categoryId,
      imageUrl: product.imageUrl,
      stock: String(product.stock),
    });
    setFormError("");
    setShowForm(true);
  };

  const mrpValue = Number(form.price || 0);
  const sellingValue = form.salePrice ? Number(form.salePrice) : null;
  const discountValue = getDiscountPercent(mrpValue, sellingValue);

  const handleSave = async () => {
    if (!editing) {
      toast.error("No product selected for edit");
      return;
    }

    if (!form.name || !form.description || !form.price || !form.categoryId || !form.imageUrl || !form.stock) {
      toast.error("Fill all required fields");
      return;
    }

    const mrp = Number(form.price);
    const salePrice = form.salePrice ? Number(form.salePrice) : null;
    const stock = Number(form.stock);

    if (mrp < 0 || stock < 0 || (salePrice !== null && salePrice < 0)) {
      setFormError("Values cannot be negative.");
      return;
    }

    if (salePrice !== null && salePrice > mrp) {
      setFormError("Selling Price must be less than or equal to MRP.");
      return;
    }

    setFormError("");

    setSaving(true);
    try {
      const payload: Omit<Product, "id"> = {
        name: form.name.trim(),
        description: form.description.trim(),
        price: mrp,
        salePrice,
        categoryId: form.categoryId,
        imageUrl: form.imageUrl.trim(),
        stock,
        createdAt: editing?.createdAt || Date.now(),
      };

      await updateProduct(editing.id, payload);
      toast.success("Product updated");
      setShowForm(false);
    } catch {
      toast.error("Save failed");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete ${name}?`)) return;
    try {
      await deleteProduct(id);
      toast.success("Product deleted");
    } catch {
      toast.error("Delete failed");
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-2xl font-bold mb-1">Products</h1>
          <p className="text-sm text-brand-gray-400">{products.length} products total</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-brand-black text-white px-4 py-2.5 rounded-full text-sm font-semibold"
        >
          <Plus size={16} /> Add Product
        </button>
      </div>

      <div className="bg-white rounded-xl border border-brand-gray-100 overflow-hidden">
        {products.length === 0 ? (
          <div className="text-center py-16 text-brand-gray-400">No products yet</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-brand-gray-50 border-b border-brand-gray-100">
              <tr>
                <th className="text-left py-3 px-4 text-xs uppercase tracking-wider text-brand-gray-400">Product</th>
                <th className="text-left py-3 px-4 text-xs uppercase tracking-wider text-brand-gray-400 hidden sm:table-cell">Category</th>
                <th className="text-left py-3 px-4 text-xs uppercase tracking-wider text-brand-gray-400">Price</th>
                <th className="text-left py-3 px-4 text-xs uppercase tracking-wider text-brand-gray-400">Stock</th>
                <th className="text-right py-3 px-4 text-xs uppercase tracking-wider text-brand-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} className="border-b border-brand-gray-50">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg overflow-hidden bg-brand-gray-100 relative">
                        {p.imageUrl && <Image src={p.imageUrl} alt={p.name} fill className="object-cover" />}
                      </div>
                      <div>
                        <p className="font-medium line-clamp-1">{p.name}</p>
                        <p className="text-xs text-brand-gray-400 line-clamp-1">{p.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 hidden sm:table-cell">{categoryMap[p.categoryId] || p.categoryId}</td>
                  <td className="py-3 px-4">INR {p.price.toLocaleString()}</td>
                  <td className="py-3 px-4">{p.stock}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => openEdit(p)} className="p-1.5 hover:bg-brand-gray-100 rounded-lg">
                        <Pencil size={14} />
                      </button>
                      <button onClick={() => handleDelete(p.id, p.name)} className="p-1.5 hover:bg-red-50 rounded-lg text-red-500">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-end">
          <div className="bg-white h-full w-full max-w-lg overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-brand-gray-100 sticky top-0 bg-white z-10">
              <h2 className="font-semibold text-lg">Edit Product</h2>
              <button onClick={() => setShowForm(false)} className="p-1.5 hover:bg-brand-gray-100 rounded-full">
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <Field label="Product Name" value={form.name} onChange={(value) => setForm((f) => ({ ...f, name: value }))} />
              <Field label="Description" value={form.description} onChange={(value) => setForm((f) => ({ ...f, description: value }))} textarea />
              <div className="grid grid-cols-2 gap-4">
                <Field label="MRP" type="number" value={form.price} onChange={(value) => setForm((f) => ({ ...f, price: value }))} />
                <Field label="Selling Price" type="number" value={form.salePrice} onChange={(value) => setForm((f) => ({ ...f, salePrice: value }))} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Stock" type="number" value={form.stock} onChange={(value) => setForm((f) => ({ ...f, stock: value }))} />
                <Field label="Discount (%)" value={String(discountValue)} onChange={() => {}} disabled />
              </div>
              <Field label="Image URL" value={form.imageUrl} onChange={(value) => setForm((f) => ({ ...f, imageUrl: value }))} />

              {formError ? (
                <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">{formError}</div>
              ) : null}

              <div>
                <label className="block text-xs font-semibold text-brand-gray-600 mb-1.5">Category</label>
                <select
                  value={form.categoryId}
                  onChange={(e) => setForm((f) => ({ ...f, categoryId: e.target.value }))}
                  className="w-full border border-brand-gray-200 rounded-lg px-3 py-2 text-sm"
                >
                  <option value="">Select category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowForm(false)} className="flex-1 border border-brand-gray-200 py-2.5 rounded-full text-sm">
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 bg-brand-black text-white py-2.5 rounded-full text-sm font-semibold disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <AddProductDrawer
        isOpen={showAddDrawer}
        onCloseAction={() => setShowAddDrawer(false)}
        onSuccessAction={() => toast.success("Product created")}
      />
    </div>
  );
}

type FieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  textarea?: boolean;
  disabled?: boolean;
};

function Field({ label, value, onChange, type = "text", textarea = false, disabled = false }: FieldProps) {
  return (
    <div>
      <label className="block text-xs font-semibold text-brand-gray-600 mb-1.5">{label}</label>
      {textarea ? (
        <textarea
          value={value}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
          rows={3}
          className="w-full border border-brand-gray-200 rounded-lg px-3 py-2 text-sm disabled:bg-brand-gray-50"
        />
      ) : (
        <input
          type={type}
          value={value}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
          className="w-full border border-brand-gray-200 rounded-lg px-3 py-2 text-sm disabled:bg-brand-gray-50"
        />
      )}
    </div>
  );
}
