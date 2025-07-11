import { NextFunction, Response, Request } from "express";
import { Announcement } from "../../types";
import fs, { read } from "fs";
import { sendEvent } from "../routes/socket";

const readAnnouncements = () => {
  const rawData = fs.readFileSync("./data/announcements.json", "utf-8");
  const announements: Announcement[] = JSON.parse(rawData);
  return announements;
};

export const getAll = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  return res.send(readAnnouncements());
};

export const getActive = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const now = new Date();
  // have to cast to Date bc under the hood its actually a string :/
  return res.send(
    readAnnouncements().filter(
      (a) => new Date(a.start_time) < now && new Date(a.end_time) > now
    )
  );
};

export const add = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data: Announcement = {
      start_time: req.body.start_time,
      end_time: req.body.end_time,
      title: req.body.title,
      text: req.body.text,
      image: req.file?.path ?? "static/images/default.png", // this will contain the path of the uploaded image
    };

    // console.log(new Date(data.start_time), new Date())
    if (new Date(data.start_time) < new Date()) { // send an event if active
      sendEvent("new-announcement")
    }

    const announcements = readAnnouncements();
    announcements.push(data);

    fs.writeFileSync(
      "./data/announcements.json",
      JSON.stringify(announcements),
      "utf-8"
    );

    res.send({ success: true });
  } catch (err) {
    res.status(400).send(err);
  }
};
