import { Err, Ok, Result } from "@app/shared/result";
import { ColumnEditAction } from "@app/shared/sheetMigration";
import { SheetMeta, SheetData, ColumnType } from "@app/shared/sheets";
import { StorageBackend } from "./storageBackend";
import * as migrator from "@app/shared/sheetMigration";

const KEY_INDEX = "tagged_db.index";
const KEY_SHEET = (sheetId: string) => `tagged_db.sheet.${sheetId}`;

const getIndex = (): SheetMeta[] =>
  JSON.parse(localStorage.getItem(KEY_INDEX) || "[]");
const setIndex = (index: SheetMeta[]) =>
  localStorage.setItem(KEY_INDEX, JSON.stringify(index));

const getSheet = (sheetId: string): SheetData | undefined =>
  JSON.parse(localStorage.getItem(KEY_SHEET(sheetId)) || "{}");
const setSheet = (sheetId: string, sheet: SheetData) =>
  localStorage.setItem(KEY_SHEET(sheetId), JSON.stringify(sheet));

export const localStorageBackend: StorageBackend = {
  getSheets: async (): Promise<Result<SheetMeta[]>> => {
    const index = getIndex();
    return Ok(index);
  },
  renameSheet: function (id: string, title: string): Promise<Result<void>> {
    const index = getIndex();
    const sheet = index.find((s) => s.id === id);
    if (!sheet) {
      return Promise.resolve(Err("Sheet not found"));
    }
    sheet.name = title;
    setIndex(index);
    return Promise.resolve(Ok());
  },
  deleteSheet: function (id: string): Promise<Result<void>> {
    const index = getIndex();
    const sheet = index.find((s) => s.id === id);
    if (!sheet) {
      return Promise.resolve(Err("Sheet not found"));
    }
    index.splice(index.indexOf(sheet), 1);
    setIndex(index);
    return Promise.resolve(Ok());
  },
  createSheet: function (title: string): Promise<Result<SheetMeta>> {
    const index = getIndex();
    const uuid = crypto.randomUUID();
    const sheet = migrator.createSheet(uuid, title);
    index.push(sheet);
    setIndex(index);
    return Promise.resolve(Ok(sheet));
  },
  getSheet: function (sheetId: string): Promise<Result<SheetData>> {
    throw new Error("Function not implemented.");
  },
  updateCell: function (
    sheetId: string,
    rowId: string,
    columnId: string,
    value: string,
  ): Promise<Result<void>> {
    throw new Error("Function not implemented.");
  },
  createColumn: function (
    sheetId: string,
    columnId: string,
    columnTitle: string,
    columnType: ColumnType,
  ): Promise<Result<void>> {
    throw new Error("Function not implemented.");
  },
  updateColumnBatched: function (
    sheetId: string,
    columnId: string,
    payloads: ColumnEditAction[],
  ): Promise<Result<void>> {
    throw new Error("Function not implemented.");
  },
};
