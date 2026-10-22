import { FormEvent, useState } from "react";
import { Menu, Search, X } from "lucide-react";
import { CATEGORIES } from "@/lib/constants";
import type { Settings, Socials } from "@/lib/types";
import { Logo } from "./Logo";
import { IconFacebook, IconInstagram } from "./Icons";

type HeaderProps = {
  settings: Settings;
  socials: Socials;
  category: string | null;
  onCategory: (slug: string | null) => void;
  onSearch: (value: string) => void;
};

export function Header({ settings, socials, category, onCategory, onSearch }: HeaderProps) {
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");

  function choose(slug: string | null) {
    onCategory(slug);
    setOpen(false);
    document.getElementById("catalogo")?.scrollIntoView({ behavior: "smooth" });
  }

  function submitSearch(event: FormEvent) {
    event.preventDefault();
    onSearch(query.trim());
    setSearchOpen(false);
    document.getElementById("catalogo")?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <header className="sticky top-0 z-40" style={{ background: "var(--bg)" }}>
      <div
        className="flex items-center justify-end gap-4 px-5 py-2.5 text-[var(--secondary)]"
        style={{
          backgroundColor: "#251911",
          backgroundImage: "linear-gradient(90deg, rgba(37, 25, 17, 1) 40%, rgba(0, 0, 0, 1) 100%)",
        }}
      >
        {socials.facebook && (
          <a href={socials.facebook} target="_blank" rel="noreferrer" aria-label="Facebook" className="transition hover:opacity-70">
            <IconFacebook className="h-[21px] w-[21px]" />
          </a>
        )}
        {socials.instagram && (
          <a href={socials.instagram} target="_blank" rel="noreferrer" aria-label="Instagram" className="transition hover:opacity-70">
            <IconInstagram className="h-[21px] w-[21px]" />
          </a>
        )}
      </div>
      <div className="mx-auto grid max-w-[1400px] grid-cols-[auto_1fr_auto] items-center gap-4 px-4 py-1 lg:px-8">
        <a href="#inicio" aria-label="Ir al inicio" onClick={() => onCategory(null)} className="justify-self-start leading-none">
          <Logo name={settings.brandName} script={settings.brandScript} image={settings.logoHeader} />
        </a>
        <nav className="hidden items-center justify-center gap-6 lg:flex xl:gap-8" aria-label="Categorías">
          {CATEGORIES.map((item) => (
            <button
              key={item.slug}
              type="button"
              onClick={() => choose(item.slug)}
              aria-current={category === item.slug ? "true" : undefined}
              className={`text-[11px] font-medium uppercase tracking-[0.16em] transition hover:opacity-70 ${
                category === item.slug ? "underline decoration-[var(--secondary)] underline-offset-8" : ""
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>
        <div className="flex items-center justify-end gap-2">
          <button
            type="button"
            aria-label={searchOpen ? "Cerrar búsqueda" : "Buscar"}
            aria-expanded={searchOpen}
            onClick={() => setSearchOpen((value) => !value)}
            className="rounded-full p-2 hover:bg-black/5"
          >
            {searchOpen ? <X className="h-5 w-5" /> : <Search className="h-5 w-5" />}
          </button>
          <button type="button" className="rounded-full p-2 hover:bg-black/5 lg:hidden" aria-label="Abrir menú" onClick={() => setOpen(true)}>
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </div>
      {searchOpen && (
        <form onSubmit={submitSearch} className="border-t border-black/5 px-4 py-3 lg:px-8">
          <label className="sr-only" htmlFor="buscar">
            Buscar productos
          </label>
          <input
            id="buscar"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              onSearch(event.target.value.trim());
            }}
            placeholder="Buscar por nombre o descripción"
            className="w-full bg-transparent text-sm outline-none placeholder:text-black/40"
            autoFocus
          />
        </form>
      )}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden" style={{ background: "var(--bg)" }}>
          <button type="button" className="absolute right-4 top-4 p-2" aria-label="Cerrar menú" onClick={() => setOpen(false)}>
            <X />
          </button>
          <nav className="flex h-full flex-col items-start gap-10 px-8 pt-24" aria-label="Categorías">
            <button type="button" className="font-display text-[1.78rem] leading-tight" onClick={() => choose(null)}>
              Todo el catálogo
            </button>
            {CATEGORIES.map((item) => (
              <button
                key={item.slug}
                type="button"
                className="font-display text-[1.78rem] leading-tight"
                onClick={() => choose(item.slug)}
              >
                {item.label}
              </button>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
