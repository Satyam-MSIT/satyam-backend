import { unlink } from "fs";
import { promisify } from "util";

const unlinkAsync = promisify(unlink);

export async function deleteFile(path: string) {
  try {
    await unlinkAsync(path);
  } catch {}
}
