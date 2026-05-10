import { Router, type IRouter } from "express";
import { logger } from "../lib/logger";

const router: IRouter = Router();

router.get("/auth/user", (req, res) => {
  const userId = req.headers["x-replit-user-id"] as string | undefined;
  const userName = req.headers["x-replit-user-name"] as string | undefined;

  if (!userId) {
    res.json({ user: null });
    return;
  }

  res.json({
    user: {
      id: userId,
      name: userName ?? null,
      email: null,
    },
  });
});

export default router;
