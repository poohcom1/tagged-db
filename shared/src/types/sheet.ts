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

export type ColumnType = "text" | "number" | "enum" | "tags" | "date";

export type ColumnValue = string;

export type Column =
  | TextColumn
  | NumberColumn
  | EnumColumn
  | TagsColumn
  | DateColumn;

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

interface DateColumn extends BaseColumn {
  type: "date";
}

interface Row {
  id: string;
  values: Partial<Record<ColumnId, ColumnValue>>;
}
