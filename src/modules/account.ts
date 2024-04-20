import { Response } from "express";

export function authenticationError(res: Response, error: string = "Not authorized!") {
  res.status(401).json({ success: false, error });
}
