import { FormEvent, useEffect, useState } from "react";
import { api, ApiError } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import type { Summary } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/admin/AdminLayout";

export function DashboardPage() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState("");
  const toast = useToast();

  useEffect(() => {
    api<Summary>("/api/admin/summary").then(setSummary).catch(() => undefined);
  }, []);

  async function changePassword(event: FormEvent) {
    event.preventDefault();
    setError("");
    try {
      await api("/api/auth/password", {
        method: "POST",
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      setCurrentPassword("");
      setNewPassword("");
      toast("Contraseña actualizada");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudo cambiar la contraseña");
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-4xl">Resumen</h1>
        <p className="mt-2 text-sm text-black/60">Estado actual del catálogo.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <article className="bg-white p-5 shadow-sm">
          <p className="text-xs uppercase tracking-[0.16em] text-black/50">Productos</p>
          <p className="mt-3 font-display text-4xl">{summary?.productCount ?? "—"}</p>
        </article>
        <article className="bg-white p-5 shadow-sm">
          <p className="text-xs uppercase tracking-[0.16em] text-black/50">Redes sociales</p>
          <p className="mt-3 font-display text-4xl">
            {summary ? `${summary.socialConfigured}/${summary.socialTotal}` : "—"}
          </p>
        </article>
        <article className="bg-white p-5 shadow-sm">
          <p className="text-xs uppercase tracking-[0.16em] text-black/50">Última modificación</p>
          <p className="mt-3 font-display text-2xl leading-tight">{formatDate(summary?.lastModified)}</p>
        </article>
      </div>
      <form onSubmit={changePassword} className="max-w-md space-y-4 bg-white p-5 shadow-sm">
        <h2 className="font-display text-2xl">Cambiar contraseña</h2>
        <div className="space-y-2">
          <Label htmlFor="actual">Contraseña actual</Label>
          <Input id="actual" type="password" value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="nueva">Nueva contraseña</Label>
          <Input id="nueva" type="password" minLength={8} value={newPassword} onChange={(event) => setNewPassword(event.target.value)} required />
        </div>
        {error && <p className="text-sm text-[#7a2e2e]">{error}</p>}
        <Button type="submit">Guardar contraseña</Button>
      </form>
    </div>
  );
}
