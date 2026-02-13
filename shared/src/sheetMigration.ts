import { Err, Ok, Result } from "./result";
import type { Column, ColumnType, ColumnValue, SheetData } from "./sheets";
import {
  parseTags,
  validateOptionsReorder,
  validateType,
} from "./sheetValidation";

export function updateTimestamp(sheetData: SheetData): SheetData {
  return { ...sheetData, updated: new Date().toISOString() };
}

// Sheets
export function createSheet(id: string, name: string): SheetData {
  return {
    id,
    name,
    created: new Date().toISOString(),
    updated: new Date().toISOString(),
    columns: [],
    rows: [],
    tagCache: {},
  };
}

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
  Reorder,
}

export type ColumnEditAction =
  | ColumnRenameAction
  | ColumnChangeTypeAction
  | ColumnDeleteAction
  | ColumnEnumUpdateAction
  | ColumnReorderAction;

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

  // ID = original values
  idOrder: string[];
  idToNames: Record<string, string>;
}

interface ColumnReorderAction extends BaseColumnAction {
  editType: ColumnEditType.Reorder;
  toIndex: number;
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
            const toNum = Number(row.values[columnId]);

            row.values[columnId] = Number.isNaN(toNum) ? "" : String(toNum);
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

      const { idOrder, idToNames } = payload;
      const updatedOptions = idOrder
        .map((id) => idToNames[id])
        .filter(Boolean) as string[];

      // Refactor rows
      for (const row of sheetData.rows) {
        const value = row.values[columnId];
        if (!value) {
          continue;
        }
        if (value in idToNames) {
          row.values[columnId] = idToNames[value];
        }
      }

      column.options = updatedOptions;
      break;
    case ColumnEditType.Reorder:
      if (payload.toIndex < 0 || payload.toIndex >= columns.length) {
        return Err("Invalid index: " + payload.toIndex);
      }

      columns.splice(columns.indexOf(column), 1);
      columns.splice(payload.toIndex, 0, column);
      break;
  }
  console.log(columns);

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

// Row
export function addRow(
  sheetData: SheetData,
  id: string,
): Result<SheetData["rows"]> {
  return Ok([...sheetData.rows, { id, values: {} }]);
}

export function deleteRow(
  sheetData: SheetData,
  id: string,
): Result<SheetData["rows"]> {
  return Ok(sheetData.rows.filter((row) => row.id !== id));
}

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
