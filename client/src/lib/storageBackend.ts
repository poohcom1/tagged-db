import { Result } from "@app/shared/result";
import { ColumnEditAction } from "@app/shared/sheetMigration";
import { ColumnType, SheetData, SheetMeta } from "@app/shared/sheets";
import { localStorageBackend } from "./localStorageBackend";
import { apiBackend } from "./apiBackend";

export interface StorageBackend {
  getSheets(): Promise<Result<SheetMeta[]>>;
  renameSheet(id: string, title: string): Promise<Result<void>>;
  deleteSheet(id: string): Promise<Result<void>>;
  createSheet(title: string): Promise<Result<SheetMeta>>;

  getSheet(sheetId: string): Promise<Result<SheetData>>;
  createRow(sheetId: string, rowId: string): Promise<Result<void>>;
  updateCell(
    sheetId: string,
    rowId: string,
    columnId: string,
    value: string,
  ): Promise<Result<void>>;
  createColumn(
    sheetId: string,
    columnId: string,
    columnTitle: string,
    columnType: ColumnType,
  ): Promise<Result<void>>;
  updateColumnBatched(
    sheetId: string,
    columnId: string,
    payloads: ColumnEditAction[],
  ): Promise<Result<void>>;
}

console.log(
  "Running with storage backend: " + import.meta.env.VITE_STORAGE_BACKEND,
);
export const storageBackend =
  import.meta.env.VITE_STORAGE_BACKEND === "server"
    ? apiBackend
    : localStorageBackend;
