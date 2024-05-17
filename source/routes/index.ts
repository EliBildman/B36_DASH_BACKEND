import express, { Express } from "express";
import commutes from "./commutes";
import announcements from './announcements';
import path from 'path'

const router = express.Router();

router.use("/commutes", commutes);
router.use("/announcements", announcements);

router.use("/static", express.static(path.join(__dirname, '..', '..', 'static')));

export default router;
