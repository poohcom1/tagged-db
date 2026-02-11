import type { Result } from "@app/shared/result";
import type {
  ColumnEditAction,
  ColumnEditType,
} from "@app/shared/sheetMigration";
import type { ColumnType, Sheet, SheetData } from "@app/shared/sheets";

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
  addColumn(
    sheetId: string,
    columnId: string,
    title: string,
    type: ColumnType,
  ): Promise<Result<void>>;
  updateColumn(
    sheetId: string,
    columnId: string,
    payload: ColumnEditAction,
  ): Promise<Result<void>>;
  updateColumnBatched(
    sheetId: string,
    columnId: string,
    payloads: ColumnEditAction[],
  ): Promise<Result<void>>;
}
