import { Result } from "@app/shared/types/result";
import { SheetData, SheetMeta } from "@app/shared/types/sheet";
import { SheetAction } from "@app/shared/types/action";

// Backend
type StorageBackendType = "local" | "api";

interface BaseStorageBackend {
  backendType: StorageBackendType;
  id: string;
  queryParam: string;
  getSheets(): Promise<Result<SheetMeta[]>>;
  renameSheet(id: string, title: string): Promise<Result<void>>;
  deleteSheet(id: string): Promise<Result<void>>;
  createSheet(title: string): Promise<Result<SheetMeta>>;

  getSheetData(sheetId: string): Promise<Result<SheetData>>;
  updateSheet(sheetId: string, SheetAction: SheetAction): Promise<Result<void>>;
}

interface LocalStorageBackend extends BaseStorageBackend {
  backendType: "local";
}

interface ApiStorageBackend extends BaseStorageBackend {
  backendType: "api";
  url: string;
}

export type StorageBackend = LocalStorageBackend | ApiStorageBackend;
