import { ColumnType } from "./sheet";

export type SheetActionType =
  | "update_cell"
  | "add_row"
  | "delete_row"
  | "add_column"
  | "delete_column"
  | "update_column_batched";

export type SheetAction =
  | UpdateCellAction
  | AddRowAction
  | DeleteRowAction
  | AddColumnAction
  | DeleteColumnAction
  | UpdateColumnBatchedAction;

interface BaseSheetAction<
  TAction extends SheetActionType,
  TParams extends Record<string, unknown>,
> {
  action: TAction;
  params: TParams;
}

// Sheets
type AddColumnAction = BaseSheetAction<
  "add_column",
  { columnId: string; title: string; type: string }
>;
type DeleteColumnAction = BaseSheetAction<
  "delete_column",
  { columnId: string }
>;
type AddRowAction = BaseSheetAction<"add_row", { rowId: string }>;
type DeleteRowAction = BaseSheetAction<"delete_row", { rowId: string }>;
type UpdateCellAction = BaseSheetAction<
  "update_cell",
  { rowId: string; columnId: string; value: string }
>;
type UpdateColumnBatchedAction = BaseSheetAction<
  "update_column_batched",
  { columnId: string; actions: ColumnEditAction[] }
>;

// Column
export type ColumnEditType =
  | "rename"
  | "change_type"
  | "enum_update"
  | "reorder";

export type ColumnEditAction =
  | ColumnRenameAction
  | ColumnChangeTypeAction
  | ColumnEnumUpdateAction
  | ColumnReorderAction;

interface BaseColumnAction {
  editType: ColumnEditType;
}

interface ColumnRenameAction extends BaseColumnAction {
  editType: "rename";
  title: string;
}

interface ColumnChangeTypeAction extends BaseColumnAction {
  editType: "change_type";
  toType: ColumnType;
}

interface ColumnEnumUpdateAction extends BaseColumnAction {
  editType: "enum_update";
  // ID = original values
  idOrder: string[];
  idToNames: Record<string, string>;
}

interface ColumnReorderAction extends BaseColumnAction {
  editType: "reorder";
  toIndex: number;
}
