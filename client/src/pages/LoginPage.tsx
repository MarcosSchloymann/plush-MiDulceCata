import { FormEvent, useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { api, ApiError } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/public/Logo";

export function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [ready, setReady] = useState(false);
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    api<{ user: { username: string } | null }>("/api/auth/me")
      .then((data) => setAuthed(Boolean(data.user)))
      .finally(() => setReady(true));
  }, []);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      await api("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ username, password }),
      });
      setAuthed(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudo ingresar");
    } finally {
      setBusy(false);
    }
  }

  if (!ready) return <div className="min-h-screen" style={{ background: "var(--bg)" }} />;
  if (authed) return <Navigate to="/admin" replace />;

  return (
    <main className="flex min-h-screen items-center justify-center px-4" style={{ background: "var(--bg)" }}>
      <form onSubmit={onSubmit} className="w-full max-w-md bg-white p-8 shadow-sm">
        <div className="mb-8 flex justify-center">
          <Logo />
        </div>
        <h1 className="mb-6 text-center font-display text-3xl">Administración</h1>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="usuario">Usuario</Label>
            <Input id="usuario" autoComplete="username" value={username} onChange={(event) => setUsername(event.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Contraseña</Label>
            <Input id="password" type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} required />
          </div>
          {error && <p className="text-sm text-[#7a2e2e]">{error}</p>}
          <Button className="w-full" type="submit" disabled={busy}>
            {busy ? "Ingresando..." : "Ingresar"}
          </Button>
        </div>
        <p className="mt-6 text-center text-sm">
          <a href="/" className="underline underline-offset-4">
            Volver al sitio
          </a>
        </p>
      </form>
    </main>
  );
}
