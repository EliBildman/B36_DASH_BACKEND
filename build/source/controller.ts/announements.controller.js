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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.add = exports.getActive = exports.getAll = void 0;
const fs_1 = __importDefault(require("fs"));
const socket_1 = require("../routes/socket");
const readAnnouncements = () => {
    const rawData = fs_1.default.readFileSync("./data/announcements.json", "utf-8");
    const announements = JSON.parse(rawData);
    return announements;
};
const getAll = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    return res.send(readAnnouncements());
});
exports.getAll = getAll;
const getActive = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const now = new Date();
    // have to cast to Date bc under the hood its actually a string :/
    return res.send(readAnnouncements().filter((a) => new Date(a.start_time) < now && new Date(a.end_time) > now));
});
exports.getActive = getActive;
const add = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const data = {
            start_time: req.body.start_time,
            end_time: req.body.end_time,
            title: req.body.title,
            text: req.body.text,
            image: (_b = (_a = req.file) === null || _a === void 0 ? void 0 : _a.path) !== null && _b !== void 0 ? _b : "static/images/default.png", // this will contain the path of the uploaded image
        };
        // console.log(new Date(data.start_time), new Date())
        if (new Date(data.start_time) < new Date()) { // send an event if active
            (0, socket_1.sendEvent)("new-announcement");
        }
        const announcements = readAnnouncements();
        announcements.push(data);
        fs_1.default.writeFileSync("./data/announcements.json", JSON.stringify(announcements), "utf-8");
        res.send({ success: true });
    }
    catch (err) {
        res.status(400).send(err);
    }
});
exports.add = add;
