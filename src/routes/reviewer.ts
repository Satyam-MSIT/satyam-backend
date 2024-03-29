import { Router } from "express";
import fetchuser from "../middlewares/fetchuser";
import User from "../models/User";

const router = Router();

router.get("/all", fetchuser, async (req, res) => {
  try {
    const { id } = req;
    const user = await User.findById(id).populate("journal_ids");
    const journal_ids = user?.journal_ids as any;
    const journals = journal_ids.filter((journal: any) => journal.author_id !== id);
    res.json({ success: true, journals });
  } catch {
    res.status(500).json({ success: false, error: "Uh Oh, Something went wrong!" });
  }
});

export default router;
