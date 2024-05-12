import { Router } from "express";

import { volumeSchema } from "../schemas/volume";
import Volume from "../models/Volume";
import Journal from "../models/Journal";
import Newsletter from "../models/Newsletter";
import { generateMessage, sendMail } from "../modules/nodemailer";
import useErrorHandler from "../middlewares/useErrorHandler";
import verifyAdmin from "../middlewares/verifyAdmin";
import fetchuser from "../middlewares/fetchuser";

const router = Router();

router.get(
  "/all",
  useErrorHandler(async (_, res) => {
    const volumes = await Volume.find();
    res.json({ success: true, volumes });
  })
);

router.get(
  "/latest",
  useErrorHandler(async (_, res) => {
    const volume = (await Volume.findOne().sort("-number"))!;
    const journals = await Journal.find({ journal_id: { $regex: `^\d{2}${volume.number}` } });
    res.json({ success: true, volume, journals });
  })
);

router.post(
  "/call",
  fetchuser(),
  verifyAdmin(),
  useErrorHandler(async (req, res) => {
    let { number, title, description, keywords, acceptanceTill, publishDate, acceptancePing, reviewPing, subject, html } = await volumeSchema.parseAsync(req.body);
    await Volume.create({ number, title, description, keywords, acceptanceTill, publishDate, acceptancePing, reviewPing });
    const email = (await Newsletter.find().select("email")).map(({ email }) => email);
    await sendMail(generateMessage({ email, subject, html }));
    res.json({ success: true, msg: "Call for papers created successfully!" });
  })
);

export default router;
