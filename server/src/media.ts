import { v2 as cloudinary } from "cloudinary";

let configured = false;

export function isCloudinaryEnabled(): boolean {
  return Boolean(
    process.env.CLOUDINARY_CLOUD_NAME?.trim() &&
      process.env.CLOUDINARY_API_KEY?.trim() &&
      process.env.CLOUDINARY_API_SECRET?.trim()
  );
}

export function cloudinaryFolder(): string {
  return (process.env.CLOUDINARY_FOLDER || "midulcecata").replace(/^\/+|\/+$/g, "");
}

export function ensureCloudinary(): void {
  if (!isCloudinaryEnabled() || configured) return;
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
  configured = true;
}

export function publicIdFromFilename(filename: string): string {
  const id = filename.replace(/\.webp$/i, "");
  return `${cloudinaryFolder()}/${id}`;
}

/** Base pública para armar URLs en el cliente (sin barra final). Vacío = disco local. */
export function mediaBaseUrl(): string {
  if (!isCloudinaryEnabled()) return "";
  const cloud = process.env.CLOUDINARY_CLOUD_NAME!.trim();
  return `https://res.cloudinary.com/${cloud}/image/upload/f_auto,q_auto/${cloudinaryFolder()}`;
}

export function absoluteMediaUrl(filename: string, origin = ""): string {
  if (!filename) return "";
  if (isCloudinaryEnabled()) {
    const id = filename.replace(/\.webp$/i, "");
    return `${mediaBaseUrl()}/${id}`;
  }
  const base = origin.replace(/\/$/, "");
  return base ? `${base}/uploads/${filename}` : `/uploads/${filename}`;
}

export async function uploadImageBuffer(buffer: Buffer, filename: string): Promise<void> {
  ensureCloudinary();
  const publicId = publicIdFromFilename(filename);
  await new Promise<void>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        public_id: publicId,
        resource_type: "image",
        format: "webp",
        overwrite: true,
        invalidate: true,
      },
      (error) => {
        if (error) reject(error);
        else resolve();
      }
    );
    stream.end(buffer);
  });
}

export async function destroyCloudinaryImage(filename: string): Promise<void> {
  if (!isCloudinaryEnabled()) return;
  ensureCloudinary();
  try {
    await cloudinary.uploader.destroy(publicIdFromFilename(filename), { resource_type: "image" });
  } catch {
    // Si ya no existe en Cloudinary, seguimos.
  }
}
