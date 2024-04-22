import Volume, { VolumeType } from "../models/Volume";

export async function getLatestVolume(): Promise<Partial<VolumeType>> {
  return (await Volume.findOne().sort("-number"))!;
}

export function getYear(date?: Date) {
  return (date || new Date()).getFullYear().toString().slice(2);
}

export function numToString(number: number) {
  return (number < 10 ? "0" : "") + number;
}
