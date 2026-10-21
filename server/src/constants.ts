import path from "path";

export const serverRoot = path.resolve(__dirname, "..");
export const uploadsDir = path.join(serverRoot, "uploads");
export const seedImagesDir = path.join(serverRoot, "seed-images");
export const clientDistDir = path.resolve(serverRoot, "../client/dist");

export const CATEGORIES = [
  "cajas",
  "chocolates",
  "alfajores",
  "regalos",
  "novedades",
] as const;

export type Category = (typeof CATEGORIES)[number];

export const PLATFORMS = ["whatsapp", "facebook", "instagram"] as const;
export type Platform = (typeof PLATFORMS)[number];

export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
export const MAX_GALLERY = 8;
