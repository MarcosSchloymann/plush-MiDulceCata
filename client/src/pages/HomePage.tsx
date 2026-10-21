import { useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api";
import { applyTheme } from "@/lib/theme";
import type { Product, SiteData } from "@/lib/types";
import { Header } from "@/components/public/Header";
import { Hero } from "@/components/public/Hero";
import { Features } from "@/components/public/Features";
import { Catalog } from "@/components/public/Catalog";
import { ProductModal } from "@/components/public/ProductModal";
import { Promos } from "@/components/public/Promos";
import { Footer } from "@/components/public/Footer";
import { Logo } from "@/components/public/Logo";
import { configureMedia, media } from "@/lib/utils";

const FAVORITES_KEY = "mdc-favorites";

function useSeo(title: string, description: string, image?: string) {
  useEffect(() => {
    document.title = title;
    setMeta("description", description);
    setMeta("og:title", title, "property");
    setMeta("og:description", description, "property");
    setMeta("og:url", window.location.href, "property");
    setMeta("og:type", "website", "property");
    if (image) setMeta("og:image", new URL(image, window.location.origin).toString(), "property");
    setMeta("twitter:card", "summary_large_image");
    setMeta("twitter:title", title);
    setMeta("twitter:description", description);
  }, [title, description, image]);
}

function setMeta(name: string, content: string, attr: "name" | "property" = "name") {
  let tag = document.head.querySelector(`meta[${attr}="${name}"]`);
  if (!tag) {
    tag = document.createElement("meta");
    tag.setAttribute(attr, name);
    document.head.appendChild(tag);
  }
  tag.setAttribute("content", content);
}

export function HomePage() {
  const [site, setSite] = useState<SiteData | null>(null);
  const [error, setError] = useState("");
  const [category, setCategory] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState<Product | null>(null);
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem(FAVORITES_KEY) || "[]") as string[];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    let cancelled = false;
    async function load(attempt = 0) {
      try {
        const data = await api<SiteData>("/api/public/site");
        if (cancelled) return;
        configureMedia(data.mediaBase);
        setSite(data);
        setError("");
        applyTheme(data.settings);
      } catch {
        if (attempt < 4) {
          window.setTimeout(() => load(attempt + 1), 700);
          return;
        }
        if (!cancelled) setError("No pudimos cargar el catálogo. Revisá que el servidor esté en marcha.");
      }
    }
    load();
    const channel = new BroadcastChannel("mdc-site");
    channel.onmessage = () => load();
    const onFocus = () => load();
    window.addEventListener("focus", onFocus);
    return () => {
      cancelled = true;
      channel.close();
      window.removeEventListener("focus", onFocus);
    };
  }, []);

  useEffect(() => {
    if (!site) return;
    const slug = new URLSearchParams(window.location.search).get("producto");
    if (!slug) return;
    const product = site.products.find((item) => item.slug === slug);
    if (product) setActive(product);
  }, [site]);

  function openProduct(product: Product) {
    setActive(product);
    const url = new URL(window.location.href);
    url.searchParams.set("producto", product.slug);
    window.history.replaceState({}, "", url);
  }

  function closeProduct() {
    setActive(null);
    const url = new URL(window.location.href);
    url.searchParams.delete("producto");
    window.history.replaceState({}, "", url);
  }

  function toggleFavorite(id: string) {
    setFavorites((current) => {
      const next = current.includes(id) ? current.filter((item) => item !== id) : [...current, id];
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(next));
      return next;
    });
  }

  const filtered = useMemo(() => {
    if (!site) return [];
    return site.products.filter((product) => {
      if (category && product.category !== category) return false;
      if (!query) return true;
      const blob = `${product.title} ${product.subtitle} ${product.shortDesc}`.toLowerCase();
      return blob.includes(query.toLowerCase());
    });
  }, [site, category, query]);

  const seoTitle = active ? `${active.title} | ${site?.settings.brandName ?? "Mi Dulce Cata"}` : site?.settings.metaTitle ?? "Mi Dulce Cata";
  const seoDescription = active
    ? active.shortDesc || active.subtitle || site?.settings.metaDescription || ""
    : site?.settings.metaDescription ?? "";
  const seoImage = active?.images[0]?.filename
    ? media(active.images[0].filename)
    : site?.settings.heroImage
      ? media(site.settings.heroImage)
      : undefined;
  useSeo(seoTitle, seoDescription, seoImage);

  if (error) {
    return <p className="px-6 py-24 text-center">{error}</p>;
  }

  if (!site) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Logo />
      </div>
    );
  }

  const bodyImage = site.settings.bodyBgImage ? media(site.settings.bodyBgImage) : "";

  return (
    <div className="min-h-screen overflow-x-hidden" style={{ background: "var(--bg)", color: "var(--text)" }}>
      <a href="#catalogo" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:bg-white focus:px-4 focus:py-2">
        Saltar al catálogo
      </a>
      <Header
        settings={site.settings}
        socials={site.socials}
        category={category}
        onCategory={setCategory}
        onSearch={setQuery}
      />
      <Hero settings={site.settings} socials={site.socials} />
      <Features settings={site.settings} />
      <main
        id="catalogo"
        className="pb-6 pt-8"
        style={
          bodyImage
            ? {
                backgroundImage: `linear-gradient(color-mix(in srgb, var(--bg) 90%, transparent), color-mix(in srgb, var(--bg) 90%, transparent)), url(${bodyImage})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }
            : undefined
        }
      >
        <Catalog products={filtered} favorites={favorites} onOpen={openProduct} onFavorite={toggleFavorite} />
        <Promos settings={site.settings} socials={site.socials} />
      </main>
      <Footer settings={site.settings} socials={site.socials} />
      <ProductModal product={active} socials={site.socials} onClose={closeProduct} />
    </div>
  );
}
