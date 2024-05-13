export async function usePromises<T>(promises: Promise<T>[], strict = false) {
  if (strict) return await Promise.all(promises);
  const data = await Promise.allSettled(promises);
  return data.map((result) => (result.status === "fulfilled" ? result.value : undefined));
}
