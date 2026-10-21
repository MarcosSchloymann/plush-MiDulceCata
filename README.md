# Mi Dulce Cata

Catálogo web de chocolates con sitio público y panel de administración. La interfaz sigue la referencia visual de la marca: fondo crema, cacao oscuro, acentos dorados, tipografía serif y un carrusel de productos de altura uniforme.

## Qué incluye

- Sitio público responsive (escritorio, tablet y celular).
- Hero como imagen fija a lo ancho (el texto va dentro de la foto). Solo se cambia la imagen desde el panel; el botón de WhatsApp queda sobre la imagen.
- Catálogo en cards del mismo tamaño. Las fotos ocupan todo el ancho y usan `object-fit: cover`.
- Modal de producto al 80% del viewport, con fondo desenfocado, galería y botones de redes.
- Footer con WhatsApp, Facebook e Instagram.
- Panel privado en `/admin` con usuario y contraseña.
- Alta, edición y baja de productos, con confirmación antes de eliminar.
- Carga de imágenes con vista previa, compresión y conversión a WEBP.
- SEO: título y descripción dinámicos, Open Graph, `sitemap.xml` y `robots.txt`.
- Seguridad: bcrypt, sesión httpOnly, CSRF, validación, sanitización y encabezados de Helmet.

## Tecnologías

- Frontend: React, Vite, TypeScript, Tailwind CSS y componentes al estilo shadcn/ui (Radix).
- Backend: Node.js y Express.
- Base de datos: PostgreSQL con Prisma (local con Docker; en la nube Neon u otra Postgres).
- Imágenes: Sharp comprime y convierte a WEBP antes de guardar.

## Logos

Hay dos logos independientes, editables en Administración → Apariencia:

- Logo del header (fondo claro)
- Logo del footer (fondo oscuro)

- Formato: PNG con fondo transparente (también acepta WEBP)
- Resolución recomendada: 364 × 116 px (o 546 × 174 para 3×)
- En pantalla se muestran a ≈ 182 × 58 px

Si no hay imagen cargada, el sitio usa el logo tipográfico de respaldo.

## Imágenes del hero

El hero es una sola imagen a lo ancho. Armá el texto y el diseño dentro del archivo:

- Relación aproximada: 12:5
- Resolución recomendada: 1920 × 800 px
- Formato: JPG o WEBP
- Peso recomendado: menor a 400 KB

Se cambia desde Administración → Apariencia → Imagen del hero.

## Imágenes de producto

Para que todas las cards se vean iguales:

- Relación: 4:3
- Resolución recomendada: 1200 x 900 px
- Formato: JPG o WEBP
- Peso recomendado: menor a 300 KB

El servidor acepta JPG, PNG y WEBP de hasta 5 MB, los redimensiona y los comprime. En el catálogo se muestran con lazy loading.

## Requisitos

- Node.js 20 o superior
- npm
- Docker Desktop **o** una `DATABASE_URL` de Postgres gratis ([Neon](https://neon.tech)), si no tenés Docker

## Instalación

Desde la carpeta del proyecto:

```powershell
npm run db:up
npm run setup
```

Si no tenés Docker, creá una base en [Neon](https://neon.tech), pegá la URL en `server/.env` como `DATABASE_URL` y corré solo `npm run setup`.

También podés ejecutar `scripts\install.ps1`.

El script instala dependencias, crea `server/.env`, aplica las migraciones y carga el catálogo inicial.

Acceso de desarrollo:

- Sitio: http://localhost:5173
- Admin: http://localhost:5173/admin
- Usuario: `admin`
- Contraseña: `Cambiar123!`

Cambiá la contraseña desde el resumen del panel y reemplazá los enlaces de redes de ejemplo.

## Desarrollo

```powershell
npm run dev
```

Levanta la API en el puerto definido en `server/.env` (4000 por defecto) y el sitio en http://localhost:5173. El navegador habla solo con el puerto 5173: Vite reenvía `/api` y `/uploads`. Si el 4000 está ocupado, cambialo en `PORT` y Vite toma ese valor.

## Producción

```powershell
npm run prod
```

También podés ejecutar `scripts\production.ps1`.

Compila el frontend y el servidor, aplica las migraciones y publica todo en:

http://localhost:4000

El admin queda en http://localhost:4000/admin.

Antes de publicarlo en un dominio:

1. En `server/.env`, definí `PUBLIC_URL` con la URL real, por ejemplo `https://midulcecata.com`.
2. Si el sitio usa HTTPS, dejá `PUBLIC_URL` en `https://...` para que la cookie de sesión viaje como segura.
3. Cambiá `SESSION_SECRET`, el usuario y la contraseña.
4. Reemplazá WhatsApp, Facebook e Instagram.
5. Detrás de un proxy, el servidor ya confía en el primer proxy cuando `NODE_ENV=production`.

Para reiniciar sin volver a compilar:

```powershell
npm start --prefix server
```

Ejecutalo con `NODE_ENV=production`.

## Panel de administración

| Sección | Qué permite |
| --- | --- |
| Resumen | Cantidad de productos, redes configuradas, última modificación y cambio de contraseña |
| Productos | Crear, editar, ordenar y eliminar |
| Redes sociales | WhatsApp, Facebook e Instagram, con validación de URL |
| Apariencia | Imagen y textos del hero, colores, fondo, bloques de regalos, footer y SEO |

Los cambios guardados se reflejan en el sitio público sin recompilar. Si el sitio está abierto en otra pestaña, se actualiza al volver a ella.

## Estructura

```text
MiDulceCata/
  client/                 React + Tailwind + shadcn/ui
    src/components/ui/    Botones, inputs y diálogo
    src/components/public/
    src/pages/admin/
  server/
    prisma/               Schema, migraciones y seed
    src/                  API Express
    uploads/              Imágenes optimizadas
    seed-images/          Fotos de origen del catálogo inicial
  scripts/
    install.js
    install.ps1
    production.js
    production.ps1
```

## Deploy en Render (plan free)

Render free duerme el servicio tras inactividad y **no guarda archivos** entre redeploys. Por eso la base va en Postgres externa (Neon gratis) y las imágenes subidas pueden perderse al redesplegar.

### 1. Base de datos (Neon)

1. Creá un proyecto en [Neon](https://neon.tech) (gratis).
2. Copiá la connection string (`postgresql://...`).

### 2. Servicio Web en Render

Opción A — Blueprint:

1. Subí el repo a GitHub.
2. En Render: **New → Blueprint** y elegí el repo (`render.yaml`).
3. Completá las variables que pide (`DATABASE_URL`, `PUBLIC_URL`, `ADMIN_PASSWORD`).

Opción B — Manual:

1. **New → Web Service** desde el repo.
2. Runtime: Node.
3. Build command: `npm run render:build`
4. Start command: `npm run start --prefix server`
5. Plan: Free.
6. Health check path: `/api/public/health`

Variables de entorno en Render:

| Variable | Valor |
| --- | --- |
| `NODE_ENV` | `production` |
| `DATABASE_URL` | URL de Neon |
| `SESSION_SECRET` | cadena larga aleatoria (32+ caracteres) |
| `PUBLIC_URL` | `https://TU-SERVICIO.onrender.com` |
| `COOKIE_SECURE` | `true` |
| `ADMIN_USERNAME` | `admin` (solo el primer arranque) |
| `ADMIN_PASSWORD` | una clave fuerte (solo el primer arranque) |

Tras el deploy, abrí la URL de Render, entrá a `/admin` y cambiá la contraseña. Si redesplegás y se pierden fotos, volvé a subirlas desde Apariencia / Productos.

## Variables de entorno

Están en `server/.env` (y en el dashboard de Render):

| Variable | Uso |
| --- | --- |
| `PORT` | Puerto de la API. Render lo define solo |
| `HOST` | Por defecto `0.0.0.0` |
| `SESSION_SECRET` | Firma de la cookie de sesión |
| `DATABASE_URL` | Postgres, por ejemplo Neon o `postgresql://midulcecata:midulcecata@localhost:5432/midulcecata?schema=public` |
| `ADMIN_USERNAME` | Usuario inicial, solo si todavía no existe |
| `ADMIN_PASSWORD` | Contraseña inicial, solo si todavía no existe |
| `PUBLIC_URL` | URL canónica para sitemap y Open Graph |
| `COOKIE_SECURE` | `true` en HTTPS |

## Seguridad

- Las contraseñas se guardan con bcrypt (12 rondas).
- Las rutas `/api/admin` exigen sesión.
- Las operaciones que modifican datos exigen un token CSRF.
- Los textos se limpian al guardarse y React los escapa al mostrarlos.
- Helmet envía encabezados de seguridad y una política de contenido.
- El login está limitado a 10 intentos cada 15 minutos.
- Las imágenes se validan por tipo real, no solo por la extensión, y el nombre de archivo es aleatorio.

## SEO y caché

- El HTML de producción incluye título, descripción y Open Graph según el producto (`/?producto=slug`).
- `http://localhost:4000/sitemap.xml`
- `http://localhost:4000/robots.txt` bloquea `/admin` y `/api`.
- Los archivos de Vite con hash se cachean un año. Las imágenes subidas, siete días. El HTML no se cachea.

## Catálogo inicial

El primer arranque crea ocho productos de ejemplo, el hero y los dos bloques de regalos. Si en `server/seed-images` hay fotos, se usan. Si no, se generan imágenes de marca para que el sitio no quede vacío. Después se reemplazan desde el panel.
