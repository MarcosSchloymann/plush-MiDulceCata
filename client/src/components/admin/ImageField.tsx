import { useState } from "react";
import { api, ApiError, uploadImage } from "@/lib/api";
import { media } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const ACCEPT = "image/jpeg,image/png,image/webp";

export function ImageField({
  label,
  filename,
  kind,
  onChange,
  hint,
}: {
  label: string;
  filename: string;
  kind: "product" | "hero" | "banner" | "background" | "logo" | "icon";
  onChange: (filename: string) => void;
  hint?: string;
}) {
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const isLogo = kind === "logo" || kind === "icon";

  async function onFile(file: File | undefined) {
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setError("Usá JPG, PNG o WEBP");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("La imagen supera los 5 MB");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const previous = filename;
      const uploaded = await uploadImage(file, kind);
      onChange(uploaded.filename);
      if (previous) {
        await api(`/api/admin/uploads/${previous}`, { method: "DELETE" }).catch(() => undefined);
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudo subir la imagen");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium">{label}</p>
      {filename && (
        <img
          src={media(filename)}
          alt=""
          className={
            isLogo
              ? "h-16 w-auto max-w-xs object-contain bg-black/5 p-2"
              : "aspect-[4/3] w-full max-w-xs object-cover"
          }
        />
      )}
      <div className="flex flex-wrap gap-2">
        <label className="inline-flex h-10 cursor-pointer items-center rounded-md border border-black/10 bg-white px-4 text-sm">
          {busy ? "Optimizando..." : filename ? "Cambiar imagen" : "Subir imagen"}
          <input
            type="file"
            accept={ACCEPT}
            className="sr-only"
            onChange={(event) => {
              onFile(event.target.files?.[0]);
              event.target.value = "";
            }}
          />
        </label>
        {filename && (
          <Button type="button" variant="outline" onClick={() => onChange("")}>
            Quitar
          </Button>
        )}
      </div>
      {hint && <p className="text-xs text-black/50">{hint}</p>}
      {error && <p className="text-sm text-[#7a2e2e]">{error}</p>}
    </div>
  );
}
