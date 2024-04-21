import { Router } from "express";

import fetchuser from "../middlewares/fetchuser";
import verifyAdmin from "../middlewares/verifyAdmin";
import User from "../models/User";
import { editSchema } from "../schemas/satyam";
import { removeStorage } from "../modules/storage";

const router = Router();

router.use(fetchuser());
router.use(verifyAdmin());

router.get("/team", async (_, res) => {
  try {
    const users = await User.find({ type: { $regex: "^satyam" } });
    res.json({ success: true, users });
  } catch {
    res.status(500).json({ success: false, error: "Uh Oh, Something went wrong!" });
  }
});

router.get("/user/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    res.json({ success: true, user });
  } catch {
    res.status(404).json({ success: false, error: "User not found!" });
  }
});

router.put("/user/:id", async (req, res) => {
  try {
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
  } catch {
    res.status(404).json({ success: false, error: "User not found!" });
  }
});

router.delete("/user/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await User.findByIdAndDelete(id);
    removeStorage(`user-${id}`);
    res.json({ success: true, msg: "User deleted successfully!" });
  } catch {
    res.status(404).json({ success: false, error: "User not found!" });
  }
});

export default router;
