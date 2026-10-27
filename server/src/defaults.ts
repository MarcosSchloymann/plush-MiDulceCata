export type FooterColumn = { title: string; lines: string[] };

export const defaultColumns: FooterColumn[] = [
  {
    title: "TABLETAS",
    lines: ["Chocolate con leche", "Chocolate amargo", "Chocolate blanco", "Con almendras"],
  },
  {
    title: "ALFAJORES",
    lines: ["Maicena", "Chocolate", "Nuez", "Dulce de leche"],
  },
  {
    title: "BOMBONES",
    lines: ["Rellenos", "Con frutos", "Con ddl", "Surtidos"],
  },
  {
    title: "UBICACIÓN",
    lines: ["Buenos Aires, Argentina", "Envíos a todo el país", "Consultanos por WhatsApp"],
  },
];

export const defaultSettings = {
  id: "default",
  metaTitle: "Mi Dulce Cata | El chocolate de las reinas",
  metaDescription:
    "Catálogo de chocolates, bombones, alfajores y regalos artesanales. Un momento dulce, hecho para vos.",
  brandName: "MI DULCE CATA",
  brandScript: "El Chocolate de las Reinas",
  heroEyebrow: "Creamos momentos de felicidad",
  heroTitle: "Los sabores\nque se disfrutan,\nson sabores\nque se recuerdan.",
  heroSubtitle: "Mi Dulce Cata es un momento dulce, hecho para vos.",
  heroImage: "",
  heroImageMobile: "",
  heroImage2: "",
  heroImageMobile2: "",
  heroIntervalSeconds: 10,
  logoHeader: "",
  logoFooter: "",
  bodyBgImage: "",
  bgColor: "#fcfaf7",
  primaryColor: "#1a120c",
  secondaryColor: "#c4a574",
  textColor: "#2a2118",
  feature1: "CALIDAD",
  feature2: "INNOVACIÓN",
  feature3: "TENDENCIA",
  feature1Image: "",
  feature2Image: "",
  feature3Image: "",
  midBannerImage: "",
  midBannerImageMobile: "",
  promo1Title: "Regalos\ncorporativos",
  promo1Image: "",
  promo2Title: "Regalos\nempresariales",
  promo2Image: "",
  ctaLabel: "Armá tu caja",
  footerIntro:
    "Entrá al mundo de Mi Dulce Cata, elegí tus sabores favoritos y encontrá ese detalle que estabas buscando.\n\nPorque siempre hay un buen momento para algo dulce.",
  footerColumns: JSON.stringify(defaultColumns),
};

export type PublicSettings = {
  metaTitle: string;
  metaDescription: string;
  brandName: string;
  brandScript: string;
  heroEyebrow: string;
  heroTitle: string;
  heroSubtitle: string;
  heroImage: string;
  heroImageMobile: string;
  heroImage2: string;
  heroImageMobile2: string;
  heroIntervalSeconds: number;
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
  midBannerImage: string;
  midBannerImageMobile: string;
  promo1Title: string;
  promo1Image: string;
  promo2Title: string;
  promo2Image: string;
  ctaLabel: string;
  footerIntro: string;
  footerColumns: FooterColumn[];
  updatedAt: string;
};

export function parseColumns(raw: string): FooterColumn[] {
  try {
    const data = JSON.parse(raw) as unknown;
    if (!Array.isArray(data)) return defaultColumns;
    const columns = data.slice(0, 4).map((item) => {
      const column = item as { title?: unknown; lines?: unknown };
      const title = typeof column.title === "string" ? column.title : "";
      const lines = Array.isArray(column.lines)
        ? column.lines.filter((line): line is string => typeof line === "string").slice(0, 8)
        : [];
      return { title, lines };
    });
    while (columns.length < 4) columns.push({ title: "", lines: [] });
    return columns;
  } catch {
    return defaultColumns;
  }
}
