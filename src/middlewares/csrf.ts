import { RequestHandler } from "express";

const { CORS } = process.env;

const csrf: RequestHandler = (req, res, next) => {
  if (req.headers.origin !== CORS) return res.status(401).json({ success: false, error: "Not authorized" });
  next();
};

export default csrf;
