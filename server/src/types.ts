import type { Result, Sheet, SheetData } from "@app/shared";

export interface DBInterface {
  // Sheets
  createSheet(): Promise<Result<Sheet>>;
  getSheets(): Promise<Result<Sheet[]>>;

  // Sheet
  getSheetData(id: string): Promise<SheetData | undefined>;
  updateSheetDataCell(
    id: string,
    rowId: string,
    columnId: string,
    value: string,
  ): Promise<Result<void>>;
}
