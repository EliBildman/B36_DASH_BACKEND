import { Router } from "express";
import { foo, getAll } from "../controller.ts/commutes.controller";

const router = Router();
router.get("/foo", foo);
router.get("/", getAll);

export default router;
