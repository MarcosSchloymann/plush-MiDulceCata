import { useEffect, useMemo, useState } from "react";
import type { Settings, Socials } from "@/lib/types";
import { media, whatsappHref } from "@/lib/utils";
import { IconWhatsapp } from "./Icons";

type Slide = { desktop: string; mobile: string };

const SLIDE_MS = 700;

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
  const [outgoing, setOutgoing] = useState<number | null>(null);
  const [entered, setEntered] = useState(true);
  const whatsapp = whatsappHref(socials.whatsapp, "Hola! Quiero hacer una consulta en Mi Dulce Cata.");
  const intervalSeconds = Math.min(120, Math.max(3, settings.heroIntervalSeconds || 10));

  useEffect(() => {
    setIndex(0);
    setOutgoing(null);
    setEntered(true);
  }, [slides.length, settings.heroImage, settings.heroImage2]);

  useEffect(() => {
    if (slides.length < 2) return;
    const timer = window.setInterval(() => {
      setIndex((current) => {
        setOutgoing(current);
        setEntered(false);
        return (current + 1) % slides.length;
      });
    }, intervalSeconds * 1000);
    return () => window.clearInterval(timer);
  }, [slides.length, intervalSeconds]);

  useEffect(() => {
    if (outgoing === null) return;
    const enterFrame = window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => setEntered(true));
    });
    const clearOutgoing = window.setTimeout(() => setOutgoing(null), SLIDE_MS);
    return () => {
      window.cancelAnimationFrame(enterFrame);
      window.clearTimeout(clearOutgoing);
    };
  }, [index, outgoing]);

  function slideTransform(slideIndex: number): string {
    if (slideIndex === index) {
      if (outgoing !== null && !entered) return "translate3d(100%, 0, 0)";
      return "translate3d(0, 0, 0)";
    }
    if (slideIndex === outgoing) return "translate3d(-100%, 0, 0)";
    return "translate3d(100%, 0, 0)";
  }

  function slideZ(slideIndex: number): number {
    if (slideIndex === index) return 2;
    if (slideIndex === outgoing) return 1;
    return 0;
  }

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
          const leaving = slideIndex === outgoing;
          return (
            <picture
              key={`${slide.desktop}-${slide.mobile}-${slideIndex}`}
              className="absolute inset-0 block will-change-transform"
              style={{
                transform: slideTransform(slideIndex),
                transition:
                  active || leaving ? `transform ${SLIDE_MS}ms cubic-bezier(0.4, 0, 0.2, 1)` : "none",
                zIndex: slideZ(slideIndex),
              }}
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
                draggable={false}
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
