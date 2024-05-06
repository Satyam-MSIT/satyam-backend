import { Request } from "express";
import { unlink } from "fs";
import { promisify } from "util";

export type File = Express.Multer.File;

const unlinkAsync = promisify(unlink);

export function deleteFile(path: string): Promise<void>;
export function deleteFile(file?: File): Promise<void>;
export async function deleteFile(file?: string | File) {
  try {
    if (typeof file === "string") await unlinkAsync(file);
    else await unlinkAsync(file!.path);
  } catch {}
}

export function deleteFiles(files: File[]): Promise<void>;
export function deleteFiles(req: Request): Promise<void>;
export async function deleteFiles(req: File[] | Request) {
  const files = Array.isArray(req) ? req : getFiles(req);
  for (const file of files) await deleteFile(file);
}

export function getFiles(req: Request) {
  const { file, files } = req;
  return file ? [file] : !files ? [] : Array.isArray(files) ? files : Object.values(files).flat();
}
