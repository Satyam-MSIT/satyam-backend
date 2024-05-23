import { Router } from "express";
import Newsletter from "../models/Newsletter";
import { announcementSchema, subscribeSchema, unsubscribeSchema } from "../schemas/newsletter";
import useErrorHandler from "../middlewares/useErrorHandler";
import { upload, uploadCloudinary } from "../modules/upload";
import { generateMessage, sendMail } from "../modules/nodemailer";
import { File, deleteFiles } from "../modules/file";
import fetchuser from "../middlewares/fetchuser";
import verifyAdmin from "../middlewares/verifyAdmin";
import Announcement from "../models/Announcement";
import { usePromises } from "../modules/promise";

const router = Router();

router.post(
  "/subscribe",
  useErrorHandler(async (req, res) => {
    const { name, email } = await subscribeSchema.parseAsync(req.body);
    try {
      await Newsletter.create({ name, email });
      res.json({ success: true, msg: "Successfully subscribed to the Newsletter!" });
    } catch {
      res.status(409).json({ success: false, error: "You are already subscribed to our Newsletter!" });
    }
  })
);

router.post(
  "/unsubscribe",
  useErrorHandler(async (req, res) => {
    const { email } = await unsubscribeSchema.parseAsync(req.body);
    await Newsletter.findOneAndDelete({ email });
    res.json({ success: true, msg: "Successfully unsubscribed to the Newsletter!" });
  })
);

router.post(
  "/announcement",
  fetchuser(),
  verifyAdmin(),
  upload.array("files"),
  useErrorHandler(
    async (req, res) => {
      const { type, subject, html } = await announcementSchema.parseAsync(req.body);
      const files = (req.files as File[]) || [];
      const links = await usePromises(
        files.map(async ({ filename, path }) => await uploadCloudinary(filename, path)),
        true
      );
      await Announcement.create({ type, subject, description: html, links });
      const email = (await Newsletter.find().select("email")).map(({ email }) => email);
      await sendMail(generateMessage({ email, subject, html, files }));
      res.json({ success: true, msg: "Announcement made successfully!" });
    },
    { log: true, onError: (_, req) => deleteFiles(req) }
  )
);

export default router;
