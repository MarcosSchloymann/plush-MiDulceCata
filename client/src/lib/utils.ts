import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function media(filename?: string | null) {
  if (!filename) return "";
  return `/uploads/${filename}`;
}

export function whatsappHref(url: string, message?: string) {
  if (!url) return "";
  try {
    const parsed = new URL(url);
    if (message && (parsed.hostname === "wa.me" || parsed.hostname.endsWith("whatsapp.com"))) {
      parsed.searchParams.set("text", message);
    }
    return parsed.toString();
  } catch {
    return url;
  }
}

export function formatDate(iso?: string | null) {
  if (!iso) return "Sin cambios todavía";
  return new Intl.DateTimeFormat("es-AR", {
    dateStyle: "long",
    timeStyle: "short",
  }).format(new Date(iso));
}
