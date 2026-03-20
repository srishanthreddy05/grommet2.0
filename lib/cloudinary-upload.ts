export type CloudinaryUploadResult = {
  secureUrl: string;
  publicId: string;
};

function getCloudinaryEnv() {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

  if (!cloudName || !uploadPreset) {
    throw new Error(
      "Missing Cloudinary env vars. Set NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME and NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET."
    );
  }

  return { cloudName, uploadPreset };
}

export async function uploadImageToCloudinary(file: File): Promise<CloudinaryUploadResult> {
  const { cloudName, uploadPreset } = getCloudinaryEnv();

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", uploadPreset);

  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Cloudinary upload failed: ${text || response.statusText}`);
  }

  const data = await response.json();
  return {
    secureUrl: String(data.secure_url || ""),
    publicId: String(data.public_id || ""),
  };
}

export async function uploadMultipleImagesToCloudinary(files: File[]): Promise<string[]> {
  const uploaded = await Promise.all(files.map((file) => uploadImageToCloudinary(file)));
  return uploaded.map((item) => item.secureUrl).filter(Boolean);
}
