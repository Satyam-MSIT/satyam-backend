import { Router } from "express";

import { volumeSchema } from "../schemas/volume";
import Volume from "../models/Volume";
import Journal from "../models/Journal";
import { getLatestVolume } from "../modules/utilities";
import Newsletter from "../models/Newsletter";
import { usePromises } from "../modules/promise";
import { generateMessage, sendMail } from "../modules/nodemailer";

const router = Router();

router.get("/all", async (req, res) => {
  try {
    const volumes = await Volume.find();
    res.json({ success: true, volumes });
  } catch {
    res.status(500).json({ success: false, error: "Uh Oh, Something went wrong!" });
  }
});

router.get("/latest", async (_, res) => {
  try {
    const { number, title, description, keywords } = (await Volume.findOne().sort("-number"))!;
    const journals = await Journal.find({ journal_id: { $regex: `^\d{2}${number}` } });
    res.json({ success: true, title, description, keywords, journals });
  } catch {
    res.status(500).json({ success: false, error: "Uh Oh, Something went wrong!" });
  }
});

router.post("/call", async (req, res) => {
  try {
    let { number, title, description, keywords, acceptanceTill, publishDate, acceptancePing, reviewPing } = await volumeSchema.parseAsync(req.body);
    if (!number) {
      const volume = await getLatestVolume();
      number = volume.number! + 1;
    }
    await Volume.create({ number, title, description, keywords, acceptanceTill, publishDate, acceptancePing, reviewPing });
    const newsletters = await Newsletter.find();
    await usePromises(newsletters.map((user) => sendMail(generateMessage(user, "call"))));
    res.json({ success: true, msg: "Call for papers created successfully!" });
  } catch {
    res.status(500).json({ success: false, error: "Uh Oh, Something went wrong!" });
  }
});

export default router;
