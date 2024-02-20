import { Storage } from "megajs";
import { createReadStream } from "fs";

const { MEGA_EMAIL, MEGA_PASSWORD } = process.env;
let mega: Storage;

export const initUpload = async () => (mega = await new Storage({ email: MEGA_EMAIL, password: MEGA_PASSWORD }).ready);

export async function uploadMega(name: string, path: string, size: number) {
  try {
    const file = await mega.upload({ name, size }, createReadStream(path) as any).complete;
    return await file.link(false);
  } catch {
    return "";
  }
}
