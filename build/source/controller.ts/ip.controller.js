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
exports.getLocalIP = void 0;
const os_1 = __importDefault(require("os"));
const getLocalIPAddress = () => {
    const networkInterfaces = os_1.default.networkInterfaces();
    for (const interfaceName in networkInterfaces) {
        const addresses = networkInterfaces[interfaceName];
        if (addresses) {
            for (const address of addresses) {
                // Find the first IPv4 non-internal address
                if (address.family === "IPv4" && !address.internal) {
                    return address.address;
                }
            }
        }
    }
    // Fallback if no private IP is found
    return "localhost";
};
const getLocalIP = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(`${Date()}: Get IP`);
    try {
        const localIP = getLocalIPAddress(); // Fetch the local IP
        return res.send({ ip: localIP });
    }
    catch (err) {
        console.error("Error fetching local IP:", err);
        return res.status(500).send({ error: "Failed to fetch local IP" });
    }
});
exports.getLocalIP = getLocalIP;
