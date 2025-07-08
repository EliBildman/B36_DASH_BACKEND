import { NextFunction, Response, Request } from "express";
import { sendEvent } from "../routes/socket";

export const send = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.body.message) {
    res.status(400).send("Need message");
  }
  const message = req.body.message;
  sendEvent(message);
  res.send({success: true});
};
