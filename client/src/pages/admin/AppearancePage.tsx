import { FormEvent, useEffect, useState } from "react";
import { api, ApiError } from "@/lib/api";
import { applyTheme, notifySiteChanged } from "@/lib/theme";
import type { Settings } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ImageField } from "@/components/admin/ImageField";
import { useToast } from "@/components/admin/AdminLayout";

export function AppearancePage() {
  const [form, setForm] = useState<Settings | null>(null);
  const [error, setError] = useState("");
  const [previewKey, setPreviewKey] = useState(0);
  const toast = useToast();

  useEffect(() => {
    api<Settings>("/api/admin/settings").then(setForm).catch(() => setError("No se pudo cargar la apariencia"));
  }, []);

  function patch(partial: Partial<Settings>) {
    setForm((current) => (current ? { ...current, ...partial } : current));
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (!form) return;
    setError("");
    try {
      const saved = await api<Settings>("/api/admin/settings", {
        method: "PUT",
        body: JSON.stringify(form),
      });
      setForm(saved);
      applyTheme(saved);
      notifySiteChanged();
      setPreviewKey((value) => value + 1);
      toast("Apariencia actualizada");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudo guardar");
    }
  }

  if (!form) return <p>{error || "Cargando..."}</p>;

  return (
    <form onSubmit={onSubmit} className="space-y-8">
      <div>
        <h1 className="font-display text-4xl">Apariencia</h1>
        <p className="mt-2 text-sm text-black/60">Los cambios se ven en el sitio público en cuanto los guardás.</p>
      </div>

      <section className="space-y-4 bg-white p-5 shadow-sm">
        <h2 className="font-display text-2xl">SEO</h2>
        <Field label="Meta title" value={form.metaTitle} onChange={(metaTitle) => patch({ metaTitle })} />
        <Area label="Meta description" value={form.metaDescription} onChange={(metaDescription) => patch({ metaDescription })} />
      </section>

      <section className="space-y-4 bg-white p-5 shadow-sm">
        <h2 className="font-display text-2xl">Marca y encabezado</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Nombre" value={form.brandName} onChange={(brandName) => patch({ brandName })} />
          <Field label="Firma" value={form.brandScript} onChange={(brandScript) => patch({ brandScript })} />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <ImageField
            label="Logo del header"
            filename={form.logoHeader}
            kind="logo"
            onChange={(logoHeader) => patch({ logoHeader })}
            hint="Versión para fondo claro. PNG transparente · 364 × 116 px (o 546 × 174)."
          />
          <ImageField
            label="Logo del footer"
            filename={form.logoFooter}
            kind="logo"
            onChange={(logoFooter) => patch({ logoFooter })}
            hint="Versión para fondo oscuro. PNG transparente · 364 × 116 px (o 546 × 174)."
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="hero-interval">Segundos entre imágenes del hero</Label>
          <Input
            id="hero-interval"
            type="number"
            min={3}
            max={120}
            value={form.heroIntervalSeconds ?? 10}
            onChange={(event) => patch({ heroIntervalSeconds: Number(event.target.value) || 10 })}
            className="max-w-[140px]"
          />
          <p className="text-xs text-black/50">Entre 3 y 120. Por defecto 10. Solo rota si hay al menos dos slides.</p>
        </div>

        <div className="space-y-3">
          <h3 className="text-sm font-medium">Slide 1</h3>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <ImageField
                label="Escritorio"
                filename={form.heroImage}
                kind="hero"
                onChange={(heroImage) => patch({ heroImage })}
              />
              <p className="text-xs text-black/50">≈ 12:5 · 1920 × 800 px · JPG o WEBP · &lt; 400 KB.</p>
            </div>
            <div className="space-y-2">
              <ImageField
                label="Celular"
                filename={form.heroImageMobile}
                kind="hero"
                onChange={(heroImageMobile) => patch({ heroImageMobile })}
              />
              <p className="text-xs text-black/50">
                ≈ 1:1,1 · 1080 × 1188 px. Si falta, se usa la de escritorio.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="text-sm font-medium">Slide 2</h3>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <ImageField
                label="Escritorio"
                filename={form.heroImage2}
                kind="hero"
                onChange={(heroImage2) => patch({ heroImage2 })}
              />
              <p className="text-xs text-black/50">Misma proporción que el slide 1 (1920 × 800).</p>
            </div>
            <div className="space-y-2">
              <ImageField
                label="Celular"
                filename={form.heroImageMobile2}
                kind="hero"
                onChange={(heroImageMobile2) => patch({ heroImageMobile2 })}
              />
              <p className="text-xs text-black/50">
                Si falta, se usa la de escritorio del slide 2. Sin slide 2, el hero queda fijo.
              </p>
            </div>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-3">
            <Field label="Valor 1" value={form.feature1} onChange={(feature1) => patch({ feature1 })} />
            <ImageField
              label="Ícono 1"
              filename={form.feature1Image}
              kind="icon"
              onChange={(feature1Image) => patch({ feature1Image })}
              hint="PNG transparente · 88 × 88 px. La imagen ocupa todo el ícono (podés incluir el círculo en el archivo)."
            />
          </div>
          <div className="space-y-3">
            <Field label="Valor 2" value={form.feature2} onChange={(feature2) => patch({ feature2 })} />
            <ImageField
              label="Ícono 2"
              filename={form.feature2Image}
              kind="icon"
              onChange={(feature2Image) => patch({ feature2Image })}
              hint="PNG transparente · 88 × 88 px. La imagen ocupa todo el ícono (podés incluir el círculo en el archivo)."
            />
          </div>
          <div className="space-y-3">
            <Field label="Valor 3" value={form.feature3} onChange={(feature3) => patch({ feature3 })} />
            <ImageField
              label="Ícono 3"
              filename={form.feature3Image}
              kind="icon"
              onChange={(feature3Image) => patch({ feature3Image })}
              hint="PNG transparente · 88 × 88 px. La imagen ocupa todo el ícono (podés incluir el círculo en el archivo)."
            />
          </div>
        </div>
      </section>

      <section className="space-y-4 bg-white p-5 shadow-sm">
        <h2 className="font-display text-2xl">Cuerpo</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <ColorField label="Color de fondo" value={form.bgColor} onChange={(bgColor) => patch({ bgColor })} />
          <ColorField label="Color principal" value={form.primaryColor} onChange={(primaryColor) => patch({ primaryColor })} />
          <ColorField label="Color secundario" value={form.secondaryColor} onChange={(secondaryColor) => patch({ secondaryColor })} />
          <ColorField label="Color de texto" value={form.textColor} onChange={(textColor) => patch({ textColor })} />
        </div>
        <ImageField label="Imagen de fondo opcional" filename={form.bodyBgImage} kind="background" onChange={(bodyBgImage) => patch({ bodyBgImage })} />
      </section>

      <section className="space-y-4 bg-white p-5 shadow-sm">
        <h2 className="font-display text-2xl">Banner debajo del catálogo</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <ImageField
              label="Banner (escritorio)"
              filename={form.midBannerImage}
              kind="banner"
              onChange={(midBannerImage) => patch({ midBannerImage })}
            />
            <p className="text-xs text-black/50">
              A lo ancho · Recomendada 1920 × 560 px · JPG o WEBP · &lt; 400 KB. El diseño va dentro de la
              imagen. Sin esta, el banner no se muestra.
            </p>
          </div>
          <div className="space-y-2">
            <ImageField
              label="Banner (celular)"
              filename={form.midBannerImageMobile}
              kind="banner"
              onChange={(midBannerImageMobile) => patch({ midBannerImageMobile })}
            />
            <p className="text-xs text-black/50">
              Pantallas &lt; 768 px · Recomendada 1080 × 1188 px (≈ 1:1,1) · JPG o WEBP · &lt; 400 KB. Si no
              cargás una, se usa la de escritorio.
            </p>
          </div>
        </div>
      </section>

      <section className="space-y-4 bg-white p-5 shadow-sm">
        <h2 className="font-display text-2xl">Bloques y llamado</h2>
        <Area label="Título regalos corporativos" value={form.promo1Title} onChange={(promo1Title) => patch({ promo1Title })} />
        <ImageField label="Imagen corporativa" filename={form.promo1Image} kind="banner" onChange={(promo1Image) => patch({ promo1Image })} />
        <Area label="Título regalos empresariales" value={form.promo2Title} onChange={(promo2Title) => patch({ promo2Title })} />
        <ImageField label="Imagen empresarial" filename={form.promo2Image} kind="banner" onChange={(promo2Image) => patch({ promo2Image })} />
        <Field label="Botón" value={form.ctaLabel} onChange={(ctaLabel) => patch({ ctaLabel })} />
      </section>

      <section className="space-y-4 bg-white p-5 shadow-sm">
        <h2 className="font-display text-2xl">Footer</h2>
        <Area label="Texto de marca" value={form.footerIntro} onChange={(footerIntro) => patch({ footerIntro })} />
        <div className="grid gap-4 md:grid-cols-2">
          {form.footerColumns.map((column, index) => (
            <div key={index} className="space-y-2">
              <Field
                label={`Columna ${index + 1}`}
                value={column.title}
                onChange={(title) => {
                  const footerColumns = form.footerColumns.map((item, itemIndex) =>
                    itemIndex === index ? { ...item, title } : item
                  );
                  patch({ footerColumns });
                }}
              />
              <Textarea
                value={column.lines.join("\n")}
                onChange={(event) => {
                  const lines = event.target.value.split("\n").slice(0, 8);
                  const footerColumns = form.footerColumns.map((item, itemIndex) =>
                    itemIndex === index ? { ...item, lines } : item
                  );
                  patch({ footerColumns });
                }}
              />
            </div>
          ))}
        </div>
      </section>

      {error && <p className="text-sm text-[#7a2e2e]">{error}</p>}
      <Button type="submit">Guardar cambios</Button>

      <section className="space-y-3">
        <h2 className="font-display text-2xl">Vista previa</h2>
        <iframe key={previewKey} title="Vista previa del sitio" src="/" className="h-[480px] w-full border border-black/10 bg-white" />
      </section>
    </form>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  const id = label.toLowerCase().replace(/\s+/g, "-");
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} value={value} onChange={(event) => onChange(event.target.value)} />
    </div>
  );
}

function Area({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  const id = label.toLowerCase().replace(/\s+/g, "-");
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Textarea id={id} value={value} onChange={(event) => onChange(event.target.value)} />
    </div>
  );
}

function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  const id = label.toLowerCase().replace(/\s+/g, "-");
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <div className="flex gap-2">
        <input id={id} type="color" value={value} onChange={(event) => onChange(event.target.value)} className="h-10 w-14 border border-black/10 bg-white" />
        <Input value={value} onChange={(event) => onChange(event.target.value)} />
      </div>
    </div>
  );
}
