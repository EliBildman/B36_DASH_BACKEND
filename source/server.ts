import express from "express";
import routes from "./routes/index";
import cors from "cors";
import "dotenv/config";
import fs from "fs";
import http from "http";
import { setupSocketRoute } from "./routes/socket";
import { manageBackups } from "./backup";

// const key = fs.readFileSync("./ssl/localhost.key");
// const cert = fs.readFileSync("./ssl/localhost.crt");

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());

app.use((req, res, next) => {
  console.log(`Request ${req.url}`);
  next();
});

app.use("/", routes);

app.use((req, res, next) => {
  return res.status(404);
});

const port = 4000;

// const server = https.createServer({ key: key, cert: cert }, app);
const server = http.createServer(app);

setupSocketRoute(server);

server.listen(port, '0.0.0.0', () => {
  console.log(`listening on port ${port}`);
});

// backup data daily
const baclupInt = setInterval(manageBackups, 1000 * 60 * 60 * 24);
