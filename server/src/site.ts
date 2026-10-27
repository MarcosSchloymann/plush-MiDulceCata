import { SiteSetting, Product, ProductImage, SocialLink } from "@prisma/client";
import { prisma } from "./db";
import { defaultSettings, parseColumns, PublicSettings } from "./defaults";
import { PLATFORMS, Platform } from "./constants";
import { mediaBaseUrl } from "./media";

type ProductWithImages = Product & { images: ProductImage[] };

export function mapSettings(row: SiteSetting | null): PublicSettings {
  const source = row ?? { ...defaultSettings, updatedAt: new Date() };
  return {
    metaTitle: source.metaTitle,
    metaDescription: source.metaDescription,
    brandName: source.brandName,
    brandScript: source.brandScript,
    heroEyebrow: source.heroEyebrow,
    heroTitle: source.heroTitle,
    heroSubtitle: source.heroSubtitle,
    heroImage: source.heroImage,
    heroImageMobile: source.heroImageMobile ?? "",
    heroImage2: source.heroImage2 ?? "",
    heroImageMobile2: source.heroImageMobile2 ?? "",
    heroIntervalSeconds: source.heroIntervalSeconds ?? 10,
    logoHeader: source.logoHeader,
    logoFooter: source.logoFooter,
    bodyBgImage: source.bodyBgImage,
    bgColor: source.bgColor,
    primaryColor: source.primaryColor,
    secondaryColor: source.secondaryColor,
    textColor: source.textColor,
    feature1: source.feature1,
    feature2: source.feature2,
    feature3: source.feature3,
    feature1Image: source.feature1Image,
    feature2Image: source.feature2Image,
    feature3Image: source.feature3Image,
    midBannerImage: source.midBannerImage ?? "",
    midBannerImageMobile: source.midBannerImageMobile ?? "",
    promo1Title: source.promo1Title,
    promo1Image: source.promo1Image,
    promo2Title: source.promo2Title,
    promo2Image: source.promo2Image,
    ctaLabel: source.ctaLabel,
    footerIntro: source.footerIntro,
    footerColumns: parseColumns(source.footerColumns),
    updatedAt: source.updatedAt.toISOString(),
  };
}

export function mapSocials(rows: SocialLink[]): Record<Platform, string> {
  const socials = { whatsapp: "", facebook: "", instagram: "" };
  for (const row of rows) {
    if (PLATFORMS.includes(row.platform as Platform)) {
      socials[row.platform as Platform] = row.url;
    }
  }
  return socials;
}

export async function getPublicSite() {
  const [settingsRow, products, socialRows] = await Promise.all([
    prisma.siteSetting.findUnique({ where: { id: "default" } }),
    prisma.product.findMany({
      where: { published: true },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      include: { images: { orderBy: [{ sortOrder: "asc" }] } },
    }),
    prisma.socialLink.findMany(),
  ]);

  return {
    settings: mapSettings(settingsRow),
    products: products.map(serializeProduct),
    socials: mapSocials(socialRows),
    mediaBase: mediaBaseUrl(),
  };
}

export function serializeProduct(product: ProductWithImages) {
  const images = [...product.images].sort((a, b) => {
    if (a.isPrimary !== b.isPrimary) return a.isPrimary ? -1 : 1;
    return a.sortOrder - b.sortOrder;
  });
  return {
    id: product.id,
    slug: product.slug,
    title: product.title,
    subtitle: product.subtitle,
    shortDesc: product.shortDesc,
    fullDesc: product.fullDesc,
    category: product.category,
    sortOrder: product.sortOrder,
    published: product.published,
    updatedAt: product.updatedAt.toISOString(),
    images: images.map((image) => ({
      id: image.id,
      filename: image.filename,
      alt: image.alt || product.title,
      isPrimary: image.isPrimary,
      sortOrder: image.sortOrder,
    })),
  };
}
