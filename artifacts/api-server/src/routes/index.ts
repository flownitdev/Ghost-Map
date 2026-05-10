import { Router, type IRouter } from "express";
import healthRouter from "./health";
import aiRouter from "./ai";
import locationsRouter from "./locations";
import analysisRouter from "./analysis";
import authRouter from "./auth";
import osmRouter from "./osm";
import intelligenceRouter from "./intelligence";

const router: IRouter = Router();

router.use(authRouter);
router.use(healthRouter);
router.use(aiRouter);
router.use(locationsRouter);
router.use(analysisRouter);
router.use(osmRouter);
router.use(intelligenceRouter);

export default router;
