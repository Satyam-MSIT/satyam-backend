import { Router } from "express";

import { volumeSchema } from "../schemas/volume";
import Volume from "../models/Volume";
import { getLatestVolume } from "../modules/utilities";
import Newsletter from "../models/Newsletter";
import { usePromises } from "../modules/promise";
import { generateMessage, sendMail } from "../modules/nodemailer";

const router = Router();

router.post("/call", async (req, res) => {
  try {
    const { title, description, keywords, acceptanceTill, publishDate, acceptancePing, reviewPing } = await volumeSchema.parseAsync(req.body);
    const volume = await getLatestVolume();
    await Volume.create({ number: volume.number! + 1, title, description, keywords, acceptanceTill, publishDate, acceptancePing, reviewPing });
    const newsletters = await Newsletter.find();
    await usePromises(newsletters.map((user) => sendMail(generateMessage(user, "call"))));
    res.json({ success: true, msg: "Call for papers created successfully!" });
  } catch {
    res.status(500).json({ success: false, error: "Uh Oh, Something went wrong!" });
  }
});

export default router;
