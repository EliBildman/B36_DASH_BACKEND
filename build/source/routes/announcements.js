"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const announements_controller_1 = require("../controller.ts/announements.controller");
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const router = (0, express_1.Router)();
router.get("/", announements_controller_1.getAll);
router.get("/active", announements_controller_1.getActive);
const imageStorage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "static/images");
    },
    filename: (req, file, cb) => {
        cb(null, file.fieldname + "-" + Date.now() + path_1.default.extname(file.originalname));
    },
});
const uploadImage = (0, multer_1.default)({ storage: imageStorage });
router.post("/add", uploadImage.single("image"), announements_controller_1.add);
exports.default = router;
