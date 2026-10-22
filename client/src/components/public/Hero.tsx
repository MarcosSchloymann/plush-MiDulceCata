import type { Settings, Socials } from "@/lib/types";
import { media, whatsappHref } from "@/lib/utils";
import { IconWhatsapp } from "./Icons";

export function Hero({ settings, socials }: { settings: Settings; socials: Socials }) {
  const desktop = media(settings.heroImage);
  const mobile = media(settings.heroImageMobile) || desktop;
  const whatsapp = whatsappHref(socials.whatsapp, "Hola! Quiero hacer una consulta en Mi Dulce Cata.");

  return (
    <section
      id="inicio"
      className="relative min-h-[420px] overflow-hidden sm:min-h-[520px] lg:min-h-[620px]"
      style={{ background: "var(--primary)" }}
      aria-label={settings.brandName}
    >
      <h1 className="sr-only">{settings.brandName}</h1>
      {desktop || mobile ? (
        <picture>
          {settings.heroImageMobile && desktop && (
            <source media="(min-width: 768px)" srcSet={desktop} />
          )}
          <img
            src={mobile}
            alt=""
            className="absolute inset-0 h-full w-full object-cover object-center"
            width={settings.heroImageMobile ? 1080 : 1920}
            height={settings.heroImageMobile ? 1188 : 800}
            fetchPriority="high"
          />
        </picture>
      ) : (
        <div className="absolute inset-0 bg-[#3a2418]" />
      )}
      {whatsapp && (
        <a
          href={whatsapp}
          target="_blank"
          rel="noreferrer"
          aria-label="Escribir por WhatsApp"
          className="absolute bottom-5 right-5 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--secondary)] text-[var(--primary)] shadow-lg transition hover:scale-105 sm:bottom-6 sm:right-6 sm:h-14 sm:w-14"
        >
          <IconWhatsapp className="h-6 w-6 sm:h-7 sm:w-7" />
        </a>
      )}
    </section>
  );
}
