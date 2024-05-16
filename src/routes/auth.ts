import { Router } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { generateOTP, retryAsync } from "utility-kit";

import fetchuser from "../middlewares/fetchuser";
import verifyAdmin from "../middlewares/verifyAdmin";
import User from "../models/User";
import Newsletter from "../models/Newsletter";
import { otpExpiry } from "../constants";
import { generateMessage, sendMail } from "../modules/nodemailer";
import { getStorage, removeStorage, setStorage } from "../modules/storage";
import { generateToken, sanitizeUserAgent } from "../modules/token";
import { editSchema, forgotSchema, loginSchema, otpSchema, signupSchema } from "../schemas/auth";
import { upload, uploadCloudinary } from "../modules/upload";
import { deleteFile } from "../modules/file";
import useErrorHandler from "../middlewares/useErrorHandler";

const router = Router();

router.post(
  "/signup",
  fetchuser(false),
  verifyAdmin((req) => !(req.body.type as string)?.startsWith("satyam")),
  useErrorHandler(async (req, res) => {
    const { name, email, password, type, mobile } = await signupSchema.parseAsync(req.body);
    let user = await User.findOne({ email });
    if (user?.confirmed) return res.status(400).json({ success: false, error: "Email already exists" });
    res.json({ success: true, msg: "Satyam account created successfully, please confirm your account via email to proceed!" });

    const secPass = await bcrypt.hash(password, 10);
    await retryAsync(
      async () => {
        if (!user) user = await User.create({ name, email, password: secPass, type, mobile });
        else {
          user.name = name;
          user.password = secPass;
          if (type) user.type = type;
          await user.save();
        }
      },
      { retries: -1 }
    );
    sendMail(generateMessage(user!, "confirm"));
    try {
      if (!type.startsWith("satyam")) await Newsletter.create({ name, email });
    } catch {}
  }, {})
);

router.put(
  "/confirm",
  useErrorHandler(
    async (req, res) => {
      const { id } = jwt.verify(req.headers.token as string, process.env.EMAIL_SECRET) as { id: string };
      try {
        const { confirmed } = (await User.findByIdAndUpdate(id, { confirmed: true }).select("confirmed"))!;
        res.json({ success: true, msg: confirmed ? "User already confirmed!" : "Satyam account successfully confirmed!" });
      } catch {
        res.status(404).json({ success: false, error: "User not found!" });
      }
    },
    { statusCode: 401, error: "Confirmation token expired!" }
  )
);

router.get(
  "/confirm/reset",
  useErrorHandler(
    async (req, res) => {
      const { id } = jwt.verify(req.headers.token as string, process.env.EMAIL_SECRET, { ignoreExpiration: true }) as { id: string };
      const user = await User.findById(id);
      sendMail(generateMessage(user!, "confirm"));
      res.json({ success: true });
    },
    { statusCode: 400, error: "Bad request" }
  )
);

router.post(
  "/login",
  useErrorHandler(async (req, res) => {
    const { body, headers } = req;
    const { dimensions, origin } = headers;
    const { email, password } = await loginSchema.parseAsync(body);
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ success: false, error: "Sorry! Invalid Credentials" });

    const { confirmed, id, name, type, image } = user;

    const pwdCompare = await bcrypt.compare(password, user.password as string);
    if (!pwdCompare) return res.status(400).json({ success: false, error: "Sorry! Invalid Credentials" });

    if (!confirmed) {
      res.status(400).json({ success: false, error: "Please confirm your Satyam account first! To confirm, check your email." });
      return sendMail(generateMessage(user, "confirm"));
    }

    const token = generateToken({ id, dimensions, origin, userAgent: sanitizeUserAgent(headers["user-agent"]!), tokenCreatedAt: Date.now() });
    res.json({ success: true, msg: "Logged in successfully!", email, name, type, image, token });
  })
);

router.put(
  "/edit",
  fetchuser(),
  upload.single("image"),
  useErrorHandler(
    async (req, res) => {
      const { body, id, file } = req;
      const { name, mobile } = await editSchema.parseAsync(body);
      const { filename, path } = file || {};
      const user = (await User.findById(id))!;
      if (name) user.name = name;
      if (mobile) user.mobile = mobile;
      if (file) user.image = await uploadCloudinary(filename!, path!);
      await user.save();
      removeStorage(`user-${id}`);
      await deleteFile(path!);
      res.json({ success: true, msg: "Account updated successfully!" });
    },
    { onError: (_, req) => deleteFile(req.file) }
  )
);

router.delete(
  "/delete",
  fetchuser(),
  useErrorHandler(async (req, res) => {
    const { id } = req;
    await User.findByIdAndDelete(id);
    removeStorage(`user-${id}`);
    res.json({ success: true, msg: "Account deleted successfully!" });
  })
);

router.post(
  "/otp",
  useErrorHandler(async (req, res) => {
    const { email } = await otpSchema.parseAsync(req.body);
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ success: false, error: "Sorry! No user found with this email." });
    const otp = generateOTP(6);
    res.json({ success: true, msg: "OTP sent successfully!" });
    sendMail(generateMessage({ email }, "otp", { otp }), () => {
      setStorage(email, otp);
      setTimeout(() => removeStorage(email), otpExpiry);
    });
  })
);

router.put(
  "/forgot",
  useErrorHandler(async (req, res) => {
    const { email, otp, password } = await forgotSchema.parseAsync(req.body);
    if (otp !== getStorage(email!)) return res.status(400).json({ success: false, error: "Please enter valid OTP!" });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ success: false, error: "Sorry! No user found with this email." });

    const secPass = await bcrypt.hash(password, 10);
    await User.findOneAndUpdate({ email }, { password: secPass, lastPasswordModifiedAt: Date.now(), confirmed: true });
    removeStorage(email!);
    removeStorage(`user-${user.id}`);
    res.json({ success: true, msg: "Password reset successful!" });
  })
);

router.get(
  "/protect",
  fetchuser(),
  useErrorHandler(async (req, res) => res.json({ success: true, user: req.user }))
);

export default router;
