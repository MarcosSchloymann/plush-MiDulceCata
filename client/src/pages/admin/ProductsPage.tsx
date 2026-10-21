import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowDown, ArrowUp, Pencil, Trash2 } from "lucide-react";
import { api, ApiError } from "@/lib/api";
import { notifySiteChanged } from "@/lib/theme";
import { media } from "@/lib/utils";
import { categoryLabel } from "@/lib/constants";
import type { Product } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { useToast } from "@/components/admin/AdminLayout";

export function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [target, setTarget] = useState<Product | null>(null);
  const [busy, setBusy] = useState(false);
  const toast = useToast();

  async function load() {
    setProducts(await api<Product[]>("/api/admin/products"));
  }

  useEffect(() => {
    load().catch(() => undefined);
  }, []);

  async function remove() {
    if (!target) return;
    setBusy(true);
    try {
      await api(`/api/admin/products/${target.id}`, { method: "DELETE" });
      setTarget(null);
      toast("Producto eliminado");
      notifySiteChanged();
      await load();
    } catch (err) {
      toast(err instanceof ApiError ? err.message : "No se pudo eliminar");
    } finally {
      setBusy(false);
    }
  }

  async function move(index: number, direction: number) {
    const next = index + direction;
    if (next < 0 || next >= products.length) return;
    const ids = products.map((product) => product.id);
    const [item] = ids.splice(index, 1);
    ids.splice(next, 0, item);
    await api("/api/admin/products/reorder", { method: "PUT", body: JSON.stringify({ ids }) });
    notifySiteChanged();
    await load();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="font-display text-4xl">Productos</h1>
        <Button asChild>
          <Link to="/admin/productos/nuevo">Nuevo producto</Link>
        </Button>
      </div>
      <div className="overflow-x-auto bg-white shadow-sm">
        <table className="w-full min-w-[680px] text-left text-sm">
          <thead className="border-b border-black/10 text-xs uppercase tracking-[0.14em] text-black/50">
            <tr>
              <th className="px-4 py-3 font-medium">Producto</th>
              <th className="px-4 py-3 font-medium">Categoría</th>
              <th className="px-4 py-3 font-medium">Estado</th>
              <th className="px-4 py-3 font-medium">Orden</th>
              <th className="px-4 py-3 font-medium">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product, index) => (
              <tr key={product.id} className="border-b border-black/5">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <span className="block h-12 w-16 overflow-hidden bg-[#efe6dc]">
                      {product.images[0] && (
                        <img src={media(product.images[0].filename)} alt="" className="h-full w-full object-cover" />
                      )}
                    </span>
                    <span>
                      <span className="block font-medium">{product.title}</span>
                      <span className="block text-xs text-black/50">{product.shortDesc}</span>
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3">{categoryLabel(product.category)}</td>
                <td className="px-4 py-3">{product.published ? "Visible" : "Oculto"}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-1">
                    <button type="button" aria-label="Subir" onClick={() => move(index, -1)} className="rounded p-1 hover:bg-black/5">
                      <ArrowUp className="h-4 w-4" />
                    </button>
                    <button type="button" aria-label="Bajar" onClick={() => move(index, 1)} className="rounded p-1 hover:bg-black/5">
                      <ArrowDown className="h-4 w-4" />
                    </button>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <Button asChild size="sm" variant="outline">
                      <Link to={`/admin/productos/${product.id}`}>
                        <Pencil className="h-3.5 w-3.5" />
                        Editar
                      </Link>
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => setTarget(product)}>
                      <Trash2 className="h-3.5 w-3.5" />
                      Eliminar
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <ConfirmDialog
        open={Boolean(target)}
        title="Eliminar producto"
        description={`¿Eliminar “${target?.title ?? ""}”? Esta acción no se puede deshacer.`}
        busy={busy}
        onConfirm={remove}
        onOpenChange={(open) => !open && setTarget(null)}
      />
    </div>
  );
}
