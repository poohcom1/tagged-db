export function errorToString(e: unknown): string {
  if (typeof e === "string") {
    return e;
  }

  if (e instanceof Error) {
    return e.message;
  }

  if (e && typeof e === "object") {
    // Common case: custom frameworks throwing plain objects
    if ("message" in e && typeof (e as any).message === "string") {
      return (e as any).message;
    }

    try {
      return JSON.stringify(e);
    } catch {
      return "[Unserializable error object]";
    }
  }

  return String(e);
}
