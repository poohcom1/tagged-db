import { Err, Ok, Result } from "./types/result";
import { ColumnType } from "./types/sheet";

export function validateType(type: string): type is ColumnType {
  return ["text", "number", "enum", "tags"].includes(type);
}

export function parseTags(input: string): string[] {
  if (input === "") {
    return [];
  }

  var arr = input
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);

  return [...new Set(arr)];
}

export function cleanTagText(text: string) {
  const tags = parseTags(text);
  return tags.join(", ");
}

export function validateOptionsReorder(optionsA: string[], optionsB: string[]) {
  return (
    optionsA.length === optionsB.length &&
    optionsA.every((o, i) => o === optionsB[i])
  );
}

export function validateEnums(options: string[]): Result<void> {
  // check all unique
  const unique = new Set(options);
  if (unique.size !== options.length) {
    return Err("Options must be unique.");
  }
  if (options.some((o) => o === "")) {
    return Err("Options cannot be empty strings.");
  }
  return Ok();
}

const DEFAULT_TEXT = "Option #";
export function addDefaultEnum(options: string[]): string[] {
  return [...options, createDefaultEnum(options)];
}

export function createDefaultEnum(options: string[]): string {
  let i = 1;
  while (options.includes(DEFAULT_TEXT + i)) {
    i += 1;
  }
  return DEFAULT_TEXT + i;
}
