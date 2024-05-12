import { Router } from "express";

import fetchuser from "../middlewares/fetchuser";
import verifyAdmin from "../middlewares/verifyAdmin";
import User from "../models/User";
import { editSchema, emailSchema } from "../schemas/satyam";
import { removeStorage } from "../modules/storage";
import useErrorHandler from "../middlewares/useErrorHandler";
import { deleteFiles } from "../modules/file";
import { upload } from "../modules/upload";
import { generateMessage, sendMail } from "../modules/nodemailer";
import Newsletter from "../models/Newsletter";

const router = Router();

router.use(fetchuser());
router.use(verifyAdmin());

router.get(
  "/team",
  useErrorHandler(async (_, res) => {
    const users = await User.find({ type: { $regex: "^satyam" } });
    res.json({ success: true, users });
  })
);

router.get(
  "/user/:id",
  useErrorHandler(
    async (req, res) => {
      const user = await User.findById(req.params.id);
      res.json({ success: true, user });
    },
    { statusCode: 404, error: "User not found!" }
  )
);

router.put(
  "/user/:id",
  useErrorHandler(
    async (req, res) => {
      const {
        body,
        params: { id },
      } = req;
      const { name, type, active } = await editSchema.parseAsync(body);
      const user = (await User.findById(id))!;
      if (name) user.name = name;
      if (type) user.type = type;
      if (active) user.active = active;
      removeStorage(`user-${id}`);
      res.json({ success: true, user });
    },
    { statusCode: 404, error: "User not found!" }
  )
);

router.delete(
  "/user/:id",
  useErrorHandler(
    async (req, res) => {
      const { id } = req.params;
      await User.findByIdAndDelete(id);
      removeStorage(`user-${id}`);
      res.json({ success: true, msg: "User deleted successfully!" });
    },
    { statusCode: 404, error: "User not found!" }
  )
);

router.post(
  "/email",
  upload.array("files"),
  useErrorHandler(
    async (req, res) => {
      const { subject, html } = await emailSchema.parseAsync(req.body);
      const email = (await Newsletter.find().select("email")).map(({ email }) => email);
      await sendMail(generateMessage({ email, subject, html }));
      res.json({ success: true, msg: "Mails sent successfully!" });
    },
    {
      onError: (_, req) => deleteFiles(req),
    }
  )
);

export default router;
