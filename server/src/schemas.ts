import { z } from "zod";
import { CATEGORIES } from "./constants";
import { cleanText } from "./sanitize";

const text = (max: number, min = 0) =>
  z
    .string()
    .max(max, `Usá como máximo ${max} caracteres`)
    .transform(cleanText)
    .pipe(z.string().min(min, min ? `Usá al menos ${min} caracteres` : "Texto inválido"));

const hex = z
  .string()
  .trim()
  .regex(/^#[0-9a-fA-F]{6}$/, "Elegí un color hexadecimal, por ejemplo #1a120c");

const filename = z
  .string()
  .regex(/^img_[a-f0-9]{32}\.webp$/, "Imagen inválida");

export const loginSchema = z.object({
  username: z.string().trim().min(1, "Ingresá el usuario").max(60),
  password: z.string().min(1, "Ingresá la contraseña").max(200),
});

export const passwordSchema = z.object({
  currentPassword: z.string().min(1, "Ingresá la contraseña actual").max(200),
  newPassword: z
    .string()
    .min(8, "La nueva contraseña debe tener al menos 8 caracteres")
    .max(200),
});

export const productSchema = z.object({
  title: text(120, 2),
  subtitle: text(160),
  shortDesc: text(300),
  fullDesc: text(5000),
  category: z.enum(CATEGORIES, { errorMap: () => ({ message: "Elegí una categoría válida" }) }),
  published: z.boolean().optional().default(true),
  images: z
    .array(z.object({ filename }))
    .max(8, "Podés cargar hasta 8 imágenes")
    .default([]),
});

export const reorderSchema = z.object({
  ids: z.array(z.string().min(1)).min(1),
});

export const socialsSchema = z.object({
  whatsapp: z.string().max(300).default(""),
  facebook: z.string().max(300).default(""),
  instagram: z.string().max(300).default(""),
});

const columnSchema = z.object({
  title: text(40),
  lines: z.array(text(80)).max(8).default([]),
});

export const settingsSchema = z.object({
  metaTitle: text(80, 2),
  metaDescription: text(180, 10),
  brandName: text(40, 2),
  brandScript: text(60),
  heroEyebrow: text(80),
  heroTitle: text(180, 2),
  heroSubtitle: text(220),
  heroImage: z.union([filename, z.literal("")]).default(""),
  heroImageMobile: z.union([filename, z.literal("")]).default(""),
  heroImage2: z.union([filename, z.literal("")]).default(""),
  heroImageMobile2: z.union([filename, z.literal("")]).default(""),
  heroIntervalSeconds: z.coerce
    .number()
    .int("Usá un número entero")
    .min(3, "Mínimo 3 segundos")
    .max(120, "Máximo 120 segundos")
    .default(10),
  logoHeader: z.union([filename, z.literal("")]).default(""),
  logoFooter: z.union([filename, z.literal("")]).default(""),
  bodyBgImage: z.union([filename, z.literal("")]).default(""),
  bgColor: hex,
  primaryColor: hex,
  secondaryColor: hex,
  textColor: hex,
  feature1: text(24, 2),
  feature2: text(24, 2),
  feature3: text(24, 2),
  feature1Image: z.union([filename, z.literal("")]).default(""),
  feature2Image: z.union([filename, z.literal("")]).default(""),
  feature3Image: z.union([filename, z.literal("")]).default(""),
  midBannerImage: z.union([filename, z.literal("")]).default(""),
  midBannerImageMobile: z.union([filename, z.literal("")]).default(""),
  promo1Title: text(80),
  promo1Image: z.union([filename, z.literal("")]).default(""),
  promo2Title: text(80),
  promo2Image: z.union([filename, z.literal("")]).default(""),
  ctaLabel: text(40, 2),
  footerIntro: text(800),
  footerColumns: z.array(columnSchema).length(4),
});

export const uploadKindSchema = z.enum(["product", "hero", "banner", "background", "logo", "icon"]);
