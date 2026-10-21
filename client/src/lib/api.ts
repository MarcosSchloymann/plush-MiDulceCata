export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

let csrfToken: string | null = null;

async function ensureCsrf() {
  if (csrfToken) return csrfToken;
  const response = await fetch("/api/auth/csrf", { credentials: "include" });
  const data = (await response.json()) as { csrfToken?: string };
  if (!response.ok || !data.csrfToken) {
    throw new ApiError("No se pudo iniciar la sesión segura", response.status);
  }
  csrfToken = data.csrfToken;
  return csrfToken;
}

export function clearCsrf() {
  csrfToken = null;
}

export async function api<T>(path: string, options: RequestInit = {}, retry = true): Promise<T> {
  const method = (options.method || "GET").toUpperCase();
  const headers = new Headers(options.headers);
  if (options.body && !(options.body instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  if (!["GET", "HEAD"].includes(method)) {
    headers.set("x-csrf-token", await ensureCsrf());
  }

  const response = await fetch(path, { ...options, headers, credentials: "include" });
  const text = await response.text();
  const data = text ? (JSON.parse(text) as Record<string, unknown>) : {};

  if (response.status === 403 && retry && String(data.error || "").toLowerCase().includes("csrf")) {
    csrfToken = null;
    return api<T>(path, options, false);
  }

  if (!response.ok) {
    throw new ApiError(String(data.error || "Error inesperado"), response.status);
  }

  if (typeof data.csrfToken === "string") csrfToken = data.csrfToken;
  return data as T;
}

export async function uploadImage(
  file: File,
  kind: "product" | "hero" | "banner" | "background" | "logo" | "icon"
) {
  const form = new FormData();
  form.append("file", file);
  form.append("kind", kind);
  return api<{ filename: string; url: string }>("/api/admin/uploads", { method: "POST", body: form });
}
