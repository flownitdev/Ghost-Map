import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { users } from "@workspace/db/schema";
import { logger } from "../lib/logger";

const router: IRouter = Router();

router.get("/auth/user", async (req, res) => {
  const userId = req.headers["x-replit-user-id"] as string | undefined;
  const userName = req.headers["x-replit-user-name"] as string | undefined;

  if (!userId) {
    res.json({ user: null });
    return;
  }

  try {
    await db.insert(users).values({ id: userId, name: userName ?? null, email: null })
      .onConflictDoUpdate({ target: users.id, set: { name: userName ?? null } });
  } catch (err) {
    logger.warn({ err }, "Failed to upsert user on auth");
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
