import Volume, { VolumeType } from "../models/Volume";

export async function getLatestVolume(): Promise<Partial<VolumeType>> {
  return (await Volume.findOne().sort("-number")) || { number: 12 };
}

export function getYear(date?: Date) {
  return (date || new Date()).getFullYear().toString().slice(2);
}
