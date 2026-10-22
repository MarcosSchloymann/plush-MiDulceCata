export type ProductImage = {
  id: string;
  filename: string;
  alt: string;
  isPrimary: boolean;
  sortOrder: number;
};

export type Product = {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  shortDesc: string;
  fullDesc: string;
  category: string;
  sortOrder: number;
  published: boolean;
  updatedAt: string;
  images: ProductImage[];
};

export type FooterColumn = {
  title: string;
  lines: string[];
};

export type Socials = {
  whatsapp: string;
  facebook: string;
  instagram: string;
};

export type Settings = {
  metaTitle: string;
  metaDescription: string;
  brandName: string;
  brandScript: string;
  heroEyebrow: string;
  heroTitle: string;
  heroSubtitle: string;
  heroImage: string;
  heroImageMobile: string;
  logoHeader: string;
  logoFooter: string;
  bodyBgImage: string;
  bgColor: string;
  primaryColor: string;
  secondaryColor: string;
  textColor: string;
  feature1: string;
  feature2: string;
  feature3: string;
  feature1Image: string;
  feature2Image: string;
  feature3Image: string;
  promo1Title: string;
  promo1Image: string;
  promo2Title: string;
  promo2Image: string;
  ctaLabel: string;
  footerIntro: string;
  footerColumns: FooterColumn[];
  updatedAt: string;
};

export type SiteData = {
  settings: Settings;
  products: Product[];
  socials: Socials;
  /** Si viene con valor, las imágenes se sirven desde Cloudinary. */
  mediaBase?: string;
};

export type Summary = {
  productCount: number;
  socialConfigured: number;
  socialTotal: number;
  lastModified: string | null;
};
