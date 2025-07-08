import { NextFunction, Response, Request } from "express";
import { HtmlSlide } from "../../types";
import fs from "fs";
import {v4 as uuid} from 'uuid';
import { sendEvent } from "../routes/socket";

const readSlides = () => {
  const rawData = fs.readFileSync("./data/html.json", "utf-8");
  const htmlSlides: HtmlSlide[] = JSON.parse(rawData);
  return htmlSlides;
};

export const getAll = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  return res.send(readSlides());
};

export const getActive = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const slides = readSlides();
  const activeSlide = slides.find(slide => slide.active);
  
  if (!activeSlide) {
    // If no slide is marked active, use the last one
    const last = slides.length - 1;
    if (last < 0) {
      res.send({id: 'NOTHIN', html: null});
    } else {
      res.send(slides[last])
    }
  } else {
    res.send(activeSlide);
  }
};

export const add = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const slides = readSlides();
    
    // Deactivate all existing slides
    slides.forEach(slide => slide.active = false);
    
    const data: HtmlSlide = {
      id: uuid(),
      html: req.body.html,
      active: true,
      createdAt: new Date()
    };

    slides.push(data);

    fs.writeFileSync(
      "./data/html.json",
      JSON.stringify(slides),
      "utf-8"
    );

    sendEvent("new-html");
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
    const { id } = req.params;
    const slides = readSlides();
    
    // Deactivate all slides
    slides.forEach(slide => slide.active = false);
    
    // Activate the selected slide
    const slideToActivate = slides.find(slide => slide.id === id);
    if (!slideToActivate) {
      return res.status(404).send({ success: false, error: 'Slide not found' });
    }
    
    slideToActivate.active = true;

    fs.writeFileSync(
      "./data/html.json",
      JSON.stringify(slides),
      "utf-8"
    );

    sendEvent("new-html");
    res.send({ success: true });
  } catch (err) {
    res.status(400).send(err);
  }
};

export const edit = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { html } = req.body;
    const slides = readSlides();
    
    const slideToEdit = slides.find(slide => slide.id === id);
    if (!slideToEdit) {
      return res.status(404).send({ success: false, error: 'Slide not found' });
    }
    
    slideToEdit.html = html;

    fs.writeFileSync(
      "./data/html.json",
      JSON.stringify(slides),
      "utf-8"
    );

    sendEvent("new-html");
    res.send({ success: true });
  } catch (err) {
    res.status(400).send(err);
  }
};

export const deleteHtml = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const slides = readSlides();
    
    if (id) {
      // Delete specific slide by ID
      const slideIndex = slides.findIndex(slide => slide.id === id);
      if (slideIndex === -1) {
        return res.status(404).send({ success: false, error: 'Slide not found' });
      }
      slides.splice(slideIndex, 1);
    } else {
      // Delete last slide (fallback behavior)
      const last = slides.length - 1;
      if (last < 0) {
        return res.send({ success: false, error: 'No slides to delete' });
      }
      slides.splice(last, 1);
    }

    fs.writeFileSync(
        "./data/html.json",
        JSON.stringify(slides),
        "utf-8"
      );

    res.send({ success: true });
    sendEvent("new-html");
  } catch (err) {
    res.status(400).send(err);
  }
};
