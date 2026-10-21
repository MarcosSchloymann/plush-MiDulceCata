import { createContext, useContext, useEffect, useState } from "react";
import { NavLink, Navigate, Outlet, useNavigate } from "react-router-dom";
import { ExternalLink, LayoutDashboard, LogOut, Menu, Palette, Share2, ShoppingBag } from "lucide-react";
import { api, clearCsrf } from "@/lib/api";
import { applyTheme } from "@/lib/theme";
import type { Settings } from "@/lib/types";
import { Logo } from "@/components/public/Logo";

type ToastContextValue = (message: string) => void;
const ToastContext = createContext<ToastContextValue>(() => undefined);
export function useToast() {
  return useContext(ToastContext);
}

const links = [
  { to: "/admin", label: "Resumen", icon: LayoutDashboard, end: true },
  { to: "/admin/productos", label: "Productos", icon: ShoppingBag, end: false },
  { to: "/admin/redes", label: "Redes sociales", icon: Share2, end: false },
  { to: "/admin/apariencia", label: "Apariencia", icon: Palette, end: false },
];

export function AdminLayout() {
  const [ready, setReady] = useState(false);
  const [authed, setAuthed] = useState(false);
  const [open, setOpen] = useState(false);
  const [toast, setToast] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    api<{ user: { username: string } | null }>("/api/auth/me")
      .then((data) => setAuthed(Boolean(data.user)))
      .finally(() => setReady(true));
    api<Settings>("/api/admin/settings")
      .then((settings) => applyTheme(settings))
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(""), 2600);
    return () => window.clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    document.title = "Administración | Mi Dulce Cata";
    let robots = document.head.querySelector('meta[name="robots"]');
    if (!robots) {
      robots = document.createElement("meta");
      robots.setAttribute("name", "robots");
      document.head.appendChild(robots);
    }
    robots.setAttribute("content", "noindex, nofollow");
  }, []);

  async function logout() {
    await api("/api/auth/logout", { method: "POST" });
    clearCsrf();
    navigate("/admin/login");
  }

  if (!ready) return <div className="min-h-screen" style={{ background: "var(--bg)" }} />;
  if (!authed) return <Navigate to="/admin/login" replace />;

  return (
    <ToastContext.Provider value={setToast}>
      <div className="min-h-screen md:grid md:grid-cols-[250px_1fr]" style={{ background: "var(--bg)", color: "var(--text)" }}>
        <aside className={`${open ? "block" : "hidden"} md:block`} style={{ background: "var(--primary)", color: "#f6f0e8" }}>
          <div className="flex min-h-screen flex-col px-5 py-6">
            <Logo variant="light" compact />
            <nav className="mt-10 flex flex-1 flex-col gap-1">
              {links.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.end}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-md px-3 py-2 text-sm ${isActive ? "bg-white/10" : "hover:bg-white/5"}`
                  }
                >
                  <link.icon className="h-4 w-4" />
                  {link.label}
                </NavLink>
              ))}
            </nav>
            <a href="/" target="_blank" rel="noreferrer" className="mb-2 flex items-center gap-3 px-3 py-2 text-sm hover:bg-white/5">
              <ExternalLink className="h-4 w-4" />
              Ver sitio
            </a>
            <button type="button" onClick={logout} className="flex items-center gap-3 px-3 py-2 text-left text-sm hover:bg-white/5">
              <LogOut className="h-4 w-4" />
              Cerrar sesión
            </button>
          </div>
        </aside>
        <div>
          <div className="flex items-center justify-between border-b border-black/10 px-4 py-3 md:hidden">
            <button type="button" aria-label="Abrir menú" onClick={() => setOpen((value) => !value)}>
              <Menu />
            </button>
            <span className="font-display">Administración</span>
          </div>
          <div className="mx-auto max-w-5xl p-4 md:p-8">
            <Outlet />
          </div>
        </div>
        {toast && (
          <div className="fixed bottom-5 right-5 z-50 bg-[var(--primary)] px-4 py-3 text-sm text-[#f6f0e8] shadow-lg">{toast}</div>
        )}
      </div>
    </ToastContext.Provider>
  );
}
