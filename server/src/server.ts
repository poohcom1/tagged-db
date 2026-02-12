import Fastify, {
  type FastifyInstance,
  type RouteHandlerMethod,
  type RouteShorthandMethod,
} from "fastify";
import fastifyStatic from "@fastify/static";
import path from "path";
import type { SheetMeta, SheetData } from "@app/shared/sheets";
import { memoryDb } from "./db/memoryDb.js";
import type { ColumnEditAction } from "@app/shared/sheetMigration";
import { validateType } from "@app/shared/sheetValidation";
import {
  ADD_COLUMN,
  ADD_ROW,
  CREATE_SHEET,
  DELETE_SHEET,
  GET_SHEETS,
  GET_SHEET_DATA,
  RENAME_SHEET,
  UPDATE_CELL,
  UPDATE_COLUMN_BATCHED,
  type BodyOf,
  type Endpoint,
  type EndpointOf,
  type ParamsOf,
  type ReplyOf,
} from "@app/shared/endpoints";
import { unwrapOrThrow } from "@app/shared/result";
import { errorToString } from "@app/shared/util";

const server = Fastify({
  logger: true,
});

// Static
const __dirname = path.resolve(path.dirname("public"));

server.register(fastifyStatic, {
  root: path.join(__dirname, "public"), // Absolute path to your static files
  prefix: "/", // Optional: a URL path prefix (default is '/')
});

// Declare a route
server.get("/", async function handler(request, reply) {
  return reply.sendFile("index.html");
});

server.get("/api/ping", async function handler(request, reply) {
  return "pong";
});

// Endpoints

// My Sheets
const db = memoryDb;

server.get<EndpointOf<typeof GET_SHEETS>>(
  GET_SHEETS.url,
  async function handler(request, reply) {
    const res = await db.getSheets();
    return unwrapOrThrow(res);
  },
);

server.post<EndpointOf<typeof CREATE_SHEET>>(
  CREATE_SHEET.url,
  async function handler(request, reply) {
    const res = await db.createSheet(request.body.title);
    return unwrapOrThrow(res);
  },
);

server.patch<EndpointOf<typeof RENAME_SHEET>>(
  RENAME_SHEET.url,
  async function handler(request, reply) {
    const res = await db.renameSheet(
      request.params.sheetId,
      request.body.title,
    );
    return unwrapOrThrow(res);
  },
);

server.delete<EndpointOf<typeof DELETE_SHEET>>(
  DELETE_SHEET.url,
  async function handler(request, reply) {
    const res = await db.deleteSheet(request.params.sheetId);
    return unwrapOrThrow(res);
  },
);

// Sheet
server.get<EndpointOf<typeof GET_SHEET_DATA>>(
  GET_SHEET_DATA.url,
  async function handler(request, reply) {
    const sheetData = await db.getSheetData(request.params.sheetId);
    return unwrapOrThrow(sheetData);
  },
);

server.post<EndpointOf<typeof ADD_COLUMN>>(
  ADD_COLUMN.url,
  async function handler(request, reply) {
    if (!validateType(request.body.type))
      return reply.code(500).send("Invalid column type: " + request.body.type);

    const res = await db.addColumn(
      request.params.sheetId,
      request.body.columnId ?? crypto.randomUUID(),
      request.body.title,
      request.body.type,
    );
    return unwrapOrThrow(res);
  },
);

server.post<EndpointOf<typeof ADD_ROW>>(
  ADD_ROW.url,
  async function handler(request, reply) {
    const res = await db.addRow(request.params.sheetId, request.body.rowId);
    return unwrapOrThrow(res);
  },
);

server.patch<EndpointOf<typeof UPDATE_CELL>>(
  UPDATE_CELL.url,
  async function handler(request, reply) {
    const res = await db.updateSheetDataCell(
      request.params.sheetId,
      request.params.rowId,
      request.params.columnId,
      request.body.value,
    );
    return unwrapOrThrow(res);
  },
);

server.patch<EndpointOf<typeof UPDATE_COLUMN_BATCHED>>(
  UPDATE_COLUMN_BATCHED.url,
  async function handler(request, reply) {
    const res = await db.updateColumnBatched(
      request.params.sheetId,
      request.params.columnId,
      request.body.payload,
    );
    return unwrapOrThrow(res);
  },
);

// Error
server.addHook("onRequest", async (req) => {
  console.log("[INCOMING]:", req.method, req.url);
});

server.setErrorHandler((error, request, reply) => {
  const message = errorToString(error);
  console.error("Fastify error", message);
  reply.code(500).type("text/plain").send(message);
});

// Run the server!
try {
  server.listen({ port: 3000 }, (err, address) =>
    console.log(`Server listening at http://localhost:3000`),
  );
} catch (err) {
  server.log.error(err);
  process.exit(1);
}
