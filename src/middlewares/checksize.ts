import { RequestHandler } from "express";
import { limit, limitMB } from "../constants";
import { deleteFile } from "../modules/file";

const checksize: RequestHandler = async (req, res, next) => {
  try {
    const { path, size } = req.file!;
    if (!size) {
      res.status(400).json({ success: false, error: "Empty file(s)" });
      deleteFile(path);
    } else if (size > limit) {
      res.status(400).json({ success: false, error: `Total size must not exceed ${limitMB}MB` });
      deleteFile(path);
    } else next();
  } catch {
    res.status(500).json({ success: false, error: "Uh Oh, Something went wrong!" });
  }
};

export default checksize;
