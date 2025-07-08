"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const announcements_1 = __importDefault(require("./announcements"));
const livestreams_1 = __importDefault(require("./livestreams"));
const ip_1 = __importDefault(require("./ip"));
const tt_1 = __importDefault(require("./tt"));
const messages_1 = __importDefault(require("./messages"));
const html_1 = __importDefault(require("./html"));
const router = express_1.default.Router();
// router.use("/commutes", commutes);
router.use("/announcements", announcements_1.default);
router.use("/livestreams", livestreams_1.default);
router.use("/ip", ip_1.default);
router.use("/tt", tt_1.default);
router.use("/html", html_1.default);
router.use("/message", messages_1.default);
router.use("/static", express_1.default.static("./static"));
router.use('/favicon.ico', (req, res, next) => {
    res.redirect('/static/favicon.ico');
});
router.use("/", (req, res, next) => {
    res.send("DA BACKEND");
    next();
});
exports.default = router;
