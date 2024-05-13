import { Router } from "express";
import fetchuser from "../middlewares/fetchuser";
import User from "../models/User";
import useErrorHandler from "../middlewares/useErrorHandler";

const router = Router();

router.get(
  "/all",
  fetchuser(),
  useErrorHandler(async (req, res) => {
    // THIS ROUTE NEEDS TO BE FIXED
    const { id } = req;
    const user = await User.findById(id).populate("journal_ids");
    const journal_ids = user?.journal_ids!;
    const journals = journal_ids.filter((journal) => (journal as any).author_id !== id);
    res.json({ success: true, journals });
  })
);

export default router;
