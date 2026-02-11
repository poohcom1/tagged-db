import { ColumnType } from "./sheets";

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
