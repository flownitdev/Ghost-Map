import { Router, type IRouter } from "express";
import { logger } from "../lib/logger";

const router: IRouter = Router();

router.get("/auth/user", (req, res) => {
  const user = req.user as Record<string, unknown> | undefined;

  if (!req.isAuthenticated?.() || !user) {
    res.json({ user: null });
    return;
  }

  const claims = user["claims"] as Record<string, unknown> | undefined;
  if (!claims) {
    res.json({ user: null });
    return;
  }

  const id = claims["sub"] as string;
  const name = (claims["first_name"] as string | undefined) ?? (claims["name"] as string | undefined) ?? null;
  const email = (claims["email"] as string | undefined) ?? null;

  logger.debug({ id }, "Auth user fetched");

  res.json({
    user: { id, name, email },
  });
});

export default router;
