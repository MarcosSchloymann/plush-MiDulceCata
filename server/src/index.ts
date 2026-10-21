import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import express, { NextFunction, Request, Response } from "express";
import helmet from "helmet";
import compression from "compression";
import cookieSession from "cookie-session";
import multer from "multer";
import { ZodError } from "zod";
import { prisma } from "./db";
import { bootstrap } from "./bootstrap";
import { clientDistDir, uploadsDir } from "./constants";
import { publicRouter } from "./routes/public";
import { authRouter, ensureCsrf, requireAuth, requireCsrf } from "./routes/auth";
import { adminRouter } from "./routes/admin";
import { renderIndex, renderRobots, renderSitemap } from "./seo";
import { isCloudinaryEnabled } from "./media";

dotenv.config({ path: path.resolve(__dirname, "../.env") });

async function main() {
  const secret = process.env.SESSION_SECRET || "";
  if (process.env.NODE_ENV === "production" && secret.length < 32) {
    console.error("SESSION_SECRET debe tener al menos 32 caracteres.");
    process.exit(1);
  }

  fs.mkdirSync(uploadsDir, { recursive: true });
  if (isCloudinaryEnabled()) {
    console.log("Imágenes: Cloudinary");
  } else if (process.env.NODE_ENV === "production") {
    console.warn(
      "CLOUDINARY_* no está configurado. En Render free las imágenes se pierden al reiniciar."
    );
  }
  await bootstrap();

  const app = express();
  const secureCookie =
    process.env.COOKIE_SECURE === "true" || (process.env.PUBLIC_URL || "").startsWith("https://");

  if (process.env.NODE_ENV === "production") app.set("trust proxy", 1);

  app.disable("x-powered-by");
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          imgSrc: ["'self'", "data:", "blob:", "https://res.cloudinary.com"],
          styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
          fontSrc: ["'self'", "https://fonts.gstatic.com", "data:"],
          scriptSrc: ["'self'"],
          connectSrc: ["'self'"],
          objectSrc: ["'none'"],
          baseUri: ["'self'"],
          frameAncestors: ["'self'"],
          formAction: ["'self'"],
        },
      },
      crossOriginEmbedderPolicy: false,
    })
  );
  app.use(compression());
  app.use(express.json({ limit: "1mb" }));
  app.use(
    cookieSession({
      name: "mdc.sid",
      keys: [secret || "dev-only-secret-cambia-esto"],
      maxAge: 1000 * 60 * 60 * 8,
      httpOnly: true,
      sameSite: "lax",
      secure: secureCookie,
    })
  );

  app.use("/api", ensureCsrf);
  app.use("/api", (req, res, next) => {
    if (["POST", "PUT", "PATCH", "DELETE"].includes(req.method)) {
      requireCsrf(req, res, next);
      return;
    }
    next();
  });

  app.use("/api/public", publicRouter);
  app.use("/api/auth", authRouter);
  app.use("/api/admin", requireAuth, adminRouter);

  app.use(
    "/uploads",
    express.static(uploadsDir, {
      maxAge: "7d",
      fallthrough: false,
      setHeaders(res) {
        res.setHeader("Cache-Control", "public, max-age=604800");
        res.setHeader("X-Content-Type-Options", "nosniff");
      },
    })
  );

  app.get("/robots.txt", (req, res, next) => {
    renderRobots(req, res).catch(next);
  });
  app.get("/sitemap.xml", (req, res, next) => {
    renderSitemap(req, res).catch(next);
  });

  const indexFile = path.join(clientDistDir, "index.html");
  if (fs.existsSync(indexFile)) {
    app.use(
      express.static(clientDistDir, {
        index: false,
        setHeaders(res, filePath) {
          if (filePath.endsWith(".html")) {
            res.setHeader("Cache-Control", "no-cache");
          } else if (filePath.includes(`${path.sep}assets${path.sep}`)) {
            res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
          } else {
            res.setHeader("Cache-Control", "public, max-age=3600");
          }
        },
      })
    );

    app.get("*", (req, res, next) => {
      if (path.extname(req.path)) {
        res.status(404).end();
        return;
      }
      renderIndex(req, res).catch(next);
    });
  }

  app.use((error: unknown, _req: Request, res: Response, _next: NextFunction) => {
    if (res.headersSent) return;
    if (error instanceof ZodError) {
      res.status(400).json({ error: error.issues[0]?.message || "Datos inválidos" });
      return;
    }
    if (error instanceof multer.MulterError) {
      const message =
        error.code === "LIMIT_FILE_SIZE"
          ? "La imagen supera los 5 MB"
          : "No se pudo subir la imagen";
      res.status(400).json({ error: message });
      return;
    }
    const status = (error as { status?: number }).status;
    if (status && status < 500) {
      res.status(status).json({ error: (error as Error).message });
      return;
    }
    console.error(error);
    res.status(500).json({ error: "Error interno del servidor" });
  });

  const port = Number(process.env.PORT || 4000);
  const host = process.env.HOST || "0.0.0.0";
  const server = app.listen(port, host, () => {
    console.log(`Mi Dulce Cata disponible en http://${host}:${port}`);
  });
  server.on("error", (error: NodeJS.ErrnoException) => {
    if (error.code === "EADDRINUSE") {
      console.error(`El puerto ${port} ya está en uso.`);
      process.exit(1);
    }
    throw error;
  });

  const shutdown = () => {
    server.close(() => {
      prisma.$disconnect().finally(() => process.exit(0));
    });
  };
  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
