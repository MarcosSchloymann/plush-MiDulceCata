import type { Settings, Socials } from "@/lib/types";
import { Logo } from "./Logo";
import { IconFacebook, IconInstagram, IconWhatsapp } from "./Icons";

export function Footer({ settings, socials }: { settings: Settings; socials: Socials }) {
  const links = [
    { href: socials.whatsapp, label: "WhatsApp", icon: <IconWhatsapp className="h-6 w-6" /> },
    { href: socials.facebook, label: "Facebook", icon: <IconFacebook className="h-6 w-6" /> },
    { href: socials.instagram, label: "Instagram", icon: <IconInstagram className="h-6 w-6" /> },
  ].filter((item) => item.href);

  return (
    <footer
      id="contacto"
      style={{
        backgroundColor: "#251911",
        backgroundImage: "linear-gradient(90deg, rgba(37, 25, 17, 1) 10%, rgba(0, 0, 0, 1) 100%)",
      }}
    >
      <div className="mx-auto grid max-w-[1200px] gap-10 px-6 py-14 md:grid-cols-2 lg:grid-cols-[1.3fr_repeat(4,1fr)]">
        <div>
          <Logo
            variant="light"
            name={settings.brandName}
            script={settings.brandScript}
            image={settings.logoFooter}
          />
          <p className="mt-6 whitespace-pre-line text-sm leading-7 text-[var(--secondary)]">{settings.footerIntro}</p>
          {links.length > 0 && (
            <div className="mt-6 flex gap-4 text-[var(--secondary)]">
              {links.map((link) => (
                <a key={link.label} href={link.href} target="_blank" rel="noreferrer" aria-label={link.label} className="transition hover:opacity-70">
                  {link.icon}
                </a>
              ))}
            </div>
          )}
        </div>
        {settings.footerColumns.map((column) => (
          <div key={column.title}>
            <h2 className="text-[11px] font-semibold tracking-[0.18em] text-[var(--secondary)]">{column.title}</h2>
            <ul className="mt-4 space-y-2 text-sm leading-6 text-[#f3e6d4]/80">
              {column.lines.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </footer>
  );
}
