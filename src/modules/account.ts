import { Response } from "express";

export function authenticationError(res: Response) {
  res.status(401).json({ success: false, error: "Session expired! Please login again." });
}
