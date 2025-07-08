"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.send = void 0;
const socket_1 = require("../routes/socket");
const send = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.body.message) {
        res.status(400).send("Need message");
    }
    const message = req.body.message;
    (0, socket_1.sendEvent)(message);
    res.send({ success: true });
});
exports.send = send;
