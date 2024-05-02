import express, { Express } from "express";
import commutes from "./commutes";

const router = express.Router();

router.use("/commutes", commutes);

export default router;
