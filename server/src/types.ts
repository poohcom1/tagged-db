import type { Result } from "@app/shared/result";
import type {
  ColumnEditAction,
  ColumnEditType,
} from "@app/shared/sheetMigration";
import type { Sheet, SheetData } from "@app/shared/sheets";

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

  // Column
  updateColumn(
    id: string,
    columnId: string,
    payload: ColumnEditAction,
  ): Promise<Result<void>>;
  updateColumnBatched(
    id: string,
    columnId: string,
    payloads: ColumnEditAction[],
  ): Promise<Result<void>>;
}
