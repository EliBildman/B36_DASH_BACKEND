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
exports.getCycleLivestreams = exports.setCycleLivestreams = exports.setActive = exports.deleteStream = exports.add = exports.getActive = exports.getAll = void 0;
const fs_1 = __importDefault(require("fs"));
const uuid_1 = require("uuid");
const socket_1 = require("../routes/socket");
const storagePath = "./data/livestreams.json";
let activeStream;
let cycleLivestreams = true;
const cycleTime = 30; //mins
const readLivestreams = () => {
    const rawData = fs_1.default.readFileSync(storagePath, "utf-8");
    const announements = JSON.parse(rawData);
    return announements;
};
const writeLivestreams = (streams) => {
    fs_1.default.writeFileSync(storagePath, JSON.stringify(streams), "utf-8");
};
activeStream = readLivestreams()[0];
const cycleStream = () => {
    if (!cycleLivestreams) {
        return;
    }
    const streams = readLivestreams();
    if (streams.length === 0) {
        activeStream = null;
        return;
    }
    // if no active stream, but streams in storage, set to -1 so newIndex = 0
    var activeIndex = activeStream
        ? streams.findIndex((s) => s.id === (activeStream === null || activeStream === void 0 ? void 0 : activeStream.id))
        : -1;
    const newIndex = (activeIndex + 1) % streams.length;
    activeStream = streams[newIndex];
    (0, socket_1.sendEvent)("new-livestream"); // send socket event
};
setInterval(cycleStream, cycleTime * 1000 * 60);
const getYouTubeVideoId = (url) => {
    const urlPattern = /(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([^&]+)/;
    const match = url.match(urlPattern);
    if (!match) {
        throw new Error("no video code found");
    }
    return match[1];
};
const getAll = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    return res.send(readLivestreams());
});
exports.getAll = getAll;
const getActive = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    if (!activeStream)
        return res.send({ id: null, code: null });
    return res.send(activeStream);
});
exports.getActive = getActive;
const add = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const url = req.body.url;
        const videoCode = getYouTubeVideoId(url);
        const data = {
            id: (0, uuid_1.v4)(),
            code: videoCode,
        };
        const streams = readLivestreams();
        streams.push(data);
        writeLivestreams(streams);
        res.send({ success: true });
    }
    catch (err) {
        res.status(400).send(err);
    }
});
exports.add = add;
const deleteStream = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = req.body.id;
        const streams = readLivestreams();
        const index = streams.findIndex((s) => s.id === id);
        const stream = streams.find((s) => s.id === id);
        if (index === -1)
            throw new Error(`could not find stream with id ${id}`);
        streams.splice(index, 1);
        writeLivestreams(streams);
        if ((stream === null || stream === void 0 ? void 0 : stream.id) === (activeStream === null || activeStream === void 0 ? void 0 : activeStream.id)) {
            // if deleting the active stream, cycle the stream
            cycleStream();
        }
        res.send({ success: true });
    }
    catch (err) {
        res.status(400).send(err);
    }
});
exports.deleteStream = deleteStream;
const setActive = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = req.body.id;
        const streams = readLivestreams();
        const stream = streams.find((s) => s.id === id);
        if (!stream)
            throw new Error(`could not find stream with id ${id}`);
        activeStream = stream;
        (0, socket_1.sendEvent)("new-livestream-user-initiated"); // send socket event
        res.send({ success: true });
    }
    catch (err) {
        res.status(400).send(err);
    }
});
exports.setActive = setActive;
const setCycleLivestreams = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const value = req.body.value;
        cycleLivestreams = value;
        res.send({ success: true });
    }
    catch (err) {
        res.status(400).send(err);
    }
});
exports.setCycleLivestreams = setCycleLivestreams;
const getCycleLivestreams = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    res.send(cycleLivestreams);
});
exports.getCycleLivestreams = getCycleLivestreams;
