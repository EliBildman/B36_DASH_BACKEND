import express from "express";
import routes from "./routes/index";
import http from "http";
import cors from 'cors';
import 'dotenv/config'

const app = express();

app.use(express.urlencoded({extended : true}))
app.use(express.json());
app.use(cors());

app.use("/", routes);

app.use((req, res, next) => {
  return res.status(404).json({ message: "not found" });
});

const port = 4000;
app.listen(port, () => {
  console.log(`listening on port ${port}`);
});
