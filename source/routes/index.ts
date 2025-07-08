import express, { Express } from "express";
import commutes from "./commutes";
import announcements from "./announcements";
import livestreams from "./livestreams";
import ip from './ip';
import tt from './tt';
import messages from './messages';
import html from './html';

const router = express.Router();

// router.use("/commutes", commutes);
router.use("/announcements", announcements);
router.use("/livestreams", livestreams);
router.use("/ip", ip);
router.use("/tt", tt);
router.use("/html", html);
router.use("/message", messages);

router.use(
  "/static",
  express.static("./static")
);

router.use('/favicon.ico', (req, res, next) => {
  res.redirect('/static/favicon.ico');
})

router.use("/", (req, res, next) => {
  res.send("DA BACKEND");
  next();
})

export default router;
