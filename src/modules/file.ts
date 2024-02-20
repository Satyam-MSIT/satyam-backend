import { unlink } from "fs";
import { promisify } from "util";

type File = Express.Multer.File | undefined;

const unlinkAsync = promisify(unlink);

export function deleteFile(path: string): Promise<void>;
export function deleteFile(file: File): Promise<void>;
export async function deleteFile(file: unknown) {
  try {
    if (typeof file === "string") await unlinkAsync(file);
    else await unlinkAsync((file as File)!.path);
  } catch {}
}
