import { Router } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { generateOTP, retryAsync } from "utility-kit";

import fetchuser from "../middlewares/fetchuser";
import verifyAdmin from "../middlewares/verifyAdmin";
import User from "../models/User";
import { otpExpiry } from "../constants";
import { generateMessage, sendMail } from "../modules/nodemailer";
import { getStorage, removeStorage, setStorage } from "../modules/storage";
import { generateToken, sanitizeUserAgent } from "../modules/token";
import { forgotSchema, loginSchema, otpSchema } from "../schemas/auth";

const router = Router();

router.post("/signup", fetchuser(false), verifyAdmin, async (req, res) => {
  try {
    const { name, email, password, type, alternateEmail } = req.data!;
    let user = await User.findOne({ email });
    if (user?.confirmed) return res.status(400).json({ success: false, error: "Email already exists" });
    res.json({ success: true, msg: "Satyam account created successfully, please confirm your account via email to proceed!" });

    const secPass = await bcrypt.hash(password, 10);
    await retryAsync(
      async () => {
        if (!user) user = await User.create({ name, email, password: secPass, type, alternateEmail });
        else {
          user.name = name;
          user.password = secPass;
          if (type) user.type = type;
          await user.save();
        }
      },
      { retries: -1 }
    );
    sendMail(generateMessage(user!));
  } catch {
    res.status(500).json({ success: false, error: "Uh Oh, Something went wrong!" });
  }
});

router.put("/confirm", async (req, res) => {
  try {
    const { id } = jwt.verify(req.headers.token as string, process.env.EMAIL_SECRET) as { id: string };
    try {
      const { confirmed } = (await User.findByIdAndUpdate(id, { confirmed: true }).select("confirmed"))!;
      res.json({ success: true, msg: confirmed ? "User already confirmed!" : "Satyam account successfully confirmed!" });
    } catch {
      res.status(404).json({ success: false, error: "User not found!" });
    }
  } catch {
    res.status(401).json({ success: false, error: "Confirmation token expired!" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { body, headers } = req;
    const { email, password } = await loginSchema.parseAsync(body);
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ success: false, error: "Sorry! Invalid Credentials" });

    const pwdCompare = await bcrypt.compare(password, user.password as string);
    if (!pwdCompare) return res.status(400).json({ success: false, error: "Sorry! Invalid Credentials" });

    if (!user.confirmed) {
      res.status(400).json({ success: false, error: "Please confirm your Satyam account first! To confirm, check your email." });
      return sendMail(generateMessage(user));
    }

    const token = generateToken({ id: user.id, dimensions: headers.dimensions, origin: headers.origin, userAgent: sanitizeUserAgent(headers["user-agent"]!), tokenCreatedAt: Date.now() });
    res.json({ success: true, msg: "Logged in successfully!", name: user.name, type: user.type, token });
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
});

router.delete("/delete", fetchuser(), async (req, res) => {
  try {
    const { id } = req;
    await User.findByIdAndDelete(id);
    removeStorage(`user-${id}`);
    res.json({ success: true, msg: "Account deleted successfully!" });
  } catch {
    res.status(500).json({ success: false, error: "Uh Oh, Something went wrong!" });
  }
});

router.post("/otp", async (req, res) => {
  try {
    const { email } = await otpSchema.parseAsync(req.body);
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ success: false, error: "Sorry! No user found with this email." });
    const otp = generateOTP(6);
    res.json({ success: true, msg: "OTP sent successfully!" });
    sendMail(generateMessage({ email }, "otp", otp), () => {
      setStorage(email, otp);
      setTimeout(() => removeStorage(email), otpExpiry);
    });
  } catch {
    res.status(500).json({ success: false, error: "Uh Oh, Something went wrong!" });
  }
});

router.put("/forgot", async (req, res) => {
  try {
    const { email, otp, password } = await forgotSchema.parseAsync(req.body);
    if (otp !== getStorage(email!)) return res.status(400).json({ success: false, error: "Please enter valid OTP!" });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ success: false, error: "Sorry! No user found with this email." });

    const secPass = await bcrypt.hash(password, 10);
    await User.findOneAndUpdate({ email }, { password: secPass, lastPasswordModifiedAt: Date.now(), confirmed: true });
    removeStorage(email!);
    removeStorage(`user-${user._id}`);
    res.json({ success: true, msg: "Password reset successful!" });
  } catch {
    res.status(500).json({ success: false, error: "Uh Oh, Something went wrong!" });
  }
});

router.get("/protect", fetchuser(), async (req, res) => {
  try {
    res.json({ success: true, user: req.user });
  } catch {
    res.status(500).json({ success: false, error: "Uh Oh, Something went wrong!" });
  }
});

export default router;
