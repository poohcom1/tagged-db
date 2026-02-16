import { Err, Ok, Result } from "@app/shared/types/result";
import { SheetMeta, SheetData } from "@app/shared/types/sheet";
import { StorageBackend } from "./storageBackend";
import * as migrator from "@app/shared/sheetMigration";
import { LS_KEY_INDEX, LS_KEY_SHEET } from "./constants";

const getIndex = (): SheetMeta[] =>
  JSON.parse(localStorage.getItem(LS_KEY_INDEX) || "[]");
const setIndex = (index: SheetMeta[]) =>
  localStorage.setItem(LS_KEY_INDEX, JSON.stringify(index));

const getSheet = (sheetId: string): SheetData | undefined => {
  const sheet = localStorage.getItem(LS_KEY_SHEET(sheetId));
  return sheet ? JSON.parse(sheet) : undefined;
};
const setSheet = (sheetId: string, sheet: SheetData) =>
  localStorage.setItem(LS_KEY_SHEET(sheetId), JSON.stringify(sheet));
const removeSheet = (sheetId: string) =>
  localStorage.removeItem(LS_KEY_SHEET(sheetId));

export const localStorageBackend: StorageBackend = {
  backendType: "local",
  id: "localStorage",
  queryParam: "",
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
    removeSheet(id);
    return Promise.resolve(Ok());
  },
  createSheet: function (title: string): Promise<Result<SheetMeta>> {
    const index = getIndex();
    const uuid = crypto.randomUUID();
    const sheet = migrator.createSheet(uuid, title);
    index.push(sheet);
    setIndex(index);
    setSheet(uuid, sheet);
    return Promise.resolve(Ok(sheet));
  },
  getSheetData: function (sheetId: string): Promise<Result<SheetData>> {
    const sheet = getSheet(sheetId);
    if (!sheet) {
      return Promise.resolve(Err("Sheet not found"));
    }
    return Promise.resolve(Ok(sheet));
  },
  updateSheet(sheetId, SheetAction) {
    const sheet = getSheet(sheetId);
    if (!sheet) {
      return Promise.resolve(Err("Sheet not found"));
    }
    const updatedSheet = migrator.reduce(sheet, SheetAction);
    if (!updatedSheet.ok) {
      return Promise.resolve(Err(updatedSheet.error));
    }
    setSheet(sheetId, updatedSheet.value);
    return Promise.resolve(Ok());
  },
};
