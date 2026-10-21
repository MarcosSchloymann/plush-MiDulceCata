import { FormEvent, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api, ApiError, uploadImage } from "@/lib/api";
import { notifySiteChanged } from "@/lib/theme";
import { configureMedia, media } from "@/lib/utils";
import { CATEGORIES } from "@/lib/constants";
import type { Product } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/admin/AdminLayout";

type DraftImage = { filename: string };

const empty = {
  title: "",
  subtitle: "",
  shortDesc: "",
  fullDesc: "",
  category: "chocolates",
  published: true,
};

export function ProductEditorPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [form, setForm] = useState(empty);
  const [images, setImages] = useState<DraftImage[]>([]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(Boolean(id));

  useEffect(() => {
    if (!id) return;
    api<Product>(`/api/admin/products/${id}`)
      .then((product) => {
        setForm({
          title: product.title,
          subtitle: product.subtitle,
          shortDesc: product.shortDesc,
          fullDesc: product.fullDesc,
          category: product.category,
          published: product.published,
        });
        setImages(product.images.map((image) => ({ filename: image.filename })));
      })
      .catch(() => setError("No se encontró el producto"))
      .finally(() => setLoading(false));
  }, [id]);

  function update<K extends keyof typeof empty>(key: K, value: (typeof empty)[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function addFiles(list: FileList | null) {
    if (!list) return;
    setError("");
    for (const file of Array.from(list)) {
      if (images.length >= 8) {
        setError("Podés cargar hasta 8 imágenes");
        return;
      }
      if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
        setError("Usá JPG, PNG o WEBP");
        continue;
      }
      if (file.size > 5 * 1024 * 1024) {
        setError("Cada imagen debe pesar menos de 5 MB");
        continue;
      }
      setBusy(true);
      try {
        const uploaded = await uploadImage(file, "product");
        configureMedia(uploaded.mediaBase);
        setImages((current) => [...current, { filename: uploaded.filename }].slice(0, 8));
      } catch (err) {
        setError(err instanceof ApiError ? err.message : "No se pudo subir la imagen");
      } finally {
        setBusy(false);
      }
    }
  }

  async function removeImage(index: number) {
    const image = images[index];
    setImages((current) => current.filter((_, itemIndex) => itemIndex !== index));
    await api(`/api/admin/uploads/${image.filename}`, { method: "DELETE" }).catch(() => undefined);
  }

  function moveImage(index: number, direction: number) {
    const next = index + direction;
    if (next < 0 || next >= images.length) return;
    const copy = [...images];
    const [item] = copy.splice(index, 1);
    copy.splice(next, 0, item);
    setImages(copy);
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const payload = { ...form, images };
      if (id) {
        await api(`/api/admin/products/${id}`, { method: "PUT", body: JSON.stringify(payload) });
      } else {
        await api("/api/admin/products", { method: "POST", body: JSON.stringify(payload) });
      }
      notifySiteChanged();
      toast("Producto guardado");
      navigate("/admin/productos");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudo guardar");
    } finally {
      setBusy(false);
    }
  }

  if (loading) return <p>Cargando producto...</p>;

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <h1 className="font-display text-4xl">{id ? "Editar producto" : "Nuevo producto"}</h1>
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Título" value={form.title} onChange={(value) => update("title", value)} required />
        <Field label="Subtítulo" value={form.subtitle} onChange={(value) => update("subtitle", value)} />
        <Field label="Descripción corta" value={form.shortDesc} onChange={(value) => update("shortDesc", value)} />
        <div className="space-y-2">
          <Label htmlFor="categoria">Categoría</Label>
          <select
            id="categoria"
            value={form.category}
            onChange={(event) => update("category", event.target.value)}
            className="flex h-10 w-full rounded-md border border-black/10 bg-white px-3 text-sm"
          >
            {CATEGORIES.map((item) => (
              <option key={item.slug} value={item.slug}>
                {item.label}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="completa">Descripción completa</Label>
        <Textarea id="completa" value={form.fullDesc} onChange={(event) => update("fullDesc", event.target.value)} />
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={form.published} onChange={(event) => update("published", event.target.checked)} />
        Visible en el catálogo
      </label>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Imágenes</p>
            <p className="text-xs text-black/50">La primera es la principal. Recomendado 1200 x 900 px, JPG o WEBP, menos de 300 KB.</p>
          </div>
          <label className="inline-flex h-10 cursor-pointer items-center rounded-md border border-black/10 bg-white px-4 text-sm">
            {busy ? "Optimizando..." : "Agregar imágenes"}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              className="sr-only"
              onChange={(event) => {
                addFiles(event.target.files);
                event.target.value = "";
              }}
            />
          </label>
        </div>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {images.map((image, index) => (
            <div key={`${image.filename}-${index}`} className="bg-white p-2 shadow-sm">
              <img src={media(image.filename)} alt="" className="aspect-[4/3] w-full object-cover" />
              <p className="mt-2 text-xs">{index === 0 ? "Principal" : `Galería ${index}`}</p>
              <div className="mt-2 flex flex-wrap gap-1">
                <Button type="button" size="sm" variant="outline" onClick={() => moveImage(index, -1)}>
                  Antes
                </Button>
                <Button type="button" size="sm" variant="outline" onClick={() => moveImage(index, 1)}>
                  Después
                </Button>
                <Button type="button" size="sm" variant="destructive" onClick={() => removeImage(index)}>
                  Quitar
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
      {error && <p className="text-sm text-[#7a2e2e]">{error}</p>}
      <div className="flex gap-2">
        <Button type="submit" disabled={busy}>
          Guardar
        </Button>
        <Button type="button" variant="outline" onClick={() => navigate("/admin/productos")}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}

function Field({
  label,
  value,
  onChange,
  required,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
}) {
  const id = label.toLowerCase().replace(/\s+/g, "-");
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} value={value} required={required} onChange={(event) => onChange(event.target.value)} />
    </div>
  );
}
