import { RequestHandler } from "express";
import { signupSchema } from "../schemas/auth";

const verifyAdmin: RequestHandler = async (req, res, next) => {
  try {
    const data = await signupSchema.parseAsync(req.body);
    req.data = data;
    if (data.type.startsWith("satyam") && req.user!.type !== "satyam-admin") throw new Error("Bad request");
    next();
  } catch {
    res.status(400).json({ success: false, error: "Bad request" });
  }
};

export default verifyAdmin;
