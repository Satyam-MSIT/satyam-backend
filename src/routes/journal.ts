import { Router } from "express";
import { sign } from "jssign";

import Journal, { JournalType } from "../models/Journal";
import checksize from "../middlewares/checksize";
import { deleteMega, upload, uploadMega } from "../modules/upload";
import { deleteFile } from "../modules/file";
import fetchuser from "../middlewares/fetchuser";
import { draftSchema, submitSchema } from "../schemas/journal";
import { getLatestVolume, getYear, numToString } from "../modules/utilities";

let currentYear: string, currentVolume: string;

const router = Router();

const { LINK_SECRET } = process.env;

export async function initVolume() {
  const { createdAt, number } = await getLatestVolume();
  currentYear = getYear(createdAt);
  currentVolume = numToString(number!);
}

router.use(fetchuser());

router.get("/all", async (req, res) => {
  try {
    const { id } = req;
    const journals = await Journal.find({ author_id: id });
    res.json({ success: true, journals });
  } catch {
    res.status(500).json({ success: false, error: "Something went wrong! Try again..." });
  }
});

router.get("/draft/:id", async (req, res) => {
  try {
    const { id, params } = req;
    const { versions, ...journal } = (await Journal.findOne({ author_id: id, journal_id: params.id }))!;
    const { name, link } = versions[0] || {};
    res.json({ success: true, journal: { ...journal, file: { name, link } } });
  } catch {
    res.status(404).json({ success: false, error: "Journal draft doesn't exist" });
  }
});

router.post("/draft", upload.single("pdf"), checksize, async (req, res) => {
  const { body, file, id, user } = req;
  try {
    const { journal_id, title, abstract, uploadFile, keywords, reviewers } = await draftSchema.parseAsync(body);
    if (uploadFile === "new") {
      var { originalname, filename, path, size } = file!;
      var link = sign(await uploadMega(filename, path, size), LINK_SECRET);
    }

    let journal = await Journal.findOne({ journal_id });
    if (!journal) {
      journal = await Journal.create({
        journal_id: "Draft" + Date.now(),
        author_id: id,
        author_name: user!.name,
        title,
        abstract,
        keywords,
        reviewers,
        versions: uploadFile === "new" ? [{ link: link!, name: originalname!, filename: filename! }] : [],
      });
    } else {
      const updatedJournal: Partial<JournalType> = {};
      updatedJournal.title = title;
      updatedJournal.abstract = abstract;
      updatedJournal.keywords = keywords;
      updatedJournal.reviewers = reviewers as any;
      if (uploadFile !== "keep") {
        const file = journal.versions[0];
        if (file) await deleteMega(file.name);
        if (uploadFile === "new") updatedJournal.versions = [{ link: link!, name: originalname!, filename: filename! }] as any;
        else updatedJournal.versions = [] as any;
      }
      await journal.updateOne(updatedJournal);
    }
    if (uploadFile === "new") await deleteFile(path!);
    res.json({ success: true, msg: "Journal saved successfully!", journal_id: journal.journal_id });
  } catch {
    res.status(500).json({ success: false, error: "Something went wrong! Try again..." });
    try {
      deleteFile(file);
    } catch {}
  }
});

router.post("/submit", upload.single("pdf"), checksize, async (req, res) => {
  const { body, file, id, user } = req;
  try {
    const { journal_id, title, abstract, keywords, reviewers } = await submitSchema.parseAsync(body);
    const { originalname, filename, path, size } = file!;
    const link = sign(await uploadMega(filename, path, size), LINK_SECRET);

    let journal = await Journal.findOne({ journal_id });
    const count = await Journal.countDocuments({ journal_id: { $regex: `^${currentYear}${currentVolume}` } });
    const newJournalId = currentYear + currentVolume + count;
    if (!journal) {
      journal = await Journal.create({
        journal_id: newJournalId,
        author_id: id,
        author_name: user!.name,
        title,
        abstract,
        keywords,
        reviewers,
        versions: [{ link: link!, name: originalname!, filename: filename! }],
      });
    } else {
      const updatedJournal: Partial<JournalType> = {};
      updatedJournal.journal_id = newJournalId;
      updatedJournal.title = title;
      updatedJournal.abstract = abstract;
      updatedJournal.keywords = keywords;
      updatedJournal.reviewers = reviewers as any;
      const file = journal.versions[0];
      if (file) await deleteMega(file.name);
      updatedJournal.versions = [{ link: link!, name: originalname!, filename: filename! }] as any;
      await journal.updateOne(updatedJournal);
    }
    await deleteFile(path!);
    res.json({ success: true, msg: "Journal submitted successfully!", journal_id: journal.journal_id });
  } catch {
    res.status(500).json({ success: false, error: "Something went wrong! Try again..." });
    try {
      deleteFile(file);
    } catch {}
  }
});

router.get("/fetch/:id", async (req, res) => {
  try {
    const { params, id } = req;
    const journal = await Journal.findOne({ _id: params.id, user: id });
    res.json({ success: true, journal });
  } catch {
    res.status(500).json({ success: false, error: "Something went wrong! Try again..." });
  }
});

router.get("/download/:filename", async (req, res) => {
  try {
    res.download(`uploads/${req.params.filename}`);
  } catch {
    res.status(500).json({ success: false, error: "Something went wrong! Try again..." });
  }
});

export default router;
