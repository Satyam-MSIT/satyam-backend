export async function usePromises<T>(promises: Promise<T>[]) {
  try {
    const data = await Promise.allSettled(promises);
    return data.map((result) => (result.status === "fulfilled" ? result.value : undefined));
  } catch {}
}
