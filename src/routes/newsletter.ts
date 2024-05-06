import { Router } from "express";

import Newsletter from "../models/Newsletter";
import { subscribeSchema, unsubscribeSchema } from "../schemas/newsletter";
import useErrorHandler from "../middlewares/useErrorHandler";

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

export default router;
