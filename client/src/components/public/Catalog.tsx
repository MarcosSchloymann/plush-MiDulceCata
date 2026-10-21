import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Product } from "@/lib/types";
import { ProductCard } from "./ProductCard";

export function Catalog({
  products,
  favorites,
  onOpen,
  onFavorite,
}: {
  products: Product[];
  favorites: string[];
  onOpen: (product: Product) => void;
  onFavorite: (id: string) => void;
}) {
  const scroller = useRef<HTMLDivElement>(null);

  function scrollByCard(direction: number) {
    const el = scroller.current;
    if (!el) return;
    const card = el.querySelector("article")?.parentElement;
    const width = card ? card.getBoundingClientRect().width + 16 : 240;
    el.scrollBy({ left: direction * width, behavior: "smooth" });
  }

  if (products.length === 0) {
    return (
      <p className="px-4 py-16 text-center font-display text-2xl">No hay productos para esta búsqueda.</p>
    );
  }

  return (
    <div className="relative max-w-full overflow-hidden">
      <button
        type="button"
        aria-label="Productos anteriores"
        onClick={() => scrollByCard(-1)}
        className="absolute left-1 top-[38%] z-10 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 shadow md:flex"
      >
        <ChevronLeft />
      </button>
      <div
        ref={scroller}
        className="no-scrollbar flex w-full min-w-0 snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth px-4 pb-2 md:px-12"
      >
        {products.map((product) => (
          <div
            key={product.id}
            className="w-[78%] shrink-0 snap-start sm:w-[46%] md:w-[31%] lg:w-[calc((100%-5rem)/4)] xl:w-[calc((100%-5rem)/6)]"
          >
            <ProductCard
              product={product}
              favorite={favorites.includes(product.id)}
              onOpen={() => onOpen(product)}
              onFavorite={() => onFavorite(product.id)}
            />
          </div>
        ))}
      </div>
      <button
        type="button"
        aria-label="Productos siguientes"
        onClick={() => scrollByCard(1)}
        className="absolute right-1 top-[38%] z-10 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 shadow md:flex"
      >
        <ChevronRight />
      </button>
    </div>
  );
}
