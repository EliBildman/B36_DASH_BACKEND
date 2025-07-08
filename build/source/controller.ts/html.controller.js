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
exports.deleteHtml = exports.edit = exports.setActive = exports.add = exports.getActive = exports.getAll = void 0;
const fs_1 = __importDefault(require("fs"));
const uuid_1 = require("uuid");
const socket_1 = require("../routes/socket");
const readSlides = () => {
    const rawData = fs_1.default.readFileSync("./data/html.json", "utf-8");
    const htmlSlides = JSON.parse(rawData);
    return htmlSlides;
};
const getAll = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    return res.send(readSlides());
});
exports.getAll = getAll;
const getActive = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const slides = readSlides();
    const activeSlide = slides.find(slide => slide.active);
    if (!activeSlide) {
        // If no slide is marked active, use the last one
        const last = slides.length - 1;
        if (last < 0) {
            res.send({ id: 'NOTHIN', html: null });
        }
        else {
            res.send(slides[last]);
        }
    }
    else {
        res.send(activeSlide);
    }
});
exports.getActive = getActive;
const add = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const slides = readSlides();
        // Deactivate all existing slides
        slides.forEach(slide => slide.active = false);
        const data = {
            id: (0, uuid_1.v4)(),
            html: req.body.html,
            active: true,
            createdAt: new Date()
        };
        slides.push(data);
        fs_1.default.writeFileSync("./data/html.json", JSON.stringify(slides), "utf-8");
        (0, socket_1.sendEvent)("new-html");
        res.send({ success: true });
    }
    catch (err) {
        res.status(400).send(err);
    }
});
exports.add = add;
const setActive = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const slides = readSlides();
        // Deactivate all slides
        slides.forEach(slide => slide.active = false);
        // Activate the selected slide
        const slideToActivate = slides.find(slide => slide.id === id);
        if (!slideToActivate) {
            return res.status(404).send({ success: false, error: 'Slide not found' });
        }
        slideToActivate.active = true;
        fs_1.default.writeFileSync("./data/html.json", JSON.stringify(slides), "utf-8");
        (0, socket_1.sendEvent)("new-html");
        res.send({ success: true });
    }
    catch (err) {
        res.status(400).send(err);
    }
});
exports.setActive = setActive;
const edit = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { html } = req.body;
        const slides = readSlides();
        const slideToEdit = slides.find(slide => slide.id === id);
        if (!slideToEdit) {
            return res.status(404).send({ success: false, error: 'Slide not found' });
        }
        slideToEdit.html = html;
        fs_1.default.writeFileSync("./data/html.json", JSON.stringify(slides), "utf-8");
        (0, socket_1.sendEvent)("new-html");
        res.send({ success: true });
    }
    catch (err) {
        res.status(400).send(err);
    }
});
exports.edit = edit;
const deleteHtml = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const slides = readSlides();
    const last = slides.length - 1;
    if (last < 0) {
        res.send({ success: false });
        return;
    }
    slides.splice(last, 1);
    fs_1.default.writeFileSync("./data/html.json", JSON.stringify(slides), "utf-8");
    res.send({ success: true });
    (0, socket_1.sendEvent)("new-html");
});
exports.deleteHtml = deleteHtml;
