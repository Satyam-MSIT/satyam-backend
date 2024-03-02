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
import fetchuser from "../middlewares/fetchuser";

const router = Router();
const upload = multer({ dest: "uploads" });

const { LINK_SECRET, PORT, RENDER_EXTERNAL_URL } = process.env;

const url = RENDER_EXTERNAL_URL || `http://localhost:${PORT}`;

router.use(fetchuser);

router.get("/all", async (req, res) => {
  try {
    const { id } = req;
    const journals = await Journal.find({ user: id });
    res.json({ success: true, journals });
  } catch {
    res.status(500).json({ success: false, error: "Something went wrong! Try again..." });
  }
});

router.post("/add", upload.single("file"), checksize, async (req, res) => {
  const { body, file, id } = req;
  try {
    const { title, description } = await addSchema.parseAsync(body);
    const { originalname, filename, path, size } = file!;

    let link = sign(`${url}/file/download/${filename}`, LINK_SECRET);
    const journal = await Journal.create({ user: id, title, description, link, name: originalname, filename, size });
    res.json({ success: true, id: journal._id, name: originalname, msg: "Journal uploaded successfully!" });
    do {
      link = await uploadMega(filename, path, size);
    } while (!link);
    usePromises([journal.updateOne({ link: sign(link, LINK_SECRET) }), deleteFile(path)]);
  } catch {
    try {
      res.status(500).json({ success: false, error: "Something went wrong! Try again..." });
      deleteFile(file);
    } catch {}
  }
});

router.get("/fetch/:id", async (req, res) => {
  try {
    const { params, id } = req;
    const journal = await Journal.findOne({ _id: params.id, user: id });
    res.json({ success: true, journal });
  } catch {
    res.status(500).json({ success: false, error: "Something went wrong! Try again..." });
  }
});

router.get("/download/:filename", async (req, res) => {
  try {
    res.download(`uploads/${req.params.filename}`);
  } catch {
    res.status(500).json({ success: false, error: "Something went wrong! Try again..." });
  }
});

export default router;
