"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { Loader2, Trash2, Upload } from "lucide-react";
import toast from "react-hot-toast";
import { uploadImageToCloudinary } from "@/lib/cloudinary-upload";
import { createDMProof, deleteDMProof, listenToDMProofs } from "@/lib/db";
import type { DMProof } from "@/types";

export default function AdminDMProofsPage() {
  const [proofs, setProofs] = useState<DMProof[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => listenToDMProofs(setProofs), []);

  const previewUrl = useMemo(() => (file ? URL.createObjectURL(file) : ""), [file]);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const handleUpload = async () => {
    if (!file) {
      toast.error("Please choose an image first");
      return;
    }

    setUploading(true);
    try {
      const uploaded = await uploadImageToCloudinary(file);
      if (!uploaded.secureUrl) {
        throw new Error("Cloudinary did not return a secure URL");
      }
      await createDMProof({ image: uploaded.secureUrl });
      setFile(null);
      toast.success("DM proof uploaded");
    } catch {
      toast.error("Failed to upload DM proof");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await deleteDMProof(id);
      toast.success("DM proof deleted");
    } catch {
      toast.error("Failed to delete DM proof");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div>
      <h1 className="font-display text-2xl font-bold mb-1">DM Proofs</h1>
      <p className="text-sm text-brand-gray-400 mb-6">Upload and manage customer DM screenshots shown on homepage</p>

      <div className="bg-white border border-brand-gray-100 rounded-xl p-5 mb-6">
        <label className="text-sm font-medium">Upload DM Screenshot</label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="mt-2 w-full border rounded-lg px-3 py-2"
          disabled={uploading}
        />

        {previewUrl ? (
          <div className="mt-3 relative h-48 w-full max-w-xs overflow-hidden rounded-lg border border-brand-gray-100">
            <Image
              src={previewUrl}
              alt="DM proof preview"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 320px"
            />
          </div>
        ) : null}

        <button
          type="button"
          onClick={handleUpload}
          disabled={uploading || !file}
          className="mt-4 inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-brand-black text-white text-sm font-semibold disabled:opacity-60"
        >
          {uploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
          {uploading ? "Uploading..." : "Save DM Proof"}
        </button>
      </div>

      <div className="bg-white border border-brand-gray-100 rounded-xl p-5">
        <h2 className="text-base font-semibold mb-4">Existing DM Proofs</h2>

        {proofs.length === 0 ? (
          <p className="text-sm text-brand-gray-400">No DM proofs uploaded yet.</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {proofs.map((proof) => (
              <div key={proof.id} className="relative overflow-hidden rounded-lg border border-brand-gray-100 bg-brand-gray-50">
                <div className="relative aspect-[3/4]">
                  <Image
                    src={proof.image || "/placeholder.png"}
                    alt="Customer DM proof"
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => handleDelete(proof.id)}
                  disabled={deletingId === proof.id}
                  className="absolute top-2 right-2 inline-flex items-center justify-center rounded-full bg-black/75 p-1.5 text-white disabled:opacity-60"
                  aria-label="Delete DM proof"
                >
                  {deletingId === proof.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
