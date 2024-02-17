import express from "express";
import cors from "cors";
import compression from "compression";
import mongoConnect from "./modules/db";
import authRouter from "./routes/auth";

declare global {
  namespace Express {
    interface Request {
      id?: string;
    }
  }
}

const app = express();
const { CORS, PORT } = process.env;

app.use(cors({ origin: [CORS!], maxAge: 600, methods: ["GET", "POST", "PUT", "DELETE"] }));
app.use(express.json());
app.use(compression());

app.get("/", (_, res) => {
  res.send("Hello World!");
});
app.use("/auth", authRouter);

app.listen(PORT, () => {
  console.log(`Satyam Backend is running at ${PORT}`);
  mongoConnect();
});
