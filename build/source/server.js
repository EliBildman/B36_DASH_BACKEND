"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const index_1 = __importDefault(require("./routes/index"));
const cors_1 = __importDefault(require("cors"));
require("dotenv/config");
const http_1 = __importDefault(require("http"));
const socket_1 = require("./routes/socket");
const backup_1 = require("./backup");
// const key = fs.readFileSync("./ssl/localhost.key");
// const cert = fs.readFileSync("./ssl/localhost.crt");
const app = (0, express_1.default)();
app.use(express_1.default.urlencoded({ extended: true }));
app.use(express_1.default.json());
app.use((0, cors_1.default)());
app.use((req, res, next) => {
    console.log(`Request ${req.url}`);
    next();
});
app.use("/", index_1.default);
app.use((req, res, next) => {
    return res.status(404);
});
const port = 4000;
// const server = https.createServer({ key: key, cert: cert }, app);
const server = http_1.default.createServer(app);
(0, socket_1.setupSocketRoute)(server);
server.listen(port, '0.0.0.0', () => {
    console.log(`listening on port ${port}`);
});
// backup data daily
const baclupInt = setInterval(backup_1.manageBackups, 1000 * 60 * 60 * 24);
