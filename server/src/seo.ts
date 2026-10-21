import fs from "fs";
import path from "path";
import { Request, Response } from "express";
import { getPublicSite } from "./site";
import { escapeHtml, escapeXml } from "./sanitize";
import { clientDistDir } from "./constants";

export function publicOrigin(req: Request): string {
  const configured = (process.env.PUBLIC_URL || "").replace(/\/$/, "");
  if (configured) return configured;
  return `${req.protocol}://${req.get("host")}`;
}

export async function renderIndex(req: Request, res: Response): Promise<void> {
  const indexPath = path.join(clientDistDir, "index.html");
  if (!fs.existsSync(indexPath)) {
    res.status(503).send("La aplicación todavía no está compilada. Ejecutá npm run build.");
    return;
  }

  const template = fs.readFileSync(indexPath, "utf8");
  const isAdmin = req.path.startsWith("/admin");
  let meta = `<title>Administración | Mi Dulce Cata</title>
    <meta name="robots" content="noindex, nofollow" />`;

  if (!isAdmin) {
    const site = await getPublicSite();
    const slug = typeof req.query.producto === "string" ? req.query.producto : "";
    const product = slug ? site.products.find((item) => item.slug === slug) : undefined;
    const title = product ? `${product.title} | ${site.settings.brandName}` : site.settings.metaTitle;
    const description = product
      ? product.shortDesc || product.subtitle || site.settings.metaDescription
      : site.settings.metaDescription;
    const imageFile = product?.images[0]?.filename || site.settings.heroImage;
    const origin = publicOrigin(req);
    const url = product ? `${origin}/?producto=${encodeURIComponent(product.slug)}` : `${origin}/`;
    const image = imageFile ? `${origin}/uploads/${imageFile}` : `${origin}/favicon.svg`;

    meta = `
    <title>${escapeHtml(title)}</title>
    <meta name="description" content="${escapeHtml(description)}" />
    <link rel="canonical" href="${escapeHtml(url)}" />
    <meta property="og:type" content="${product ? "product" : "website"}" />
    <meta property="og:locale" content="es_AR" />
    <meta property="og:site_name" content="${escapeHtml(site.settings.brandName)}" />
    <meta property="og:title" content="${escapeHtml(title)}" />
    <meta property="og:description" content="${escapeHtml(description)}" />
    <meta property="og:url" content="${escapeHtml(url)}" />
    <meta property="og:image" content="${escapeHtml(image)}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escapeHtml(title)}" />
    <meta name="twitter:description" content="${escapeHtml(description)}" />
    <meta name="twitter:image" content="${escapeHtml(image)}" />
    `.trim();
  }

  const html = template.replace(/<!--app-meta:start-->[\s\S]*?<!--app-meta:end-->/, meta);
  res.setHeader("Cache-Control", "no-cache");
  res.type("html").send(html);
}

export async function renderRobots(req: Request, res: Response): Promise<void> {
  const origin = publicOrigin(req);
  res.type("text/plain").send(`User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /api/\nSitemap: ${origin}/sitemap.xml\n`);
}

export async function renderSitemap(req: Request, res: Response): Promise<void> {
  const site = await getPublicSite();
  const origin = publicOrigin(req);
  const urls = [
    { loc: `${origin}/`, lastmod: site.settings.updatedAt },
    ...site.products.map((product) => ({
      loc: `${origin}/?producto=${encodeURIComponent(product.slug)}`,
      lastmod: product.updatedAt,
    })),
  ];
  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (url) => `  <url>
    <loc>${escapeXml(url.loc)}</loc>
    <lastmod>${escapeXml(url.lastmod)}</lastmod>
  </url>`
  )
  .join("\n")}
</urlset>`;
  res.type("application/xml").send(body);
}
