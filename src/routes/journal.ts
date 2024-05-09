import { Router } from "express";
import { sign } from "jssign";

import Journal, { JournalType } from "../models/Journal";
import checksize from "../middlewares/checksize";
import { deleteMega, upload, uploadCloudinary, uploadMega } from "../modules/upload";
import { File, deleteFile, deleteFiles, getFiles } from "../modules/file";
import fetchuser from "../middlewares/fetchuser";
import { draftSchema, finalSchema, submitSchema } from "../schemas/journal";
import { getLatestVolume, getYear, numToString } from "../modules/utilities";
import useErrorHandler from "../middlewares/useErrorHandler";

let currentYear: string, currentVolume: string;

const router = Router();

const { LINK_SECRET } = process.env;

export async function initVolume() {
  const { createdAt, number } = await getLatestVolume();
  currentYear = getYear(createdAt);
  currentVolume = numToString(number!, 2);
}

router.use(fetchuser());

router.get(
  "/all",
  useErrorHandler(async (req, res) => {
    const { id } = req;
    const journals = await Journal.find({ author_id: id });
    res.json({ success: true, journals });
  })
);

router.get(
  "/draft/:id",
  useErrorHandler(
    async (req, res) => {
      const { id, params } = req;
      const { versions, ...journal } = (await Journal.findOne({ author_id: id, journal_id: params.id }))!;
      const { name, link } = versions[0] || {};
      res.json({ success: true, journal: { ...journal, file: { name, link } } });
    },
    { statusCode: 404, error: "Journal draft doesn't exist" }
  )
);

router.post(
  "/draft",
  upload.single("pdf"),
  checksize(false),
  useErrorHandler(
    async (req, res) => {
      const { body, file, id, user } = req;
      const { journal_id, title, abstract, uploadFile, keywords, reviewers } = await draftSchema.parseAsync(body);
      if (uploadFile === "new") {
        var { originalname, filename, path } = file!;
        var link = sign(await uploadCloudinary(filename, path), LINK_SECRET);
      }

      let journal = await Journal.findOne({ journal_id, author_id: id });
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
    },
    { onError: (_, req) => deleteFile(req.file) }
  )
);

router.post(
  "/submit",
  upload.single("pdf"),
  checksize,
  useErrorHandler(
    async (req, res) => {
      const { body, file, id, user } = req;
      const { journal_id, title, abstract, keywords, reviewers } = await submitSchema.parseAsync(body);
      const { originalname, filename, path } = file!;
      const link = sign(await uploadCloudinary(filename, path), LINK_SECRET);

      let journal = await Journal.findOne({ journal_id, author_id: id });
      const count = await Journal.countDocuments({ journal_id: { $regex: `^${currentYear}${currentVolume}` } });
      const newJournalId = currentYear + numToString(+currentVolume, 3) + numToString(count);
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
    },
    { onError: (_, req) => deleteFile(req.file) }
  )
);

router.get(
  "/fetch/:id",
  useErrorHandler(async (req, res) => {
    const { params, id } = req;
    const journal = await Journal.findOne({ journal_id: params.id, author_id: id });
    res.json({ success: true, journal });
  })
);

router.post(
  "/final",
  upload.fields([
    { name: "copyright", maxCount: 1 },
    { name: "printversion", maxCount: 1 },
  ]),
  checksize,
  useErrorHandler(
    async (req, res) => {
      const { body, files, id } = req;
      const { journal_id } = await finalSchema.parseAsync(body);
      let { copyright, printversion } = files! as { copyright: File[]; printversion: File[] };
      const copyrightFile = copyright[0]!;
      const printversionFile = printversion[0]!;
      const copyrightLink = sign(await uploadCloudinary(copyrightFile.filename, copyrightFile.path), LINK_SECRET);
      const printversionLink = sign(await uploadCloudinary(printversionFile.filename, printversionFile.path), LINK_SECRET);
      await Journal.findOneAndUpdate({ journal_id, author_id: id }, { copyright: copyrightLink, print_version: printversionLink });
      await deleteFiles(req);
      res.json({ success: true, msg: "Files submitted successfully!" });
    },
    { onError: (_, req) => deleteFiles(getFiles(req)) }
  )
);

router.get(
  "/download/:filename",
  useErrorHandler(async (req, res) => res.download(`uploads/${req.params.filename}`))
);

export default router;
