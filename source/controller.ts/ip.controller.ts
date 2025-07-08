import { NextFunction, Response, Request } from "express";
import os from "os";

const getLocalIPAddress = (): string => {
  const networkInterfaces = os.networkInterfaces();
  for (const interfaceName in networkInterfaces) {
    const addresses = networkInterfaces[interfaceName];
    if (addresses) {
      for (const address of addresses) {
        // Find the first IPv4 non-internal address
        if (address.family === "IPv4" && !address.internal) {
          return address.address;
        }
      }
    }
  }
  // Fallback if no private IP is found
  return "localhost";
};

export const getLocalIP = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.log(`${Date()}: Get IP`);
  try {
    const localIP = getLocalIPAddress(); // Fetch the local IP
    return res.send({ ip: localIP });
  } catch (err) {
    console.error("Error fetching local IP:", err);
    return res.status(500).send({ error: "Failed to fetch local IP" });
  }
};