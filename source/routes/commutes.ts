import { Router } from "express";
import { getAll } from "../controller.ts/commutes.controller";

const router = Router();
router.get("/", getAll);

export default router;
