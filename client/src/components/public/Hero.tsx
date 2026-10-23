import { useEffect, useMemo, useState } from "react";
import type { Settings, Socials } from "@/lib/types";
import { media, whatsappHref } from "@/lib/utils";
import { IconWhatsapp } from "./Icons";

type Slide = { desktop: string; mobile: string };

function buildSlides(settings: Settings): Slide[] {
  const slides: Slide[] = [];
  if (settings.heroImage) {
    slides.push({
      desktop: settings.heroImage,
      mobile: settings.heroImageMobile || settings.heroImage,
    });
  }
  if (settings.heroImage2) {
    slides.push({
      desktop: settings.heroImage2,
      mobile: settings.heroImageMobile2 || settings.heroImage2,
    });
  }
  return slides;
}

export function Hero({ settings, socials }: { settings: Settings; socials: Socials }) {
  const slides = useMemo(() => buildSlides(settings), [settings]);
  const [index, setIndex] = useState(0);
  const whatsapp = whatsappHref(socials.whatsapp, "Hola! Quiero hacer una consulta en Mi Dulce Cata.");
  const intervalSeconds = Math.min(120, Math.max(3, settings.heroIntervalSeconds || 10));

  useEffect(() => {
    setIndex(0);
  }, [slides.length, settings.heroImage, settings.heroImage2]);

  useEffect(() => {
    if (slides.length < 2) return;
    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % slides.length);
    }, intervalSeconds * 1000);
    return () => window.clearInterval(timer);
  }, [slides.length, intervalSeconds]);

  return (
    <section
      id="inicio"
      className="relative min-h-[420px] overflow-hidden sm:min-h-[520px] lg:min-h-[620px]"
      style={{ background: "var(--primary)" }}
      aria-label={settings.brandName}
      aria-roledescription={slides.length > 1 ? "carrusel" : undefined}
    >
      <h1 className="sr-only">{settings.brandName}</h1>
      {slides.length === 0 ? (
        <div className="absolute inset-0 bg-[#3a2418]" />
      ) : (
        slides.map((slide, slideIndex) => {
          const desktop = media(slide.desktop);
          const mobile = media(slide.mobile);
          const active = slideIndex === index;
          return (
            <picture
              key={`${slide.desktop}-${slide.mobile}-${slideIndex}`}
              className={`absolute inset-0 block transition-opacity duration-700 ease-in-out ${
                active ? "opacity-100" : "opacity-0"
              }`}
              aria-hidden={!active}
            >
              {slide.mobile !== slide.desktop && (
                <source media="(min-width: 768px)" srcSet={desktop} />
              )}
              <img
                src={mobile}
                alt=""
                className="absolute inset-0 h-full w-full object-cover object-center"
                width={slide.mobile !== slide.desktop ? 1080 : 1920}
                height={slide.mobile !== slide.desktop ? 1188 : 800}
                fetchPriority={slideIndex === 0 ? "high" : "low"}
                loading={slideIndex === 0 ? "eager" : "lazy"}
              />
            </picture>
          );
        })
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
