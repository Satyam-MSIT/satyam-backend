import { connect } from "mongoose";

export default async () => {
  await connect(process.env.URI, { retryWrites: true, writeConcern: { w: "majority" } });
  console.log("Connected to Database!");
};
