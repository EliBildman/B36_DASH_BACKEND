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
exports.getAll = void 0;
const fs_1 = __importDefault(require("fs"));
const google_maps_services_js_1 = require("@googlemaps/google-maps-services-js");
const CACHE_TIME_MINS = 10; // TODO: make a real cache lmfao
let lastRequestTime = 0;
let cachedCommuteTimes = {};
const getAll = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const now = Date.now();
    const nowString = Date();
    if (now - lastRequestTime < CACHE_TIME_MINS * 60 * 1000) {
        console.log(`${nowString}: Used cached commute time`);
        return res.send(cachedCommuteTimes);
    }
    else {
        console.log(`${nowString}: Get all commute times`);
    }
    const rawData = fs_1.default.readFileSync("./data/locations.json", "utf-8");
    const locations = JSON.parse(rawData);
    const here = [42.304603, -71.2286];
    const client = new google_maps_services_js_1.Client({});
    const distanceRes = yield client.distancematrix({
        params: {
            origins: [here],
            destinations: locations.map((l) => l.loc),
            key: (_a = process.env.GOOGLE_API_KEY) !== null && _a !== void 0 ? _a : "",
            units: google_maps_services_js_1.UnitSystem.imperial,
        },
    });
    const commutes = distanceRes.data.rows[0].elements.map((trip, i) => {
        return {
            location: locations[i],
            trip,
        };
    });
    lastRequestTime = now;
    cachedCommuteTimes = commutes;
    return res.send(commutes);
});
exports.getAll = getAll;
