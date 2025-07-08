import { Request, Response, NextFunction } from "express";
import fs from "fs";
import {
  Client,
  LatLng,
  LatLngArray,
  UnitSystem,
} from "@googlemaps/google-maps-services-js";
import { Location } from "../../types";

const CACHE_TIME_MINS = 10; // TODO: make a real cache lmfao
let lastRequestTime = 0;
let cachedCommuteTimes = {};

export const getAll = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const now = Date.now();
  const nowString = Date();

  if (now - lastRequestTime < CACHE_TIME_MINS * 60 * 1000) {
    console.log(`${nowString}: Used cached commute time`);
    return res.send(cachedCommuteTimes);
  } else {
    console.log(`${nowString}: Get all commute times`);
  }

  const rawData = fs.readFileSync("./data/locations.json", "utf-8");
  const locations: Location[] = JSON.parse(rawData);

  const here: LatLng = [42.304603, -71.2286];

  const client = new Client({});
  const distanceRes = await client.distancematrix({
    params: {
      origins: [here],
      destinations: locations.map((l) => l.loc),
      key: process.env.GOOGLE_API_KEY ?? "",
      units: UnitSystem.imperial,
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
};
