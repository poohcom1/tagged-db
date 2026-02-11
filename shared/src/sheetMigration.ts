import { Err, Ok, Result } from "./result";
import type { Column, ColumnType, ColumnValue, SheetData } from "./sheets";
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
  EnumUpdate,
}

export type ColumnEditAction =
  | ColumnRenameAction
  | ColumnChangeTypeAction
  | ColumnDeleteAction
  | ColumnEnumUpdateAction;

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

interface ColumnEnumUpdateAction extends BaseColumnAction {
  editType: ColumnEditType.EnumUpdate;
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
    return Err("Column not found. ID: " + columnId);
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
    case ColumnEditType.EnumUpdate:
      if (column.type !== "enum") {
        return Err("Column is not an enum");
      }
      column.options = payload.values;
      break;
  }

  return Ok({ ...sheetData, columns });
}

export function createColumn(
  columnId: string,
  title: string = "Untitled column",
  type: ColumnType = "text",
): Column {
  return { id: columnId, title, type, options: [] };
}

export function addColumn(
  sheetData: SheetData,
  column: Column,
): Result<SheetData> {
  return Ok({
    ...sheetData,
    columns: [...sheetData.columns, column],
  });
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
