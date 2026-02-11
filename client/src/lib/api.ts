import { Err, Ok, Result } from "@app/shared/result";
import { ColumnEditAction } from "@app/shared/sheetMigration";
import { SheetData } from "@app/shared/sheets";

// Helper
async function handleHttpError(res: Response) {
  if (!res.ok) {
    throw await res.text();
  }
}

function handlerErrorObject(e: unknown): string {
  if (e instanceof Error) {
    return e.message;
  }
  return String(e);
}

// API
export async function getSheet(sheetId: string): Promise<Result<SheetData>> {
  try {
    const res = await fetch(`/api/sheet-data/${sheetId}`);
    await handleHttpError(res);
    const sheetData = (await res.json()) as SheetData;
    return Ok(sheetData);
  } catch (e) {
    return Err(handlerErrorObject(e));
  }
}

export async function updateCell(
  sheetId: string,
  rowId: string,
  columnId: string,
  value: string,
) {
  try {
    const res = await fetch(`/api/sheet-data/${sheetId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ rowId, columnId, value }),
    });
    await handleHttpError(res);
    return Ok();
  } catch (e) {
    return Err(handlerErrorObject(e));
  }
}

export async function updateColumnBatched(
  sheetId: string,
  columnId: string,
  payload: ColumnEditAction[],
) {
  try {
    const res = await fetch(`/api/sheet-data/${sheetId}/column/${columnId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ payload }),
    });
    await handleHttpError(res);
    return Ok();
  } catch (e) {
    return Err(handlerErrorObject(e));
  }
}
