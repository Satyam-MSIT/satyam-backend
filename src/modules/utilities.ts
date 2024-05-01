import Volume, { VolumeType } from "../models/Volume";

export async function getLatestVolume(): Promise<Partial<VolumeType>> {
  return (await Volume.findOne().sort("-number"))!;
}

export function getYear(date?: Date) {
  return (date || new Date()).getFullYear().toString().slice(2);
}

export function numToString(number: number, n: number = 4) {
  let result = number.toString();
  const length = result.length;
  if (length < n) result = "0".repeat(n - length) + result;
  return result;
}
