import { Router } from "express";
import { send } from "../controller.ts/messages.controller";

const router = Router();

router.post('/', send);

export default router;