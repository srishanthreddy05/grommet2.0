"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { Loader2, Plus, X } from "lucide-react";
import { onValue, push, ref, set } from "firebase/database";
import { db } from "@/lib/firebase";
import { uploadImageToCloudinary, uploadMultipleImagesToCloudinary } from "@/lib/cloudinary-upload";

type Category = {
  id: string;
  name: string;
};

type ImageDraft = {
  id: string;
  file: File;
  previewUrl: string;
};

type AddProductDrawerProps = {
  isOpen: boolean;
  onCloseAction: () => void;
  onSuccessAction?: () => void;
};

type ProductPayload = {
  name: string;
  description: string;
  price: number;
  salePrice: number | null;
  stock: number;
  mainImage: string;
  images: string[];
  tags: string[];
  category: string;
  createdAt: number;
};

function toFriendlyCreateError(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error || "Unknown error");
  const lower = message.toLowerCase();

  if (lower.includes("permission_denied") || lower.includes("permission denied")) {
    return "Firebase rejected this write (permission denied). Check your Realtime Database rules for stock/products.";
  }

  if (lower.includes("cloudinary") || lower.includes("upload preset") || lower.includes("secure_url")) {
    return "Image upload failed. Check Cloudinary cloud name/upload preset and try again.";
  }

  if (lower.includes("missing cloudinary env vars")) {
    return "Cloudinary env vars are missing. Set NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME and NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET.";
  }

  return "Failed to create product. Please try again.";
}

const INITIAL_FORM = {
  name: "",
  description: "",
  price: "",
  salePrice: "",
  stock: "",
  category: "",
};

export default function AddProductDrawer({ isOpen, onCloseAction, onSuccessAction }: AddProductDrawerProps) {
  const [form, setForm] = useState(INITIAL_FORM);
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCategoryName, setNewCategoryName] = useState("");

  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);

  const [mainImage, setMainImage] = useState<ImageDraft | null>(null);
  const [albumImages, setAlbumImages] = useState<ImageDraft[]>([]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const categoriesRef = ref(db, "categories");
    const unsubscribe = onValue(categoriesRef, (snapshot) => {
      if (!snapshot.exists()) {
        setCategories([]);
        return;
      }

      const rows = Object.entries(snapshot.val() as Record<string, { name?: string }>).map(([id, raw]) => ({
        id,
        name: String(raw?.name || "Unnamed Category"),
      }));

      setCategories(rows);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!isOpen) {
      setErrorMessage("");
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const onEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !isSubmitting) {
        onCloseAction();
      }
    };

    window.addEventListener("keydown", onEscape);
    return () => window.removeEventListener("keydown", onEscape);
  }, [isOpen, isSubmitting, onCloseAction]);

  useEffect(() => {
    return () => {
      if (mainImage?.previewUrl) {
        URL.revokeObjectURL(mainImage.previewUrl);
      }
      albumImages.forEach((image) => URL.revokeObjectURL(image.previewUrl));
    };
  }, [mainImage, albumImages]);

  const canSubmit = useMemo(() => {
    return (
      !isSubmitting &&
      form.name.trim().length > 0 &&
      form.price.trim().length > 0 &&
      form.stock.trim().length > 0 &&
      form.category.trim().length > 0 &&
      Boolean(mainImage)
    );
  }, [form, mainImage, isSubmitting]);

  const updateForm = (key: keyof typeof INITIAL_FORM, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const resetForm = () => {
    setForm(INITIAL_FORM);
    setTagInput("");
    setTags([]);
    setNewCategoryName("");
    if (mainImage?.previewUrl) {
      URL.revokeObjectURL(mainImage.previewUrl);
    }
    albumImages.forEach((image) => URL.revokeObjectURL(image.previewUrl));
    setMainImage(null);
    setAlbumImages([]);
    setErrorMessage("");
  };

  const handleMainImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (mainImage?.previewUrl) {
      URL.revokeObjectURL(mainImage.previewUrl);
    }

    setMainImage({
      id: `${Date.now()}-${file.name}`,
      file,
      previewUrl: URL.createObjectURL(file),
    });
  };

  const handleAlbumImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || []);
    if (!selectedFiles.length) return;

    const mapped = selectedFiles.map((file) => ({
      id: `${Date.now()}-${Math.random().toString(16).slice(2)}-${file.name}`,
      file,
      previewUrl: URL.createObjectURL(file),
    }));

    setAlbumImages((prev) => [...prev, ...mapped]);
  };

  const removeMainImage = () => {
    if (mainImage?.previewUrl) {
      URL.revokeObjectURL(mainImage.previewUrl);
    }
    setMainImage(null);
  };

  const removeAlbumImage = (id: string) => {
    setAlbumImages((prev) => {
      const target = prev.find((image) => image.id === id);
      if (target?.previewUrl) {
        URL.revokeObjectURL(target.previewUrl);
      }
      return prev.filter((image) => image.id !== id);
    });
  };

  const addTag = () => {
    const normalized = tagInput.trim();
    if (!normalized) return;
    if (tags.some((tag) => tag.toLowerCase() === normalized.toLowerCase())) {
      setTagInput("");
      return;
    }

    setTags((prev) => [...prev, normalized]);
    setTagInput("");
  };

  const removeTag = (tagToRemove: string) => {
    setTags((prev) => prev.filter((tag) => tag !== tagToRemove));
  };

  const handleTagInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      addTag();
    }
  };

  const handleCreateCategoryInline = async () => {
    const name = newCategoryName.trim();
    if (!name) return;

    setErrorMessage("");
    setIsAddingCategory(true);

    try {
      const categoryRef = push(ref(db, "categories"));
      await set(categoryRef, { name });
      setForm((prev) => ({ ...prev, category: categoryRef.key || "" }));
      setNewCategoryName("");
    } catch (error) {
      console.error(error);
      setErrorMessage("Could not create category. Please try again.");
    } finally {
      setIsAddingCategory(false);
    }
  };

  const validateBeforeSubmit = () => {
    const mrp = Number(form.price);
    const salePrice = form.salePrice.trim() ? Number(form.salePrice) : null;

    if (!form.name.trim()) return "Product name is required.";
    if (!form.price.trim() || mrp < 0) return "Price is required and must be valid.";
    if (!form.stock.trim() || Number(form.stock) < 0) return "Stock is required and must be valid.";
    if (salePrice !== null && salePrice < 0) return "Selling price cannot be negative.";
    if (salePrice !== null && salePrice > mrp) return "Selling price must be less than or equal to MRP.";
    if (!form.category.trim()) return "Please select a category.";
    if (!mainImage) return "Main image is required.";
    return "";
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const validationError = validateBeforeSubmit();
    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    setErrorMessage("");
    setIsSubmitting(true);

    try {
      const uploadedMainImage = await uploadImageToCloudinary(mainImage!.file);
      const uploadedAlbumImages = await uploadMultipleImagesToCloudinary(albumImages.map((image) => image.file));

      const payload: ProductPayload = {
        name: form.name.trim(),
        description: form.description.trim(),
        price: Number(form.price),
        salePrice: form.salePrice.trim() ? Number(form.salePrice) : null,
        stock: Number(form.stock),
        mainImage: uploadedMainImage.secureUrl,
        images: uploadedAlbumImages,
        tags,
        category: form.category,
        createdAt: Date.now(),
      };

      const productRef = push(ref(db, "products"));
      if (!productRef.key) {
        throw new Error("Could not generate product id");
      }

      await set(ref(db, `stock/${productRef.key}`), {
        name: payload.name,
        description: payload.description,
        price: payload.price,
        salePrice: payload.salePrice,
        stock: payload.stock,
        category: payload.category,
        categoryId: payload.category,
        mainImage: payload.mainImage,
        imageUrl: payload.mainImage,
        displayImage: payload.mainImage,
        images: payload.images,
        tags: payload.tags,
        createdAt: payload.createdAt,
        updatedAt: Date.now(),
      });

      // Keep a mirror in /products, but don't block creation if only this path is restricted.
      try {
        await set(ref(db, `products/${productRef.key}`), payload);
      } catch (mirrorError) {
        console.warn("Non-blocking mirror write to products failed:", mirrorError);
      }

      resetForm();
      onSuccessAction?.();
      onCloseAction();
    } catch (error) {
      console.error(error);
      setErrorMessage(toFriendlyCreateError(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`fixed inset-0 z-50 ${isOpen ? "pointer-events-auto" : "pointer-events-none"}`}>
      <div
        onClick={() => !isSubmitting && onCloseAction()}
        className={`absolute inset-0 bg-black/45 transition-opacity duration-300 ${isOpen ? "opacity-100" : "opacity-0"}`}
      />

      <aside
        className={[
          "absolute right-0 top-0 h-full w-full max-w-[500px] bg-white shadow-2xl",
          "transition-transform duration-300 ease-out",
          "flex flex-col",
          isOpen ? "translate-x-0" : "translate-x-full",
        ].join(" ")}
      >
        <div className="flex items-center justify-between border-b border-brand-gray-100 px-5 py-4">
          <div>
            <h2 className="text-lg font-semibold text-brand-black">Add Product</h2>
            <p className="text-xs text-brand-gray-500">Create and publish a new catalog item</p>
          </div>
          <button
            type="button"
            onClick={onCloseAction}
            disabled={isSubmitting}
            className="rounded-lg p-2 text-brand-gray-500 hover:bg-brand-gray-100 disabled:opacity-50"
            aria-label="Close drawer"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex h-full flex-col">
          <div className="flex-1 space-y-6 overflow-y-auto px-5 py-5">
            <section className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wide text-brand-gray-500">Product Name *</label>
              <input
                type="text"
                value={form.name}
                onChange={(event) => updateForm("name", event.target.value)}
                placeholder="Classic white tee"
                className="w-full rounded-xl border border-brand-gray-200 px-3 py-2.5 text-sm outline-none transition focus:border-brand-black"
              />
            </section>

            <section className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wide text-brand-gray-500">Description</label>
              <textarea
                value={form.description}
                onChange={(event) => updateForm("description", event.target.value)}
                rows={4}
                placeholder="Optional product details, material, fit, etc."
                className="w-full resize-none rounded-xl border border-brand-gray-200 px-3 py-2.5 text-sm outline-none transition focus:border-brand-black"
              />
            </section>

            <section className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wide text-brand-gray-500">Price *</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.price}
                  onChange={(event) => updateForm("price", event.target.value)}
                  className="w-full rounded-xl border border-brand-gray-200 px-3 py-2.5 text-sm outline-none transition focus:border-brand-black"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wide text-brand-gray-500">Sale Price</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.salePrice}
                  onChange={(event) => updateForm("salePrice", event.target.value)}
                  className="w-full rounded-xl border border-brand-gray-200 px-3 py-2.5 text-sm outline-none transition focus:border-brand-black"
                />
              </div>
            </section>

            <section className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wide text-brand-gray-500">Stock *</label>
              <input
                type="number"
                min="0"
                step="1"
                value={form.stock}
                onChange={(event) => updateForm("stock", event.target.value)}
                className="w-full rounded-xl border border-brand-gray-200 px-3 py-2.5 text-sm outline-none transition focus:border-brand-black"
              />
            </section>

            <section className="space-y-4">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-brand-gray-500">Images</h3>

              <div className="space-y-2">
                <label className="text-xs font-medium text-brand-gray-600">Main Image *</label>
                <input type="file" accept="image/*" onChange={handleMainImageSelect} className="block w-full text-sm" />

                {mainImage && (
                  <div className="relative mt-2 h-24 w-24 overflow-hidden rounded-lg border border-brand-gray-200">
                    <Image
                      src={mainImage.previewUrl}
                      alt="Main preview"
                      fill
                      sizes="96px"
                      className="object-cover"
                    />
                    <button
                      type="button"
                      onClick={removeMainImage}
                      className="absolute right-1 top-1 rounded-full bg-black/70 p-1 text-white"
                      aria-label="Remove main image"
                    >
                      <X size={12} />
                    </button>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-brand-gray-600">Album Images</label>
                <input type="file" accept="image/*" multiple onChange={handleAlbumImageSelect} className="block w-full text-sm" />

                {albumImages.length > 0 && (
                  <div className="grid grid-cols-4 gap-2 pt-1">
                    {albumImages.map((image) => (
                      <div key={image.id} className="relative h-20 w-full overflow-hidden rounded-lg border border-brand-gray-200">
                        <Image
                          src={image.previewUrl}
                          alt="Album preview"
                          fill
                          sizes="(max-width: 640px) 25vw, 80px"
                          className="object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => removeAlbumImage(image.id)}
                          className="absolute right-1 top-1 rounded-full bg-black/70 p-1 text-white"
                          aria-label="Remove album image"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>

            <section className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wide text-brand-gray-500">Tags</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(event) => setTagInput(event.target.value)}
                  onKeyDown={handleTagInputKeyDown}
                  placeholder="summer"
                  className="w-full rounded-xl border border-brand-gray-200 px-3 py-2.5 text-sm outline-none transition focus:border-brand-black"
                />
                <button
                  type="button"
                  onClick={addTag}
                  className="inline-flex items-center gap-1 rounded-xl border border-brand-gray-200 px-3 py-2 text-sm hover:bg-brand-gray-50"
                >
                  <Plus size={14} />
                  Add
                </button>
              </div>

              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 rounded-full bg-brand-gray-100 px-2.5 py-1 text-xs text-brand-gray-700"
                    >
                      {tag}
                      <button type="button" onClick={() => removeTag(tag)} className="text-brand-gray-500">
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </section>

            <section className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wide text-brand-gray-500">Category *</label>
                <select
                  value={form.category}
                  onChange={(event) => updateForm("category", event.target.value)}
                  className="w-full rounded-xl border border-brand-gray-200 px-3 py-2.5 text-sm outline-none transition focus:border-brand-black"
                >
                  <option value="">Select category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="rounded-xl border border-brand-gray-200 p-3">
                <p className="mb-2 text-xs font-medium text-brand-gray-600">Create Category Inline</p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newCategoryName}
                    onChange={(event) => setNewCategoryName(event.target.value)}
                    placeholder="New category"
                    className="w-full rounded-xl border border-brand-gray-200 px-3 py-2 text-sm outline-none transition focus:border-brand-black"
                  />
                  <button
                    type="button"
                    onClick={handleCreateCategoryInline}
                    disabled={isAddingCategory}
                    className="rounded-xl bg-brand-black px-3 py-2 text-sm font-medium text-white disabled:opacity-50"
                  >
                    {isAddingCategory ? "Adding..." : "Add"}
                  </button>
                </div>
              </div>
            </section>

            {errorMessage ? (
              <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{errorMessage}</div>
            ) : null}
          </div>

          <div className="sticky bottom-0 border-t border-brand-gray-100 bg-white px-5 py-4">
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onCloseAction}
                disabled={isSubmitting}
                className="w-1/2 rounded-xl border border-brand-gray-200 py-2.5 text-sm font-medium text-brand-gray-700 hover:bg-brand-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!canSubmit}
                className="inline-flex w-1/2 items-center justify-center gap-2 rounded-xl bg-brand-black py-2.5 text-sm font-semibold text-white disabled:opacity-50"
              >
                {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : null}
                {isSubmitting ? "Uploading..." : "Create Product"}
              </button>
            </div>
          </div>
        </form>
      </aside>
    </div>
  );
}
