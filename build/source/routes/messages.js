"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const messages_controller_1 = require("../controller.ts/messages.controller");
const router = (0, express_1.Router)();
router.post('/', messages_controller_1.send);
exports.default = router;
