import Fastify from "fastify";
import cors from "@fastify/cors";
import { memoryDb } from "./db/memoryDb.js";
import {
  CREATE_SHEET,
  DELETE_SHEET,
  GET_SHEETS,
  GET_SHEET_DATA,
  RENAME_SHEET,
  UPDATE_SHEET,
  type EndpointOf,
} from "@app/shared/endpoints";
import { unwrapOrThrow } from "@app/shared/result";
import { errorToString } from "@app/shared/util";

const server = Fastify({
  logger: true,
});

// Static
await server.register(cors as any, {
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type"],
});

// Declare a route
server.get("/api/ping", async function handler(request, reply) {
  return "pong";
});

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
    unwrapOrThrow(res);
  },
);

server.delete<EndpointOf<typeof DELETE_SHEET>>(
  DELETE_SHEET.url,
  async function handler(request, reply) {
    const res = await db.deleteSheet(request.params.sheetId);
    unwrapOrThrow(res);
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

server.patch<EndpointOf<typeof UPDATE_SHEET>>(
  UPDATE_SHEET.url,
  async function handler(request, reply) {
    const res = await db.updateSheet(
      request.params.sheetId,
      request.body.action,
    );
    unwrapOrThrow(res);
  },
);

// Error
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
