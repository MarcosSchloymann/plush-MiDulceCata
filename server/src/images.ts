import fs from "fs";
import path from "path";
import crypto from "crypto";
import sharp from "sharp";
import { uploadsDir, MAX_IMAGE_BYTES } from "./constants";
import { assertFilename } from "./sanitize";

export type ImageKind = "product" | "hero" | "banner" | "background" | "logo" | "icon";

const LIMITS: Record<ImageKind, number> = {
  product: 1400,
  hero: 1920,
  banner: 1600,
  background: 1920,
  logo: 800,
  icon: 256,
};

export function detectImage(buffer: Buffer): "jpeg" | "png" | "webp" | null {
  if (buffer.length < 12) return null;
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) return "jpeg";
  if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47
  ) {
    return "png";
  }
  if (
    buffer.toString("ascii", 0, 4) === "RIFF" &&
    buffer.toString("ascii", 8, 12) === "WEBP"
  ) {
    return "webp";
  }
  return null;
}

export async function saveOptimizedImage(buffer: Buffer, kind: ImageKind): Promise<string> {
  if (buffer.length > MAX_IMAGE_BYTES) {
    throw Object.assign(new Error("La imagen supera los 5 MB"), { status: 400 });
  }
  if (!detectImage(buffer)) {
    throw Object.assign(new Error("Formato no permitido. Usá JPG, PNG o WEBP"), {
      status: 400,
    });
  }

  const width = LIMITS[kind];
  let quality = 80;
  let output: Buffer;
  try {
    output = await sharp(buffer)
      .rotate()
      .resize({ width, height: width, fit: "inside", withoutEnlargement: true })
      .webp({ quality })
      .toBuffer();

    while (output.length > 300 * 1024 && quality > 52) {
      quality -= 8;
      output = await sharp(buffer)
        .rotate()
        .resize({ width, height: width, fit: "inside", withoutEnlargement: true })
        .webp({ quality })
        .toBuffer();
    }
  } catch {
    throw Object.assign(new Error("No se pudo procesar la imagen"), { status: 400 });
  }

  const filename = `img_${crypto.randomBytes(16).toString("hex")}.webp`;
  await fs.promises.mkdir(uploadsDir, { recursive: true });
  await fs.promises.writeFile(path.join(uploadsDir, filename), output);
  return filename;
}

export async function saveFromSource(
  source: Buffer | string,
  options?: { cover?: boolean; width?: number; height?: number }
): Promise<string> {
  const width = options?.width ?? 1200;
  const height = options?.height ?? 900;
  const pipeline = sharp(source).rotate();
  const resized = options?.cover
    ? pipeline.resize(width, height, { fit: "cover", position: "centre" })
    : pipeline.resize({ width, height, fit: "inside", withoutEnlargement: false });
  const output = await resized.webp({ quality: 76 }).toBuffer();
  const filename = `img_${crypto.randomBytes(16).toString("hex")}.webp`;
  await fs.promises.mkdir(uploadsDir, { recursive: true });
  await fs.promises.writeFile(path.join(uploadsDir, filename), output);
  return filename;
}

export function placeholderSvg(label: string): Buffer {
  const safe = label
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .slice(0, 42);
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="1200" height="900" viewBox="0 0 1200 900" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#4a2c1c"/>
      <stop offset="1" stop-color="#1a100c"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="900" fill="url(#bg)"/>
  <circle cx="600" cy="390" r="168" fill="#6a3b24"/>
  <circle cx="600" cy="390" r="112" fill="#c4a574"/>
  <circle cx="560" cy="360" r="28" fill="#3a2216" opacity="0.35"/>
  <rect x="470" y="470" width="260" height="18" rx="9" fill="#2a1810" opacity="0.25"/>
  <text x="600" y="690" text-anchor="middle" fill="#f6f0e8" font-family="Georgia, serif" font-size="42">${safe}</text>
</svg>`;
  return Buffer.from(svg);
}

export async function removeUpload(filename: string | null | undefined): Promise<void> {
  if (!filename) return;
  try {
    assertFilename(filename);
  } catch {
    return;
  }
  const target = path.join(uploadsDir, filename);
  await fs.promises.unlink(target).catch(() => undefined);
}
