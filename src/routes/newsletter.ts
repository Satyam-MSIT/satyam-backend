import { Router } from "express";

import Newsletter from "../models/Newsletter";
import { subscribeSchema, unsubscribeSchema } from "../schemas/newsletter";

const router = Router();

router.post("/subscribe", async (req, res) => {
  try {
    const { name, email } = await subscribeSchema.parseAsync(req.body);
    try {
      await Newsletter.create({ name, email });
      res.json({ success: true, msg: "Successfully subscribed to the Newsletter!" });
    } catch {
      res.status(409).json({ success: false, error: "You are already subscribed to our Newsletter!" });
    }
  } catch {
    res.status(500).json({ success: false, error: "Uh Oh, Something went wrong!" });
  }
});

router.post("/unsubscribe", async (req, res) => {
  try {
    const { email } = await unsubscribeSchema.parseAsync(req.body);
    await Newsletter.findOneAndDelete({ email });
    res.json({ success: true, msg: "Successfully unsubscribed to the Newsletter!" });
  } catch {
    res.status(500).json({ success: false, error: "Uh Oh, Something went wrong!" });
  }
});

export default router;
