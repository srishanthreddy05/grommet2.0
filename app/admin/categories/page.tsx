"use client";

import { useEffect, useState } from "react";
import { Trash2, Plus, Pencil, X } from "lucide-react";
import toast from "react-hot-toast";
import Cropper, { type Area } from "react-easy-crop";
import { listenToCategories, createCategory, updateCategory, deleteCategory } from "@/lib/db";
import { uploadImageToCloudinary } from "@/lib/cloudinary-upload";
import type { Category } from "@/types";

function createImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.src = url;
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Failed to load image"));
  });
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState("");
  const [order, setOrder] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState("");
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [showCrop, setShowCrop] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => listenToCategories(setCategories), []);

  const uploadImage = async () => {
    if (!imageFile) return imageUrl;
    const uploaded = await uploadImageToCloudinary(imageFile);
    return uploaded.secureUrl;
  };

  const onSelectFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    const objectUrl = URL.createObjectURL(selected);
    setImageFile(selected);
    setImageSrc(objectUrl);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setShowCrop(true);
  };

  const getCroppedImg = async (): Promise<Blob> => {
    if (!imageSrc || !croppedAreaPixels) {
      throw new Error("Crop area is not ready");
    }

    const image = await createImage(imageSrc);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      throw new Error("Canvas context is unavailable");
    }

    canvas.width = croppedAreaPixels.width;
    canvas.height = croppedAreaPixels.height;

    ctx.drawImage(
      image,
      croppedAreaPixels.x,
      croppedAreaPixels.y,
      croppedAreaPixels.width,
      croppedAreaPixels.height,
      0,
      0,
      croppedAreaPixels.width,
      croppedAreaPixels.height
    );

    return new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob);
          return;
        }
        reject(new Error("Failed to create cropped image"));
      }, "image/jpeg");
    });
  };

  const handleCrop = async () => {
    try {
      const croppedBlob = await getCroppedImg();
      const croppedFile = new File([croppedBlob], "category-cropped.jpg", {
        type: "image/jpeg",
      });

      const previewUrl = URL.createObjectURL(croppedFile);
      setImageFile(croppedFile);
      setImageSrc(previewUrl);
      setShowCrop(false);
    } catch {
      toast.error("Failed to crop image");
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error("Category name is required");
      return;
    }
    if (!order || Number(order) <= 0) {
      alert("Enter valid order");
      return;
    }
    if (!editingId && !imageFile) {
      toast.error("Category image is required");
      return;
    }
    if (showCrop) {
      toast.error("Please crop and save the selected image first");
      return;
    }

    setSaving(true);
    try {
      const uploadedImage = await uploadImage();

      if (editingId) {
        await updateCategory(editingId, {
          name: name.trim(),
          order: Number(order),
          image: uploadedImage,
        });
        toast.success("Category updated");
      } else {
        await createCategory({
          name: name.trim(),
          order: Number(order),
          image: uploadedImage,
        } as Omit<Category, "id">);
        toast.success("Category created");
      }
      setName("");
      setOrder("");
      setImageFile(null);
      setImageSrc(null);
      setImageUrl("");
      setEditingId(null);
    } catch {
      toast.error(editingId ? "Failed to update category" : "Failed to create category");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (category: Category) => {
    setEditingId(category.id);
    setName(category.name || "");
    setOrder(category.order ? String(category.order) : "");
    setImageUrl(category.image || "");
    setImageSrc(category.image || null);
    setImageFile(null);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setName("");
    setOrder("");
    setImageFile(null);
    setImageSrc(null);
    setImageUrl("");
    setShowCrop(false);
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
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-sm font-medium">Category Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Category name"
              className="w-full border rounded-lg px-3 py-2 mt-1"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Display Order</label>
            <input
              type="number"
              placeholder="1 = first"
              value={order}
              onChange={(e) => setOrder(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 mt-1"
            />
            <p className="text-xs text-gray-500 mt-1">Lower number appears first</p>
          </div>
          <div className="sm:col-span-2">
            <label className="text-sm font-medium">Category Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={onSelectFile}
              className="w-full border rounded-lg px-3 py-2 mt-1"
            />
            {(imageSrc || imageUrl) && (
              <img
                src={imageSrc || imageUrl}
                alt="Category preview"
                className="w-20 h-20 rounded-full object-cover mt-2"
              />
            )}
          </div>
        </div>

        <div className="mt-4 flex items-center gap-2">
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-full bg-brand-black text-white text-sm font-semibold disabled:opacity-60"
          >
            <Plus size={15} /> {editingId ? "Update Category" : "Add Category"}
          </button>
          {editingId ? (
            <button
              onClick={handleCancelEdit}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-full border border-brand-gray-200 text-sm font-semibold"
            >
              <X size={15} /> Cancel
            </button>
          ) : null}
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
                <th className="text-left py-3 px-4 text-xs uppercase tracking-wider text-brand-gray-400">Order</th>
                <th className="text-left py-3 px-4 text-xs uppercase tracking-wider text-brand-gray-400">Image</th>
                <th className="text-right py-3 px-4 text-xs uppercase tracking-wider text-brand-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((category) => (
                <tr key={category.id} className="border-b border-brand-gray-50">
                  <td className="py-3 px-4">{category.name}</td>
                  <td className="py-3 px-4">{category.order || "-"}</td>
                  <td className="py-3 px-4">
                    {category.image ? (
                      <img src={category.image} alt={category.name} className="w-10 h-10 rounded-full object-cover" />
                    ) : (
                      <span className="text-xs text-brand-gray-400">No image</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => handleEdit(category)}
                      className="inline-flex items-center justify-center p-1.5 rounded-md text-brand-gray-500 hover:bg-brand-gray-100 mr-2"
                    >
                      <Pencil size={14} />
                    </button>
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

      {showCrop && imageSrc ? (
        <div className="fixed inset-0 z-50 bg-black/80 flex flex-col items-center justify-center px-4">
          <div className="relative w-[300px] h-[300px] bg-black rounded-lg overflow-hidden">
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              aspect={1}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={(_, croppedPixels) => setCroppedAreaPixels(croppedPixels)}
            />
          </div>

          <input
            type="range"
            min={1}
            max={3}
            step={0.1}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="mt-4 w-[300px]"
          />

          <div className="mt-4 flex items-center gap-2">
            <button
              onClick={handleCrop}
              className="bg-brand-black text-white px-4 py-2 rounded-md text-sm font-semibold"
            >
              Crop & Save
            </button>
            <button
              onClick={() => setShowCrop(false)}
              className="bg-white text-brand-black px-4 py-2 rounded-md text-sm font-semibold"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
