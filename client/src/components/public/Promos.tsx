import type { Settings, Socials } from "@/lib/types";
import { media, whatsappHref } from "@/lib/utils";

export function Promos({ settings, socials }: { settings: Settings; socials: Socials }) {
  const cta = whatsappHref(socials.whatsapp, "Hola! Quiero armar una caja de Mi Dulce Cata.");
  return (
    <section className="px-4 pb-14 pt-4 md:px-8">
      <div className="mx-auto grid max-w-[1100px] gap-4 md:grid-cols-2">
        <article className="relative flex min-h-64 items-center overflow-hidden bg-[var(--primary)]">
          {settings.promo1Image && (
            <img src={media(settings.promo1Image)} alt="" className="absolute inset-0 h-full w-full object-cover" loading="lazy" />
          )}
          <div className="absolute inset-0 bg-black/45" />
          <h2 className="relative z-10 whitespace-pre-line px-8 font-display text-4xl leading-tight text-white md:text-5xl">
            {settings.promo1Title}
          </h2>
        </article>
        <article className="grid min-h-64 overflow-hidden bg-[#f3e6d4] sm:grid-cols-[1.1fr_0.9fr]">
          {settings.promo2Image && (
            <img src={media(settings.promo2Image)} alt="" className="h-52 w-full object-cover sm:h-full" loading="lazy" />
          )}
          <div className="flex items-center justify-center px-6 py-8">
            <h2 className="whitespace-pre-line text-center font-display text-4xl leading-tight text-[#a68455] md:text-[2.6rem]">
              {settings.promo2Title}
            </h2>
          </div>
        </article>
      </div>
      <div className="mt-8 text-center">
        {cta ? (
          <a
            href={cta}
            target="_blank"
            rel="noreferrer"
            className="inline-flex min-w-52 items-center justify-center px-10 py-3 font-display text-2xl text-[var(--primary)]"
            style={{ background: "color-mix(in srgb, var(--secondary) 38%, white)" }}
          >
            {settings.ctaLabel}
          </a>
        ) : (
          <a
            href="#contacto"
            className="inline-flex min-w-52 items-center justify-center px-10 py-3 font-display text-2xl text-[var(--primary)]"
            style={{ background: "color-mix(in srgb, var(--secondary) 38%, white)" }}
          >
            {settings.ctaLabel}
          </a>
        )}
      </div>
    </section>
  );
}
