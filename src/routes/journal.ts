import { Router } from "express";
import multer from "multer";
import { sign } from "jssign";

import Journal from "../models/Journal";
import checksize from "../middlewares/checksize";
import { uploadMega } from "../modules/upload";
import csrf from "../middlewares/csrf";
import { usePromises } from "../modules/promise";
import { deleteFile } from "../modules/file";
import { addSchema } from "../schemas/journal";

const router = Router();
const upload = multer({ dest: "uploads" });

const { LINK_SECRET, PORT, RENDER_EXTERNAL_URL } = process.env;

const url = RENDER_EXTERNAL_URL || `http://localhost:${PORT}`;

router.post("/add", csrf, upload.single("file"), checksize, async (req, res) => {
  const { body, file, id } = req;
  const { originalname, filename, path, size } = file!;
  try {
    const { title, description } = await addSchema.parseAsync(body);

    let link = sign(`${url}/file/download/${filename}`, LINK_SECRET);
    const journal = await Journal.create({ user: id, title, description, link, name: originalname, filename, size });
    res.json({ success: true, id: journal._id, name: originalname, msg: "Journal uploaded successfully!" });
    do {
      link = await uploadMega(filename, path, size);
    } while (!link);
    usePromises([journal.updateOne({ link: sign(link, LINK_SECRET) }), deleteFile(path)]);
  } catch {
    try {
      res.status(500).json({ success: false, error: "Uh Oh, Something went wrong!" });
      deleteFile(path);
    } catch {}
  }
});

router.get("/download/:id", async (req, res) => {
  try {
    res.download(`uploads/${req.params.id}`);
  } catch {
    res.status(500).json({ success: false, error: "Something went wrong! Try again..." });
  }
});

export default router;
