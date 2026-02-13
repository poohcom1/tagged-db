import { Result } from "@app/shared/result";
import { SheetData, SheetMeta } from "@app/shared/types/sheet";
import { localStorageBackend } from "./localStorageBackend";
import { SheetAction } from "@app/shared/types/action";

export interface StorageBackend {
  getSheets(): Promise<Result<SheetMeta[]>>;
  renameSheet(id: string, title: string): Promise<Result<void>>;
  deleteSheet(id: string): Promise<Result<void>>;
  createSheet(title: string): Promise<Result<SheetMeta>>;

  getSheetData(sheetId: string): Promise<Result<SheetData>>;
  updateSheet(sheetId: string, SheetAction: SheetAction): Promise<Result<void>>;
}

console.log(
  "Running with storage backend: " + import.meta.env.VITE_STORAGE_BACKEND,
);
export const storageBackend = localStorageBackend;
