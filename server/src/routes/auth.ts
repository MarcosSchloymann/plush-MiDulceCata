import crypto from "crypto";
import { NextFunction, Request, Response, Router } from "express";
import bcrypt from "bcryptjs";
import rateLimit from "express-rate-limit";
import { prisma } from "../db";
import { loginSchema, passwordSchema } from "../schemas";

const DUMMY_HASH = "$2a$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi";

export const authRouter = Router();

const loginLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Demasiados intentos. Probá de nuevo en unos minutos." },
});

export function ensureCsrf(req: Request, _res: Response, next: NextFunction): void {
  if (!req.session) return next();
  if (!req.session.csrfToken) {
    req.session.csrfToken = crypto.randomBytes(32).toString("hex");
  }
  next();
}

export function requireCsrf(req: Request, res: Response, next: NextFunction): void {
  const token = req.get("x-csrf-token");
  if (!req.session || !token || token !== req.session.csrfToken) {
    res.status(403).json({ error: "Token CSRF inválido. Recargá la página e intentá de nuevo." });
    return;
  }
  next();
}

export async function requireAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
  const userId = req.session?.userId as string | undefined;
  if (!userId) {
    res.status(401).json({ error: "No autorizado" });
    return;
  }
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    req.session = null;
    res.status(401).json({ error: "No autorizado" });
    return;
  }
  res.locals.user = user;
  next();
}

authRouter.get("/csrf", (req, res) => {
  res.json({ csrfToken: req.session?.csrfToken ?? "" });
});

authRouter.post("/login", loginLimit, (req, res, next) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0]?.message || "Datos inválidos" });
    return;
  }

  const username = parsed.data.username.toLowerCase();
  prisma.user
    .findUnique({ where: { username } })
    .then(async (user) => {
      const ok = await bcrypt.compare(parsed.data.password, user?.passwordHash ?? DUMMY_HASH);
      if (!user || !ok) {
        res.status(401).json({ error: "Usuario o contraseña incorrectos" });
        return;
      }
      if (!req.session) {
        res.status(500).json({ error: "No se pudo iniciar la sesión" });
        return;
      }
      const csrfToken = crypto.randomBytes(32).toString("hex");
      req.session.userId = user.id;
      req.session.csrfToken = csrfToken;
      res.json({
        ok: true,
        csrfToken,
        user: { username: user.username },
      });
    })
    .catch(next);
});

authRouter.post("/logout", (req, res) => {
  req.session = null;
  res.json({ ok: true });
});

authRouter.get("/me", async (req, res) => {
  const userId = req.session?.userId as string | undefined;
  if (!userId) {
    res.json({ user: null });
    return;
  }
  const user = await prisma.user.findUnique({ where: { id: userId } });
  res.json({ user: user ? { username: user.username } : null });
});

authRouter.post("/password", requireAuth, async (req, res, next) => {
  try {
    const parsed = passwordSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.issues[0]?.message || "Datos inválidos" });
      return;
    }
    const user = res.locals.user as { id: string; passwordHash: string };
    const ok = await bcrypt.compare(parsed.data.currentPassword, user.passwordHash);
    if (!ok) {
      res.status(400).json({ error: "La contraseña actual no coincide" });
      return;
    }
    const passwordHash = await bcrypt.hash(parsed.data.newPassword, 12);
    await prisma.user.update({ where: { id: user.id }, data: { passwordHash } });
    res.json({ ok: true });
  } catch (error) {
    next(error);
  }
});
