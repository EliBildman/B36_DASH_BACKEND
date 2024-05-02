import { Request, Response, NextFunction } from "express";
import fs from 'fs';
import { Client, LatLng, LatLngArray, UnitSystem } from "@googlemaps/google-maps-services-js";

export const foo = async (req: Request, res: Response, next: NextFunction) => {
  const data = {a: 1, b: 2};
  return res.send(data);
}

export const getAll = async (req: Request, res: Response, next: NextFunction) => {
  type Location = {
    name: string,
    loc: LatLngArray
  }

  const rawData = fs.readFileSync("./data/locations.json", 'utf-8');
  const locations: Location[] = JSON.parse(rawData);

  const here: LatLng = [42.304603, -71.228600]

  const client = new Client({});
  const distanceRes = await client.distancematrix({
    params: {
      origins: [here],
      destinations: locations.map(l => l.loc),
      key: process.env.GOOGLE_API_KEY ?? '',
      units: UnitSystem.imperial
    },
  });

  const commutes = distanceRes.data.rows[0].elements.map((trip, i) => {
    return {
      location: locations[i],
      trip
    }
  })

  return res.send(commutes);
}