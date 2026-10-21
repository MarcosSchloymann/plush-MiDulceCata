import { Platform } from "./constants";

const HOSTS: Record<Platform, string[]> = {
  whatsapp: ["wa.me", "api.whatsapp.com", "web.whatsapp.com"],
  facebook: ["facebook.com", "www.facebook.com", "m.facebook.com", "web.facebook.com", "fb.com", "www.fb.com"],
  instagram: ["instagram.com", "www.instagram.com"],
};

export function normalizeSocialUrl(platform: Platform, value: string): string {
  const raw = value.trim();
  if (!raw) return "";

  if (platform === "whatsapp" && /^\+?[0-9][0-9\s()-]{7,20}$/.test(raw)) {
    const digits = raw.replace(/\D/g, "");
    return `https://wa.me/${digits}`;
  }

  let candidate = raw;
  if (!/^https?:\/\//i.test(candidate)) candidate = `https://${candidate}`;

  let url: URL;
  try {
    url = new URL(candidate);
  } catch {
    throw Object.assign(new Error("La URL no es válida"), { status: 400 });
  }

  if (url.protocol !== "https:") {
    throw Object.assign(new Error("La URL debe comenzar con https://"), { status: 400 });
  }
  if (url.username || url.password) {
    throw Object.assign(new Error("La URL no es válida"), { status: 400 });
  }

  const host = url.hostname.toLowerCase();
  const allowed = HOSTS[platform].some((item) => host === item || host.endsWith(`.${item}`));
  if (!allowed) {
    const label = platform === "whatsapp" ? "WhatsApp" : platform === "facebook" ? "Facebook" : "Instagram";
    throw Object.assign(new Error(`El enlace de ${label} no pertenece a un dominio permitido`), {
      status: 400,
    });
  }

  url.hash = "";
  return url.toString();
}
