import fs from "fs";
import path from "path";
import { Router } from "express";
import multer from "multer";
import { prisma } from "../db";
import { productSchema, reorderSchema, settingsSchema, socialsSchema, uploadKindSchema } from "../schemas";
import { slugify } from "../sanitize";
import { saveOptimizedImage, removeUpload } from "../images";
import { uploadsDir, MAX_IMAGE_BYTES, PLATFORMS, Platform } from "../constants";
import { normalizeSocialUrl } from "../social";
import { mapSettings, serializeProduct } from "../site";
import { assertFilename } from "../sanitize";
import { absoluteMediaUrl, mediaBaseUrl } from "../media";

export const adminRouter = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_IMAGE_BYTES, files: 1 },
});

function httpError(error: unknown, res: import("express").Response, next: import("express").NextFunction) {
  const status = (error as { status?: number }).status;
  if (status && status < 500) {
    res.status(status).json({ error: (error as Error).message });
    return;
  }
  next(error);
}

async function uniqueSlug(title: string, currentId?: string): Promise<string> {
  const base = slugify(title);
  let slug = base;
  let n = 2;
  while (true) {
    const found = await prisma.product.findUnique({ where: { slug } });
    if (!found || found.id === currentId) return slug;
    slug = `${base}-${n}`;
    n += 1;
  }
}

adminRouter.get("/summary", async (_req, res, next) => {
  try {
    const [productCount, socials, settings, latestProduct] = await Promise.all([
      prisma.product.count(),
      prisma.socialLink.findMany(),
      prisma.siteSetting.findUnique({ where: { id: "default" } }),
      prisma.product.findFirst({ orderBy: { updatedAt: "desc" } }),
    ]);
    const dates = [
      settings?.updatedAt,
      latestProduct?.updatedAt,
      ...socials.map((item) => item.updatedAt),
    ].filter((date): date is Date => Boolean(date));
    const lastModified = dates.sort((a, b) => b.getTime() - a.getTime())[0] ?? null;
    res.json({
      productCount,
      socialConfigured: socials.filter((item) => item.url.trim()).length,
      socialTotal: PLATFORMS.length,
      lastModified: lastModified ? lastModified.toISOString() : null,
    });
  } catch (error) {
    next(error);
  }
});

adminRouter.get("/products", async (_req, res, next) => {
  try {
    const products = await prisma.product.findMany({
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      include: { images: { orderBy: { sortOrder: "asc" } } },
    });
    res.json(products.map(serializeProduct));
  } catch (error) {
    next(error);
  }
});

adminRouter.get("/products/:id", async (req, res, next) => {
  try {
    const product = await prisma.product.findUnique({
      where: { id: req.params.id },
      include: { images: { orderBy: { sortOrder: "asc" } } },
    });
    if (!product) {
      res.status(404).json({ error: "Producto no encontrado" });
      return;
    }
    res.json(serializeProduct(product));
  } catch (error) {
    next(error);
  }
});

adminRouter.post("/products", async (req, res, next) => {
  try {
    const data = productSchema.parse(req.body);
    const slug = await uniqueSlug(data.title);
    const max = await prisma.product.aggregate({ _max: { sortOrder: true } });
    const product = await prisma.product.create({
      data: {
        title: data.title,
        subtitle: data.subtitle,
        shortDesc: data.shortDesc,
        fullDesc: data.fullDesc,
        category: data.category,
        published: data.published,
        slug,
        sortOrder: (max._max.sortOrder ?? -1) + 1,
        images: {
          create: data.images.map((image, index) => ({
            filename: image.filename,
            alt: data.title,
            isPrimary: index === 0,
            sortOrder: index,
          })),
        },
      },
      include: { images: true },
    });
    res.status(201).json(serializeProduct(product));
  } catch (error) {
    httpError(error, res, next);
  }
});

adminRouter.put("/products/reorder", async (req, res, next) => {
  try {
    const data = reorderSchema.parse(req.body);
    await prisma.$transaction(
      data.ids.map((id, index) =>
        prisma.product.update({ where: { id }, data: { sortOrder: index } })
      )
    );
    res.json({ ok: true });
  } catch (error) {
    httpError(error, res, next);
  }
});

adminRouter.put("/products/:id", async (req, res, next) => {
  try {
    const current = await prisma.product.findUnique({
      where: { id: req.params.id },
      include: { images: true },
    });
    if (!current) {
      res.status(404).json({ error: "Producto no encontrado" });
      return;
    }
    const data = productSchema.parse(req.body);
    const slug = await uniqueSlug(data.title, current.id);
    const nextNames = new Set(data.images.map((image) => image.filename));
    const removed = current.images.filter((image) => !nextNames.has(image.filename));

    const product = await prisma.product.update({
      where: { id: current.id },
      data: {
        title: data.title,
        subtitle: data.subtitle,
        shortDesc: data.shortDesc,
        fullDesc: data.fullDesc,
        category: data.category,
        published: data.published,
        slug,
        images: {
          deleteMany: {},
          create: data.images.map((image, index) => ({
            filename: image.filename,
            alt: data.title,
            isPrimary: index === 0,
            sortOrder: index,
          })),
        },
      },
      include: { images: true },
    });

    await Promise.all(removed.map((image) => removeUpload(image.filename)));
    res.json(serializeProduct(product));
  } catch (error) {
    httpError(error, res, next);
  }
});

adminRouter.delete("/products/:id", async (req, res, next) => {
  try {
    const product = await prisma.product.findUnique({
      where: { id: req.params.id },
      include: { images: true },
    });
    if (!product) {
      res.status(404).json({ error: "Producto no encontrado" });
      return;
    }
    await prisma.product.delete({ where: { id: product.id } });
    await Promise.all(product.images.map((image) => removeUpload(image.filename)));
    res.json({ ok: true });
  } catch (error) {
    next(error);
  }
});

adminRouter.post("/uploads", upload.single("file"), async (req, res, next) => {
  try {
    if (!req.file) {
      res.status(400).json({ error: "Elegí una imagen" });
      return;
    }
    const kind = uploadKindSchema.parse(req.body.kind || "product");
    const filename = await saveOptimizedImage(req.file.buffer, kind);
    res.status(201).json({ filename, url: absoluteMediaUrl(filename), mediaBase: mediaBaseUrl() });
  } catch (error) {
    httpError(error, res, next);
  }
});

adminRouter.delete("/uploads/:filename", async (req, res, next) => {
  try {
    const filename = assertFilename(req.params.filename);
    const linked = await prisma.productImage.findFirst({ where: { filename } });
    const settings = await prisma.siteSetting.findUnique({ where: { id: "default" } });
    const usedBySettings =
      settings &&
      [
        settings.heroImage,
        settings.logoHeader,
        settings.logoFooter,
        settings.bodyBgImage,
        settings.feature1Image,
        settings.feature2Image,
        settings.feature3Image,
        settings.promo1Image,
        settings.promo2Image,
      ].includes(filename);
    if (linked || usedBySettings) {
      res.status(400).json({ error: "La imagen está en uso. Guardá los cambios antes de eliminarla." });
      return;
    }
    await removeUpload(filename);
    res.json({ ok: true });
  } catch (error) {
    httpError(error, res, next);
  }
});

adminRouter.get("/socials", async (_req, res, next) => {
  try {
    const rows = await prisma.socialLink.findMany();
    const socials = { whatsapp: "", facebook: "", instagram: "" };
    for (const row of rows) socials[row.platform as Platform] = row.url;
    res.json(socials);
  } catch (error) {
    next(error);
  }
});

adminRouter.put("/socials", async (req, res, next) => {
  try {
    const data = socialsSchema.parse(req.body);
    const normalized = {
      whatsapp: normalizeSocialUrl("whatsapp", data.whatsapp),
      facebook: normalizeSocialUrl("facebook", data.facebook),
      instagram: normalizeSocialUrl("instagram", data.instagram),
    };
    await prisma.$transaction(
      PLATFORMS.map((platform) =>
        prisma.socialLink.upsert({
          where: { platform },
          update: { url: normalized[platform] },
          create: { platform, url: normalized[platform] },
        })
      )
    );
    res.json(normalized);
  } catch (error) {
    httpError(error, res, next);
  }
});

adminRouter.get("/settings", async (_req, res, next) => {
  try {
    const row = await prisma.siteSetting.findUnique({ where: { id: "default" } });
    res.json(mapSettings(row));
  } catch (error) {
    next(error);
  }
});

adminRouter.put("/settings", async (req, res, next) => {
  try {
    const data = settingsSchema.parse(req.body);
    const previous = await prisma.siteSetting.findUnique({ where: { id: "default" } });
    const saved = await prisma.siteSetting.upsert({
      where: { id: "default" },
      update: {
        ...data,
        footerColumns: JSON.stringify(data.footerColumns),
      },
      create: {
        id: "default",
        ...data,
        footerColumns: JSON.stringify(data.footerColumns),
      },
    });

    if (previous) {
      const previousFiles = [
        previous.heroImage,
        previous.logoHeader,
        previous.logoFooter,
        previous.bodyBgImage,
        previous.feature1Image,
        previous.feature2Image,
        previous.feature3Image,
        previous.promo1Image,
        previous.promo2Image,
      ];
      const nextFiles = new Set([
        data.heroImage,
        data.logoHeader,
        data.logoFooter,
        data.bodyBgImage,
        data.feature1Image,
        data.feature2Image,
        data.feature3Image,
        data.promo1Image,
        data.promo2Image,
      ]);
      await Promise.all(
        previousFiles
          .filter((filename) => filename && !nextFiles.has(filename))
          .map((filename) => removeUpload(filename))
      );
    }

    res.json(mapSettings(saved));
  } catch (error) {
    httpError(error, res, next);
  }
});

export function uploadsExist(): void {
  if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
}

export function uploadPath(filename: string): string {
  return path.join(uploadsDir, filename);
}
