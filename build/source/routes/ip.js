"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const ip_controller_1 = require("../controller.ts/ip.controller");
const router = (0, express_1.Router)();
router.get("/", ip_controller_1.getLocalIP);
exports.default = router;
