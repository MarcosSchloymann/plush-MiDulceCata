import { Heart } from "lucide-react";
import type { Product } from "@/lib/types";
import { media } from "@/lib/utils";

export function ProductCard({
  product,
  favorite,
  onOpen,
  onFavorite,
}: {
  product: Product;
  favorite: boolean;
  onOpen: () => void;
  onFavorite: () => void;
}) {
  const image = product.images[0];
  return (
    <article className="flex h-full flex-col bg-[#f5eeeb] p-3 shadow-[0_1px_0_rgba(26,18,12,0.04)]">
      <button type="button" onClick={onOpen} className="block w-full text-left">
        <span className="block aspect-[4/3] w-full overflow-hidden bg-[#efe6dc]">
          {image ? (
            <img
              src={media(image.filename)}
              alt={image.alt || product.title}
              width={1200}
              height={900}
              loading="lazy"
              decoding="async"
              className="h-full w-full object-cover"
            />
          ) : null}
        </span>
        <span className="block px-1 pt-3">
          <span className="line-clamp-2 block min-h-[2.6rem] font-display text-[15px] leading-tight text-[#3a3532]">
            {product.title}
          </span>
          <span className="mt-1 line-clamp-2 block min-h-[2rem] font-display text-sm text-[#3a3532]/80">
            {product.shortDesc}
          </span>
        </span>
      </button>
      <div className="mt-auto flex items-center gap-2 px-1 pb-1 pt-3">
        <button
          type="button"
          onClick={onOpen}
          className="h-9 flex-1 bg-[#c9a88c] text-[10px] font-medium uppercase tracking-[0.18em] text-white transition hover:opacity-90"
        >
          Consultar
        </button>
        <button
          type="button"
          aria-label={favorite ? `Quitar ${product.title} de favoritos` : `Guardar ${product.title} en favoritos`}
          aria-pressed={favorite}
          onClick={onFavorite}
          className="flex h-9 w-9 items-center justify-center text-[#3a3532]"
        >
          <Heart className="h-4 w-4" fill={favorite ? "currentColor" : "none"} />
        </button>
      </div>
    </article>
  );
}
