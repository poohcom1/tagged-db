import { Err, Ok, Result } from "./result";
import type { ColumnType, ColumnValue, SheetData } from "./sheets";
import {
  parseTags,
  validateOptionsReorder,
  validateType,
} from "./sheetValidation";

// Sheet
export function updateTagCache(sheetData: SheetData): SheetData["tagCache"] {
  const tagCache: SheetData["tagCache"] = {};

  for (const column of sheetData.columns) {
    if (column.type !== "tags") {
      continue;
    }

    for (const row of sheetData.rows) {
      tagCache[column.id] = (tagCache[column.id] || []).concat(
        parseTags(row.values[column.id] ?? ""),
      );
    }
  }

  for (const columnId in tagCache) {
    tagCache[columnId] = Array.from(new Set(tagCache[columnId]));
  }

  return tagCache;
}

// Column

export enum ColumnEditType {
  Rename,
  ChangeType,
  Delete,
  EnumAdd,
  EnumRemove,
  EnumRename,
  EnumReorder,
}

export type ColumnEditAction =
  | ColumnRenameAction
  | ColumnChangeTypeAction
  | ColumnDeleteAction
  | ColumnEnumAdd
  | ColumnEnumRemove
  | ColumnEnumRename
  | ColumnEnumReorder;

interface BaseColumnAction {
  editType: ColumnEditType;
}

interface ColumnRenameAction extends BaseColumnAction {
  editType: ColumnEditType.Rename;
  title: string;
}

interface ColumnChangeTypeAction extends BaseColumnAction {
  editType: ColumnEditType.ChangeType;
  toType: ColumnType;
}

interface ColumnDeleteAction extends BaseColumnAction {
  editType: ColumnEditType.Delete;
}

interface ColumnEnumAdd extends BaseColumnAction {
  editType: ColumnEditType.EnumAdd;
  value: string;
}

interface ColumnEnumRemove extends BaseColumnAction {
  editType: ColumnEditType.EnumRemove;
  value: string;
}

interface ColumnEnumRename extends BaseColumnAction {
  editType: ColumnEditType.EnumRename;
  value: string;
  newValue: string;
}

interface ColumnEnumReorder extends BaseColumnAction {
  editType: ColumnEditType.EnumReorder;
  values: string[];
}

export function updateColumn(
  sheetData: SheetData,
  columnId: string,
  payload: ColumnEditAction,
): Result<SheetData> {
  const columns = sheetData.columns;

  const column = columns.find((column) => column.id === columnId);
  if (!column) {
    return Err("Column not found");
  }

  switch (payload.editType) {
    case ColumnEditType.Rename:
      column.title = payload.title;
      break;
    case ColumnEditType.ChangeType:
      if (!validateType(payload.toType)) {
        return Err("Invalid type: " + payload.toType);
      }

      column.type = payload.toType;

      switch (column.type) {
        case "text":
          break;
        case "number":
          for (const row of sheetData.rows) {
            row.values[columnId] = String(Number(row.values[columnId]));
          }
          break;
        case "tags":
          for (const row of sheetData.rows) {
            row.values[columnId] = "";
          }
          break;
      }
      break;
    case ColumnEditType.Delete:
      columns.splice(columns.indexOf(column), 1);
      break;
    case ColumnEditType.EnumAdd:
      if (column.type !== "enum") {
        return Err("Column is not an enum");
      }

      column.options?.push(payload.value);
      break;
    case ColumnEditType.EnumRemove:
      if (column.type !== "enum") {
        return Err("Column is not an enum");
      }
      column.options ??= [];
      column.options = column.options.filter(
        (value) => value !== payload.value,
      );
      break;
    case ColumnEditType.EnumRename:
      if (column.type !== "enum") {
        return Err("Column is not an enum");
      }
      column.options ??= [];
      const index = column.options.indexOf(payload.value);
      if (index === -1) {
        return Err("Value not found");
      }
      column.options[index] = payload.newValue;
      break;
    case ColumnEditType.EnumReorder:
      if (column.type !== "enum") {
        return Err("Column is not an enum");
      }
      if (validateOptionsReorder(payload.values, column.options ?? [])) {
        return Err("Invalid reorder");
      }
      column.options ??= [];
      column.options = payload.values;
      break;
  }

  return Ok({ ...sheetData, columns });
}

// Column - dropdown

// Cell
export function updateCell(
  sheetData: SheetData,
  rowId: string,
  columnId: string,
  value: ColumnValue,
): Result<SheetData["rows"]> {
  const rows = sheetData.rows;
  const row = rows.find((row) => row.id === rowId);
  if (!row) {
    return Err("Row not found");
  }
  row.values[columnId] = value;
  return Ok(rows);
}
