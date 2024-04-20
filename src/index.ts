import express from "express";
import cors from "cors";
import compression from "compression";

import mongoConnect from "./modules/db";
import authRouter from "./routes/auth";
import journalRouter, { initVolume } from "./routes/journal";
import volumeRouter from "./routes/volume";
import newsletterRouter from "./routes/newsletter";

const app = express();
const { PORT } = process.env;

app.enable("trust proxy");

app.get("/", (_, res) => res.send("Satyam backend is running!"));

app.use(cors());
app.use(express.json());
app.use(compression());

app.use("/auth", authRouter);
app.use("/journal", journalRouter);
app.use("/volume", volumeRouter);
app.use("/newsletter", newsletterRouter);

app.listen(PORT, async () => {
  console.log(`Satyam Backend is running at ${PORT}`);
  await mongoConnect();
  initVolume();
});

process.on("uncaughtException", (err) => {
  console.log("Uncaught exception:", err);
  process.exitCode = 0;
});

process.on("unhandledRejection", (err) => {
  console.log("Unhandled rejection:", err);
  process.exitCode = 0;
});
