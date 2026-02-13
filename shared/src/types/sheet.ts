type ColumnId = string;

// Sheets
export interface SheetMeta {
  id: string;
  name: string;
  created: string;
  updated: string;
}

// Sheet
export interface SheetData extends SheetMeta {
  rows: Row[];
  columns: Column[];
  tagCache: Record<ColumnId, string[]>;
}

export type Column = TextColumn | NumberColumn | EnumColumn | TagsColumn;

interface BaseColumn {
  id: string;
  title: string;
  type: ColumnType;
}

interface TextColumn extends BaseColumn {
  type: "text";
}

interface NumberColumn extends BaseColumn {
  type: "number";
  // unused
  min?: number;
  max?: number;
  step?: number;
}

interface EnumColumn extends BaseColumn {
  type: "enum";
  options?: string[];
}

interface TagsColumn extends BaseColumn {
  type: "tags";
}

export type ColumnType = "text" | "number" | "enum" | "tags";

export type ColumnValue = string;

interface Row {
  id: string;
  values: Partial<Record<ColumnId, ColumnValue>>;
}
