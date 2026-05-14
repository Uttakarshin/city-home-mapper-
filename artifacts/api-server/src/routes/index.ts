import { Router, type IRouter } from "express";
import healthRouter from "./health";
import propertiesRouter from "./properties";
import favoritesRouter from "./favorites";
import visualizationsRouter from "./visualizations";

const router: IRouter = Router();

router.use(healthRouter);
router.use(propertiesRouter);
router.use(favoritesRouter);
router.use(visualizationsRouter);

export default router;
