import { FormEvent, useEffect, useState } from "react";
import { api, ApiError } from "@/lib/api";
import { notifySiteChanged } from "@/lib/theme";
import type { Socials } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/admin/AdminLayout";

const hints = {
  whatsapp: "https://wa.me/5491112345678",
  facebook: "https://www.facebook.com/tu-pagina",
  instagram: "https://www.instagram.com/tu-usuario",
};

export function SocialPage() {
  const [form, setForm] = useState<Socials>({ whatsapp: "", facebook: "", instagram: "" });
  const [error, setError] = useState("");
  const toast = useToast();

  useEffect(() => {
    api<Socials>("/api/admin/socials").then(setForm).catch(() => undefined);
  }, []);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");
    try {
      const saved = await api<Socials>("/api/admin/socials", {
        method: "PUT",
        body: JSON.stringify(form),
      });
      setForm(saved);
      notifySiteChanged();
      toast("Redes actualizadas");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudieron guardar los enlaces");
    }
  }

  return (
    <form onSubmit={onSubmit} className="max-w-xl space-y-5">
      <div>
        <h1 className="font-display text-4xl">Redes sociales</h1>
        <p className="mt-2 text-sm text-black/60">Estos enlaces aparecen en el encabezado, el footer y el detalle de cada producto.</p>
      </div>
      {(["whatsapp", "facebook", "instagram"] as const).map((platform) => (
        <div key={platform} className="space-y-2">
          <Label htmlFor={platform}>{platform[0].toUpperCase() + platform.slice(1)}</Label>
          <Input
            id={platform}
            value={form[platform]}
            placeholder={hints[platform]}
            onChange={(event) => setForm((current) => ({ ...current, [platform]: event.target.value }))}
          />
        </div>
      ))}
      {error && <p className="text-sm text-[#7a2e2e]">{error}</p>}
      <Button type="submit">Guardar</Button>
    </form>
  );
}
