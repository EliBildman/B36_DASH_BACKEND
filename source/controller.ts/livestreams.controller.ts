import { NextFunction, Response, Request } from "express";
import { Livestream } from "../../types";
import fs, { read } from "fs";
import { v4 as uuid } from "uuid";
import { sendEvent } from "../routes/socket";

const storagePath = "./data/livestreams.json";
let activeStream: Livestream | null;
let cycleLivestreams = true;

const cycleTime = 30; //mins

const readLivestreams = () => {
  const rawData = fs.readFileSync(storagePath, "utf-8");
  const announements: Livestream[] = JSON.parse(rawData);
  return announements;
};

const writeLivestreams = (streams: Livestream[]) => {
  fs.writeFileSync(storagePath, JSON.stringify(streams), "utf-8");
};

activeStream = readLivestreams()[0];

const cycleStream = () => {
  if(!cycleLivestreams) {
    return;
  }
  
  const streams = readLivestreams();

  if (streams.length === 0) {
    activeStream = null;
    return;
  }
  // if no active stream, but streams in storage, set to -1 so newIndex = 0
  var activeIndex = activeStream
    ? streams.findIndex((s) => s.id === activeStream?.id)
    : -1;
  const newIndex = (activeIndex + 1) % streams.length;
  activeStream = streams[newIndex];
  sendEvent("new-livestream"); // send socket event
};

setInterval(cycleStream, cycleTime * 1000 * 60);

const getYouTubeVideoId = (url: string) => {
  const urlPattern = /(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([^&]+)/;
  const match = url.match(urlPattern);
  if (!match) {
    throw new Error("no video code found");
  }
  return match[1];
};

export const getAll = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  return res.send(readLivestreams());
};

export const getActive = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!activeStream) return res.send({ id: null, code: null });
  return res.send(activeStream);
};

export const add = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const url = req.body.url;
    const videoCode = getYouTubeVideoId(url);

    const data: Livestream = {
      id: uuid(),
      code: videoCode,
    };

    const streams = readLivestreams();
    streams.push(data);

    writeLivestreams(streams);

    res.send({ success: true });
  } catch (err) {
    res.status(400).send(err);
  }
};

export const deleteStream = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = req.body.id;
    const streams = readLivestreams();
    const index = streams.findIndex((s) => s.id === id);
    const stream = streams.find((s) => s.id === id);
    if (index === -1) throw new Error(`could not find stream with id ${id}`);

    streams.splice(index, 1);
    writeLivestreams(streams);

    if (stream?.id === activeStream?.id) {
      // if deleting the active stream, cycle the stream
      cycleStream();
    }

    res.send({ success: true });
  } catch (err) {
    res.status(400).send(err);
  }
};

export const setActive = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = req.body.id;
    const streams = readLivestreams();

    const stream = streams.find((s) => s.id === id);
    if (!stream) throw new Error(`could not find stream with id ${id}`);

    activeStream = stream;
    sendEvent("new-livestream-user-initiated"); // send socket event

    res.send({ success: true });
  } catch (err) {
    res.status(400).send(err);
  }
};

export const setCycleLivestreams = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const value = req.body.value;
    cycleLivestreams = value;
    res.send({ success: true });
  } catch (err) {
    res.status(400).send(err);
  }
};

export const getCycleLivestreams = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  res.send(cycleLivestreams);
};
