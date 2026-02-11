import { Err, Ok, Result } from "@app/shared/result";
import { ColumnEditAction } from "@app/shared/sheetMigration";
import { ColumnType, SheetData, SheetMeta } from "@app/shared/sheets";

// API
export async function getSheetsMeta(): Promise<Result<SheetMeta[]>> {
  try {
    const res = await trackedFetch("/api/sheets");
    await handleHttpError(res);
    const sheetsMeta = (await res.json()) as SheetMeta[];
    return Ok(sheetsMeta);
  } catch (e) {
    return Err(handleErrorObject(e));
  }
}

export async function renameSheet(sheetId: string, title: string) {
  try {
    const res = await trackedFetch(`/api/sheets/${sheetId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ title }),
    });
    await handleHttpError(res);
    const sheetMeta = (await res.json()) as SheetMeta;
    return Ok(sheetMeta);
  } catch (e) {
    return Err(handleErrorObject(e));
  }
}

export async function deleteSheet(sheetId: string) {
  try {
    const res = await trackedFetch(`/api/sheets/${sheetId}`, {
      method: "DELETE",
    });
    await handleHttpError(res);
    return Ok();
  } catch (e) {
    return Err(handleErrorObject(e));
  }
}

export async function createSheet(title: string): Promise<Result<SheetMeta>> {
  try {
    const res = await trackedFetch("/api/sheets", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ title }),
    });
    await handleHttpError(res);
    const sheetMeta = (await res.json()) as SheetMeta;
    return Ok(sheetMeta);
  } catch (e) {
    return Err(handleErrorObject(e));
  }
}

export async function getSheet(sheetId: string): Promise<Result<SheetData>> {
  try {
    const res = await trackedFetch(`/api/sheet-data/${sheetId}`);
    await handleHttpError(res);
    const sheetData = (await res.json()) as SheetData;
    return Ok(sheetData);
  } catch (e) {
    return Err(handleErrorObject(e));
  }
}

export async function updateCell(
  sheetId: string,
  rowId: string,
  columnId: string,
  value: string,
) {
  try {
    const res = await trackedFetch(`/api/sheet-data/${sheetId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ rowId, columnId, value }),
    });
    await handleHttpError(res);
    return Ok();
  } catch (e) {
    return Err(handleErrorObject(e));
  }
}

export async function createColumn(
  sheetId: string,
  columnId: string,
  columnTitle: string,
  columnType: ColumnType,
) {
  try {
    const res = await trackedFetch(`/api/sheet-data/${sheetId}/column`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ columnId, title: columnTitle, type: columnType }),
    });
    await handleHttpError(res);
    return Ok();
  } catch (e) {
    return Err(handleErrorObject(e));
  }
}

export async function updateColumnBatched(
  sheetId: string,
  columnId: string,
  payload: ColumnEditAction[],
) {
  try {
    const res = await trackedFetch(
      `/api/sheet-data/${sheetId}/column/${columnId}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ payload }),
      },
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

async function trackedFetch(input: RequestInfo, init?: RequestInit) {
  startRequest();
  try {
    const res = await fetch(input, init);
    await handleHttpError(res);
    return res;
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
  console.error(e);
  if (e instanceof Error) {
    return e.message;
  }
  return String(e);
}
