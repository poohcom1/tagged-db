import type { Result } from "@app/shared/result";
import type { SheetMeta, SheetData } from "@app/shared/types/sheet";
import type { SheetAction } from "@app/shared/types/action";

export interface DBInterface {
  // Files
  createSheet(title: string): Promise<Result<SheetMeta>>;
  renameSheet(id: string, title: string): Promise<Result<void>>;
  deleteSheet(id: string): Promise<Result<void>>;
  getSheets(): Promise<Result<SheetData[]>>;

  // Sheet
  getSheetData(id: string): Promise<Result<SheetData>>;
  updateSheet(id: string, SheetAction: SheetAction): Promise<Result<void>>;
}
