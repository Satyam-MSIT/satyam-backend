import { RequestHandler } from "express";
import { limit, limitMB } from "../constants";
import { deleteFiles, getFiles } from "../modules/file";

export default function checksize(strict = true): RequestHandler {
  return async (req, res, next) => {
    try {
      const files = getFiles(req);
      if (!strict && !files.length) return next();
      let size = files.reduce((sum, { size }) => sum + size, 0);
      if (!size) {
        res.status(400).json({ success: false, error: "Empty file(s)" });
        deleteFiles(files);
      } else if (size > limit) {
        res.status(400).json({ success: false, error: `Total size must not exceed ${limitMB}MB` });
        deleteFiles(files);
      } else next();
    } catch {
      res.status(500).json({ success: false, error: "Uh Oh, Something went wrong!" });
    }
  };
}
