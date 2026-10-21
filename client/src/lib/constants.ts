export const CATEGORIES = [
  { slug: "cajas", label: "Cajas de chocolate" },
  { slug: "chocolates", label: "Chocolates" },
  { slug: "alfajores", label: "Alfajores" },
  { slug: "regalos", label: "Regalos" },
  { slug: "novedades", label: "Novedades" },
] as const;

export function categoryLabel(slug: string) {
  return CATEGORIES.find((item) => item.slug === slug)?.label ?? slug;
}
