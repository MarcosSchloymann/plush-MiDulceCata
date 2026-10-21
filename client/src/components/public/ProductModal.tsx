import { useEffect, useState, type ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import type { Product, Socials } from "@/lib/types";
import { media, whatsappHref } from "@/lib/utils";
import { IconFacebook, IconInstagram, IconWhatsapp } from "./Icons";

export function ProductModal({
  product,
  socials,
  onClose,
}: {
  product: Product | null;
  socials: Socials;
  onClose: () => void;
}) {
  const [index, setIndex] = useState(0);
  const images = product?.images ?? [];
  const current = images[index];

  useEffect(() => {
    setIndex(0);
  }, [product?.id]);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (!product || images.length < 2) return;
      if (event.key === "ArrowRight") setIndex((value) => (value + 1) % images.length);
      if (event.key === "ArrowLeft") setIndex((value) => (value - 1 + images.length) % images.length);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [product, images.length]);

  const links: { href: string; label: string; icon: ReactNode }[] = [];
  if (product && socials.whatsapp) {
    links.push({
      href: whatsappHref(socials.whatsapp, `Hola! Quiero consultar por ${product.title}.`),
      label: "WhatsApp",
      icon: <IconWhatsapp className="h-4 w-4" />,
    });
  }
  if (socials.facebook) {
    links.push({ href: socials.facebook, label: "Facebook", icon: <IconFacebook className="h-4 w-4" /> });
  }
  if (socials.instagram) {
    links.push({ href: socials.instagram, label: "Instagram", icon: <IconInstagram className="h-4 w-4" /> });
  }

  return (
    <Dialog open={Boolean(product)} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="flex max-w-none flex-col overflow-hidden p-0" style={{ width: "80vw", height: "80vh" }}>
        {product && (
          <div className="grid h-full min-h-0 grid-rows-[minmax(180px,46%)_minmax(0,1fr)] md:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] md:grid-rows-1">
            <div className="flex min-h-0 flex-col bg-[#efe8df]">
              <div className="relative min-h-0 flex-1">
                {current && (
                  <img
                    src={media(current.filename)}
                    alt={current.alt || product.title}
                    className="h-full w-full object-cover"
                  />
                )}
                {images.length > 1 && (
                  <>
                    <button
                      type="button"
                      aria-label="Imagen anterior"
                      className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90"
                      onClick={() => setIndex((value) => (value - 1 + images.length) % images.length)}
                    >
                      <ChevronLeft />
                    </button>
                    <button
                      type="button"
                      aria-label="Imagen siguiente"
                      className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90"
                      onClick={() => setIndex((value) => (value + 1) % images.length)}
                    >
                      <ChevronRight />
                    </button>
                    <p className="absolute bottom-3 left-3 rounded-full bg-black/55 px-3 py-1 text-xs text-white">
                      {index + 1} / {images.length}
                    </p>
                  </>
                )}
              </div>
              {images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto p-3">
                  {images.map((image, imageIndex) => (
                    <button
                      key={image.id || image.filename}
                      type="button"
                      aria-label={`Ver imagen ${imageIndex + 1}`}
                      onClick={() => setIndex(imageIndex)}
                      className={`h-16 w-20 shrink-0 overflow-hidden border-2 ${
                        imageIndex === index ? "border-[var(--secondary)]" : "border-transparent"
                      }`}
                    >
                      <img src={media(image.filename)} alt="" className="h-full w-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="min-h-0 overflow-y-auto px-6 py-8 sm:px-10">
              <DialogTitle className="pr-8 text-4xl leading-tight">{product.title}</DialogTitle>
              {product.subtitle && <p className="mt-3 text-sm tracking-wide text-[var(--secondary)]">{product.subtitle}</p>}
              <DialogDescription className="sr-only">Detalle del producto {product.title}</DialogDescription>
              <p className="mt-6 whitespace-pre-line text-sm leading-7 text-[var(--text)]/90">{product.fullDesc}</p>
              {links.length > 0 && (
                <div className="mt-8 flex flex-wrap gap-3">
                  {links.map((link) => (
                    <a
                      key={link.label}
                      href={link.href}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 border border-[var(--primary)]/15 px-4 py-2 text-xs font-medium uppercase tracking-[0.14em] transition hover:bg-[var(--primary)] hover:text-[#f6f0e8]"
                    >
                      {link.icon}
                      {link.label}
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
