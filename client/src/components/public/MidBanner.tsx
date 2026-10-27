import type { Settings } from "@/lib/types";
import { media } from "@/lib/utils";

/** Banner a lo ancho debajo del catálogo. Escritorio y celular; el diseño va dentro de la imagen. */
export function MidBanner({ settings }: { settings: Settings }) {
  const desktop = media(settings.midBannerImage);
  const mobile = media(settings.midBannerImageMobile) || desktop;
  if (!desktop && !mobile) return null;

  const hasSeparateMobile = Boolean(settings.midBannerImageMobile && settings.midBannerImage);

  return (
    <section className="w-full" aria-label="Promoción">
      <picture>
        {hasSeparateMobile && <source media="(min-width: 768px)" srcSet={desktop} />}
        <img
          src={mobile}
          alt=""
          className="block h-auto w-full object-cover object-center"
          width={hasSeparateMobile ? 1080 : 1920}
          height={hasSeparateMobile ? 1188 : 560}
          loading="lazy"
          decoding="async"
        />
      </picture>
    </section>
  );
}
