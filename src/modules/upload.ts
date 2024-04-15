import { Storage } from "megajs";
import { createReadStream } from "fs";
import { v2 } from "cloudinary";

const { CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET, CLOUDINARY_CLOUD_NAME, MEGA_EMAIL, MEGA_PASSWORD } = process.env;
let mega: Storage;

export const initUpload = async () => {
  // v2.config({ cloud_name: CLOUDINARY_CLOUD_NAME, api_key: CLOUDINARY_API_KEY, api_secret: CLOUDINARY_API_SECRET, secure: true });
  mega = await new Storage({ email: MEGA_EMAIL, password: MEGA_PASSWORD }).ready;
};

export async function uploadCloudinary(name: string, path: string) {
  try {
    const file = await v2.uploader.upload(path, { public_id: name, resource_type: "raw", filename_override: "." });
    return file.secure_url;
  } catch {
    return "";
  }
}

export async function uploadMega(name: string, path: string, size: number) {
  try {
    const file = await mega.upload({ name, size }, createReadStream(path) as any).complete;
    return await file.link(false);
  } catch {
    return "";
  }
}
