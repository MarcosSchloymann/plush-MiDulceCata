import { Router } from "express";
import { getPublicSite } from "../site";

export const publicRouter = Router();

publicRouter.get("/health", (_req, res) => {
  res.json({ ok: true, service: "midulcecata" });
});

publicRouter.get("/site", async (_req, res, next) => {
  try {
    const data = await getPublicSite();
    res.setHeader("Cache-Control", "no-cache");
    res.json(data);
  } catch (error) {
    next(error);
  }
});
