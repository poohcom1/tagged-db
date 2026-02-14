import { SheetAction } from "./types/action.js";
import { SheetData, SheetMeta } from "./types/sheet.js";

export const GET_SHEETS: Endpoint<undefined, undefined, SheetMeta[]> = {
  url: "/api/sheets",
  method: "get",
};

export const CREATE_SHEET: Endpoint<undefined, { title: string }, SheetMeta> = {
  url: "/api/sheets",
  method: "post",
};

export const RENAME_SHEET: Endpoint<
  { sheetId: string },
  { title: string },
  undefined
> = {
  url: "/api/sheets/:sheetId",
  method: "patch",
};

export const DELETE_SHEET: Endpoint<{ sheetId: string }, undefined, undefined> =
  {
    url: "/api/sheets/:sheetId",
    method: "delete",
  };

export const GET_SHEET_DATA: Endpoint<
  { sheetId: string },
  undefined,
  SheetData
> = {
  url: "/api/sheets/:sheetId/data",
  method: "get",
};

export const UPDATE_SHEET: Endpoint<
  { sheetId: string },
  { action: SheetAction },
  undefined
> = {
  url: "/api/sheets/:sheetId/data",
  method: "patch",
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
type HttpMethod = "get" | "post" | "patch" | "delete";

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
