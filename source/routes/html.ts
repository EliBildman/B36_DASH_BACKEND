import { Router } from "express";
import {
  getAll,
  getActive,
  add,
  deleteHtml,
  setActive,
  edit,
} from "../controller.ts/html.controller";

const router = Router();
router.get("/", getAll);
router.get("/active", getActive);
router.post("/add", add);
router.post("/delete", deleteHtml);
router.post("/delete/:id", deleteHtml);
router.post("/set-active/:id", setActive);
router.post("/edit/:id", edit);

export default router;
