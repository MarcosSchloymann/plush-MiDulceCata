import type { Settings } from "@/lib/types";
import { media } from "@/lib/utils";

/** Banner a lo ancho debajo del catálogo (ej. Tour Cacao). El diseño va dentro de la imagen. */
export function MidBanner({ settings }: { settings: Settings }) {
  const src = media(settings.midBannerImage);
  if (!src) return null;

  return (
    <section className="w-full" aria-label="Promoción">
      <img
        src={src}
        alt=""
        className="block h-auto w-full object-cover object-center"
        width={1920}
        height={560}
        loading="lazy"
        decoding="async"
      />
    </section>
  );
}
