type ColumnId = string;
export const NAME_COLUMN_ID = "__name";

// Sheets
export interface Sheet {
  id: string;
  name: string;
}

// Sheet
export interface SheetData {
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
  min?: number;
  max?: number;
  step?: number;
}

interface EnumColumn extends BaseColumn {
  type: "enum";
  options: string[];
}

interface TagsColumn extends BaseColumn {
  type: "tags";
}

export type ColumnType = "text" | "number" | "enum" | "tags";

export type ColumnValue = string | number | string[];

export type ColumnTypeMap = {
  text: string;
  number: number;
  enum: string;
  tags: string[];
};

interface Row {
  id: string;
  name: string;
  values: Record<ColumnId, ColumnValue>;
}
