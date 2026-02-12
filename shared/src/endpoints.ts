import { ColumnEditAction } from "./sheetMigration";
import { SheetData, SheetMeta } from "./sheets";

export const GET_SHEETS: Endpoint<undefined, undefined, SheetMeta[]> = {
  url: "/api/sheets",
  method: "GET",
};

export const CREATE_SHEET: Endpoint<undefined, { title: string }, SheetMeta> = {
  url: "/api/sheets",
  method: "POST",
};

export const RENAME_SHEET: Endpoint<
  { sheetId: string },
  { title: string },
  undefined
> = {
  url: "/api/sheets/:sheetId",
  method: "PATCH",
};

export const DELETE_SHEET: Endpoint<{ sheetId: string }, undefined, undefined> =
  {
    url: "/api/sheets/:sheetId",
    method: "DELETE",
  };

export const GET_SHEET_DATA: Endpoint<
  { sheetId: string },
  undefined,
  SheetData
> = {
  url: "/api/sheets/:sheetId/data",
  method: "GET",
};

export const ADD_COLUMN: Endpoint<
  { sheetId: string },
  { columnId?: string; title: string; type: string },
  undefined
> = {
  url: "/api/sheets/:sheetId/columns",
  method: "POST",
};

export const ADD_ROW: Endpoint<{ sheetId: string }, { rowId?: string }> = {
  url: "/api/sheets/:sheetId/rows",
  method: "POST",
};

export const UPDATE_CELL: Endpoint<
  { sheetId: string; rowId: string; columnId: string },
  { value: string },
  undefined
> = {
  url: "/api/sheets/:sheetId/rows/:rowId/cells/:columnId",
  method: "PATCH",
};

export const UPDATE_COLUMN_BATCHED: Endpoint<
  { sheetId: string; columnId: string },
  { payload: ColumnEditAction[] },
  undefined
> = {
  url: "/api/sheets/:sheetId/columns/:columnId",
  method: "PATCH",
};

// URL Builder
export function buildUrl<E extends Endpoint<any, any, any>>(
  endpoint: E,
  params: ParamsOf<E>,
): string {
  let url = endpoint.url;

  if (!params) return url;

  for (const [key, value] of Object.entries(params as Record<string, string>)) {
    url = url.replace(`:${key}`, value);
  }

  return url;
}

// Type helpers
type HttpMethod = "GET" | "POST" | "PATCH" | "DELETE";

export type Endpoint<
  TParams = undefined,
  TBody = undefined,
  TResponse = undefined,
> = {
  url: string;
  method: HttpMethod;
};

export type ParamsOf<E> = E extends Endpoint<infer P, any, any> ? P : never;

export type BodyOf<E> = E extends Endpoint<any, infer B, any> ? B : never;

export type ReplyOf<E> = E extends Endpoint<any, any, infer R> ? R : never;

// map to { Params, Body, Reply }
export type EndpointOf<E extends Endpoint> = {
  Params: ParamsOf<E>;
  Body: BodyOf<E>;
  Reply: ReplyOf<E>;
};
