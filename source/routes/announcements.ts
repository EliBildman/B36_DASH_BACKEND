import { Router } from "express";
import { getAll, getActive, add } from "../controller.ts/announements.controller";
import multer from 'multer';
import path from 'path';
import { Announcement } from "../../types";

const router = Router();
router.get("/", getAll);
router.get("/active", getActive);

const imageStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'static/images');
  },
  filename: (req, file, cb) => {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});

const uploadImage = multer({ storage: imageStorage });

router.post('/add', uploadImage.single('image'), add);

export default router;
