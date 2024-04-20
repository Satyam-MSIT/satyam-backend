import { Router } from "express";

import fetchuser from "../middlewares/fetchuser";
import verifyAdmin from "../middlewares/verifyAdmin";
import User from "../models/User";

const router = Router();

router.get("/team", fetchuser(), verifyAdmin(), async (_, res) => {
  try {
    const users = await User.find({ type: { $regex: "^satyam" } });
    res.json({ success: true, users });
  } catch {
    res.status(500).json({ success: false, error: "Uh Oh, Something went wrong!" });
  }
});

export default router;
