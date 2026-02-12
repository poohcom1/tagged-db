import { Err, Ok, Result } from "@app/shared/result";
import { ColumnEditAction } from "@app/shared/sheetMigration";
import { ColumnType, SheetData, SheetMeta } from "@app/shared/sheets";
import { StorageBackend } from "./storageBackend";
import {
  ADD_COLUMN,
  ADD_ROW,
  BodyOf,
  buildUrl,
  CREATE_SHEET,
  DELETE_SHEET,
  Endpoint,
  GET_SHEET_DATA,
  GET_SHEETS,
  ParamsOf,
  RENAME_SHEET,
  UPDATE_CELL,
  UPDATE_COLUMN_BATCHED,
} from "@app/shared/endpoints";

// API
async function getSheets(): Promise<Result<SheetMeta[]>> {
  try {
    const res = await fetchEndpoint(GET_SHEETS, undefined, undefined);
    await handleHttpError(res);
    const sheetsMeta = (await res.json()) as SheetMeta[];
    return Ok(sheetsMeta);
  } catch (e) {
    return Err(handleErrorObject(e));
  }
}

async function renameSheet(sheetId: string, title: string) {
  try {
    const res = await fetchEndpoint(RENAME_SHEET, { sheetId }, { title });
    await handleHttpError(res);
    return Ok();
  } catch (e) {
    return Err(handleErrorObject(e));
  }
}

async function deleteSheet(sheetId: string) {
  try {
    const res = await fetchEndpoint(DELETE_SHEET, { sheetId }, undefined);
    await handleHttpError(res);
    return Ok();
  } catch (e) {
    return Err(handleErrorObject(e));
  }
}

async function createSheet(title: string): Promise<Result<SheetMeta>> {
  try {
    const res = await fetchEndpoint(CREATE_SHEET, undefined, { title });
    await handleHttpError(res);
    const sheetMeta = (await res.json()) as SheetMeta;
    return Ok(sheetMeta);
  } catch (e) {
    return Err(handleErrorObject(e));
  }
}

async function getSheetData(sheetId: string): Promise<Result<SheetData>> {
  try {
    const res = await fetchEndpoint(GET_SHEET_DATA, { sheetId }, undefined);
    await handleHttpError(res);
    const sheetData = (await res.json()) as SheetData;
    return Ok(sheetData);
  } catch (e) {
    return Err(handleErrorObject(e));
  }
}

async function updateCell(
  sheetId: string,
  rowId: string,
  columnId: string,
  value: string,
) {
  try {
    const res = await fetchEndpoint(
      UPDATE_CELL,
      { sheetId, rowId, columnId },
      { value },
    );
    await handleHttpError(res);
    return Ok();
  } catch (e) {
    return Err(handleErrorObject(e));
  }
}

async function createColumn(
  sheetId: string,
  columnId: string,
  columnTitle: string,
  columnType: ColumnType,
) {
  try {
    const res = await fetchEndpoint(
      ADD_COLUMN,
      { sheetId },
      { columnId, title: columnTitle, type: columnType },
    );
    await handleHttpError(res);
    return Ok();
  } catch (e) {
    return Err(handleErrorObject(e));
  }
}

async function createRow(sheetId: string, rowId: string) {
  try {
    const res = await fetchEndpoint(ADD_ROW, { sheetId }, { rowId });
    await handleHttpError(res);
    return Ok();
  } catch (e) {
    return Err(handleErrorObject(e));
  }
}

export const apiBackend: StorageBackend = {
  getSheets,
  renameSheet,
  deleteSheet,
  createSheet,
  getSheet: getSheetData,
  updateCell,
  createColumn,
  createRow,
  updateColumnBatched,
};

export async function updateColumnBatched(
  sheetId: string,
  columnId: string,
  payload: ColumnEditAction[],
) {
  try {
    const res = await fetchEndpoint(
      UPDATE_COLUMN_BATCHED,
      { sheetId, columnId },
      { payload },
    );
    await handleHttpError(res);
    return Ok();
  } catch (e) {
    return Err(handleErrorObject(e));
  }
}

// On close
let activeRequests = 0;

function startRequest() {
  activeRequests++;
}

function endRequest() {
  activeRequests = Math.max(0, activeRequests - 1);
}

function hasActiveRequests() {
  return activeRequests > 0;
}

if (typeof window !== "undefined") {
  window.addEventListener("beforeunload", (event) => {
    if (hasActiveRequests()) {
      event.preventDefault();
      event.returnValue = ""; // Required for Chrome
    }
  });
}

async function fetchEndpoint<E extends Endpoint<unknown, unknown, unknown>>(
  endpoint: E,
  params: ParamsOf<E>,
  body: BodyOf<E>,
): Promise<Response> {
  startRequest();
  try {
    const res = await fetch(buildUrl(endpoint, params), {
      method: endpoint.method,
      headers: body
        ? {
            "Content-Type": "application/json",
          }
        : undefined,
      body: JSON.stringify(body),
    });
    await handleHttpError(res);
    return res;
  } catch (e) {
    throw handleErrorObject(e);
  } finally {
    endRequest();
  }
}

// Helper
async function handleHttpError(res: Response) {
  if (!res.ok) {
    const text = await res.text();
    if (text) {
      throw new Error(text);
    } else {
      throw new Error("HTTP Error: " + res.status);
    }
  }
}

function handleErrorObject(e: unknown): string {
  if (e instanceof Error) {
    return e.message;
  }
  return String(e);
}
