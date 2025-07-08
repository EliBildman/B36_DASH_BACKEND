import { Router } from "express";
import {
  getAll,
  getActive,
  add,
  deleteStream,
  setActive,
  setCycleLivestreams,
  getCycleLivestreams,
} from "../controller.ts/livestreams.controller";

const router = Router();
router.get("/", getAll);
router.put("/", add);
router.delete("/", deleteStream);
router.post("/", setActive);

router.get("/active", getActive);

router.get("/cycle", getCycleLivestreams);
router.post("/cycle", setCycleLivestreams);

export default router;
