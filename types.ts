import { LatLngArray } from "@googlemaps/google-maps-services-js";

export type Livestream = {
  id: string,
  code: string,
}

export type Announcement = {
  start_time: Date,
  end_time: Date,
  title: string,
  text: string,
  image: string,
}

export type Location = {
  name: string,
  loc: LatLngArray
}

export type HtmlSlide = {
  id: string,
  html: string,
  active?: boolean,
  createdAt?: Date
}