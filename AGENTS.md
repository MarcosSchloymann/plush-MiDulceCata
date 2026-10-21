# AGENTS.md — Mi Dulce Cata

Catálogo web de chocolates para la marca Mi Dulce Cata. El sitio público muestra productos y redes; el panel `/admin` permite editarlos sin volver a compilar.

## Stack y estructura

- Node.js 20 o superior. TypeScript 5.9.
- Cliente: React 19, Vite 7, React Router 7, Tailwind CSS 3.4, componentes al estilo shadcn/ui (Radix, `class-variance-authority`, `clsx`, `tailwind-merge`).
- Servidor: Express 4, Zod 3, Sharp 0.35, Helmet, cookie-session, bcryptjs (hash bcrypt, 12 rondas).
- Datos: PostgreSQL con Prisma 6 (`DATABASE_URL`). En local: `docker compose up -d`. En Render free: Web Service + Postgres externa gratis (Neon). No hay script de lint ni de tests.

```text
client/src/components/public/   sitio público
client/src/components/ui/       piezas de interfaz reutilizables
client/src/pages/admin/         pantallas del panel
client/src/lib/api.ts           fetch con cookie y token CSRF
server/src/index.ts             Express, sesión, estáticos y SEO
server/src/routes/              público, auth y admin
server/src/schemas.ts           validación de entrada
server/prisma/schema.prisma     modelos
server/uploads/                 imágenes ya optimizadas (no se versionan)
server/seed-images/             fotos de origen del catálogo inicial
scripts/install.js              instalación local
scripts/production.js           build y arranque de producción
scripts/render-build.js         build para Render
docker-compose.yml              Postgres local
render.yaml                     blueprint de Render
```

El alias `@/` apunta a `client/src`. En desarrollo el navegador solo habla con el puerto 5173: Vite reenvía `/api`, `/uploads`, `/robots.txt` y `/sitemap.xml` al puerto de `server/.env`.

## Comandos

Desde la raíz del proyecto:

```powershell
npm run db:up
npm run setup
npm run dev
npm run build
npm run prod
npm run render:build
```

Comprobación de tipos:

```powershell
npm run build --prefix client
npx tsc -p tsconfig.json --noEmit
```

El segundo comando se ejecuta dentro de `server/`. El build del cliente ya incluye `tsc --noEmit`.

Base de datos, dentro de `server/`:

```powershell
npx prisma migrate deploy
npx tsx prisma/seed.ts
npx prisma generate
```

No hay `npm run lint` ni `npm test`.

## Convenciones

- Textos de interfaz, errores de API y comentarios nuevos en español de Argentina (voseo: «probá», «ingresá»).
- Nombres de código en inglés: archivos, funciones, variables y campos de Prisma.
- Componentes de React en PascalCase. Rutas de URL en español: `/admin/productos`, `/admin/redes`, `/admin/apariencia`.
- Estilos con utilidades de Tailwind y las variables `--bg`, `--primary`, `--secondary` y `--text`. El tema se aplica con `applyTheme` en `client/src/lib/theme.ts`.
- Formularios del panel: validar en el cliente y otra vez en el servidor con Zod. Referencia: `server/src/schemas.ts` y `client/src/lib/api.ts`.
- Piezas de UI nuevas siguen el patrón de `client/src/components/ui/button.tsx`.
- Las cards del catálogo mantienen el mismo alto, imagen a `aspect-[4/3]`, ancho completo y `object-cover`. Referencia: `client/src/components/public/ProductCard.tsx`.
- El modal de producto ocupa el 80 % del viewport con estilo en línea. Referencia: `client/src/components/public/ProductModal.tsx`.
- El hero es una imagen fija a lo ancho (`Hero.tsx`). El texto va dentro de la foto; desde el panel solo se cambia la imagen. WhatsApp se superpone abajo a la derecha. No reabrir campos de antetítulo/título/subtítulo del hero en Apariencia.
- Hay dos logos de imagen: `logoHeader` (fondo claro) y `logoFooter` (fondo oscuro). Se editan en Apariencia. Si faltan, `Logo.tsx` usa el fallback tipográfico. Tamaño visual ≈ 182 × 58; archivo recomendado 364 × 116 PNG transparente.
- Los íconos de valores (`feature1Image`…`feature3Image`) se editan junto con el texto en Apariencia. El contenedor es 40–44 px sin borde CSS; la imagen ocupa todo el DIV (`object-contain`). Tipografía intacta. Recomendado 88×88 PNG transparente. Sin imagen, se usan los íconos Lucide.

## Reglas de dominio / trampas conocidas

- Las categorías válidas son fijas: `cajas`, `chocolates`, `alfajores`, `regalos`, `novedades`. Están duplicadas en `server/src/constants.ts` y `client/src/lib/constants.ts`. Si cambia una, hay que cambiar las dos.
- Toda mutación (`POST`, `PUT`, `PATCH`, `DELETE`) exige la cookie `mdc.sid` y el header `x-csrf-token`. Un `fetch` suelto sin `api()` falla con 403.
- Las imágenes guardadas se llaman `img_` + 32 hex + `.webp`. Otro nombre se rechaza. Máximo 5 MB de entrada y 8 imágenes por producto. La primera imagen de la lista es la principal.
- Sharp convierte a WEBP y baja la calidad si el archivo pasa de 300 KB. No guardar el original.
- En producción (Render free) las fotos van a **Cloudinary** (`CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`). Sin eso, `uploads/` se borra al reiniciar. En local, sin esas variables, sigue el disco. El cliente arma la URL con `mediaBase` del endpoint `/api/public/site`.
- WhatsApp, Facebook e Instagram solo aceptan HTTPS de sus dominios. Un teléfono se convierte a `https://wa.me/`. La lógica está en `server/src/social.ts`.
- `footerColumns` se guarda como texto JSON en SQLite y se parsea al leer. No tratarlo como columna relacional.
- `bootstrap()` crea el usuario admin, los ajustes y los productos solo si todavía no existen. Volver a correr el seed no pisa un catálogo ya cargado.
- `PUBLIC_URL` arma el sitemap y Open Graph. En local el HTML de desarrollo lo sirve Vite; las metaetiquetas inyectadas valen en el build de producción.
- La cookie de sesión es segura solo si `COOKIE_SECURE=true` o `PUBLIC_URL` empieza con `https://`. En `http://localhost` tiene que seguir en false.
- El puerto de la API sale de `PORT` en `server/.env`. Vite lo lee al arrancar. Cambiarlo con el servidor ya levantado no actualiza el proxy hasta reiniciar `npm run dev`.
- Tras guardar en el panel, `notifySiteChanged()` avisa a las pestañas abiertas del sitio por `BroadcastChannel` (`mdc-site`).
- No renderizar HTML de la base. Los textos se limpian al guardar y React los escapa. Nada de `dangerouslySetInnerHTML`.
- Los campos `heroEyebrow`, `heroTitle` y `heroSubtitle` siguen en la base por compatibilidad, pero no se editan ni se muestran en el sitio. El hero recomendado es 1920 × 800 px (aprox. 12:5).

## Forma de trabajar

- Un cambio chico y local se hace directo. Si toca el esquema de Prisma, la sesión, el formato de las imágenes o varias pantallas a la vez, resumir el enfoque antes de editar.
- Mantener el diff acotado al pedido. No reformatear archivos ajenos al cambio.
- Al terminar, decir qué cambió, cómo probarlo y qué quedó sin verificar.

## Límites

- ✅ Siempre: respetar el diseño crema, cacao y dorado; mantener cards uniformes y el modal al 80 % del viewport; validar y sanitizar en el servidor; usar `api()` para llamadas autenticadas; textos de cara al usuario en español.
- ⚠️ Pregunta antes: dependencias nuevas, archivos de configuración, cambios en `schema.prisma` o en el formato de imágenes y ajustes, variables de entorno, y reemplazar el catálogo o las credenciales de ejemplo.
- 🚫 Nunca: commitear `server/.env` ni `server/uploads`; guardar contraseñas en texto plano; desactivar CSRF, Helmet o la comprobación de sesión; aceptar SVG u otros tipos que no sean JPG, PNG o WEBP; hacer push, force push o cambiar la configuración de git salvo pedido explícito.

## Verificación

1. Con `npm run dev`, abrir http://localhost:5173.
2. Recorrer el sitio en escritorio y en un ancho de celular: hero, carrusel, modal, redes y footer. Las cards no pueden deformar la foto ni cambiar de alto entre sí.
3. Entrar a http://localhost:5173/admin con `admin` / `Cambiar123!` si nadie cambió la clave. Probar el flujo que se tocó: alta, edición, baja con confirmación, redes o apariencia.
4. Confirmar que un cambio guardado se ve en el sitio público al volver a esa pestaña.
5. Si cambió el servidor o los tipos, correr el build del cliente y `npx tsc -p tsconfig.json --noEmit` dentro de `server/`.
6. Si cambió Prisma, aplicar la migración en Postgres local (`npm run db:up` + `npx prisma migrate deploy`) y comprobar que el seed sigue arrancando en una base vacía.
7. Para Render: `DATABASE_URL` de Neon, `PUBLIC_URL` HTTPS, health en `/api/public/health`, y las tres variables de Cloudinary. Sin Cloudinary, `uploads/` en plan free no es persistente entre redeploys.
