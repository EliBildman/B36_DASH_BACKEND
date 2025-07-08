import { Router } from "express";
import { getLocalIP } from "../controller.ts/ip.controller";

const router = Router();
router.get("/", getLocalIP);

export default router;