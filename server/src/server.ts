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
import { unwrapOrThrow } from "@app/shared/types/result";
import { errorToString } from "@app/shared/util";
import { jsonFsDb } from "./db/jsonFsDb.js";

(async () => {
  const server = Fastify({
    logger: true,
  });

  // Static
  await server.register(cors, {
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type"],
  });

  // Declare a route
  server.get("/api/ping", async function handler(request, reply) {
    return "pong";
  });

  // My Sheets
  const db = jsonFsDb;

  server[GET_SHEETS.method]<EndpointOf<typeof GET_SHEETS>>(
    GET_SHEETS.url,
    async function handler(request, reply) {
      return await db.getSheets();
    },
  );

  server[CREATE_SHEET.method]<EndpointOf<typeof CREATE_SHEET>>(
    CREATE_SHEET.url,
    async function handler(request, reply) {
      return await db.createSheet(request.body.title);
    },
  );

  server[RENAME_SHEET.method]<EndpointOf<typeof RENAME_SHEET>>(
    RENAME_SHEET.url,
    async function handler(request, reply) {
      await db.renameSheet(request.params.sheetId, request.body.title);
    },
  );

  server[DELETE_SHEET.method]<EndpointOf<typeof DELETE_SHEET>>(
    DELETE_SHEET.url,
    async function handler(request, reply) {
      await db.deleteSheet(request.params.sheetId);
    },
  );

  // Sheet
  server[GET_SHEET_DATA.method]<EndpointOf<typeof GET_SHEET_DATA>>(
    GET_SHEET_DATA.url,
    async function handler(request, reply) {
      return await db.getSheetData(request.params.sheetId);
    },
  );

  server[UPDATE_SHEET.method]<EndpointOf<typeof UPDATE_SHEET>>(
    UPDATE_SHEET.url,
    async function handler(request, reply) {
      await db.updateSheet(request.params.sheetId, request.body.action);
    },
  );

  // Error
  server.setErrorHandler((error, request, reply) => {
    const message = errorToString(error);
    console.error("[server error]", message);
    reply.code(500).type("text/plain").send(message);
  });

  // Run the server!
  const port = Number(process.env.PORT) || 3000;
  try {
    server.listen({ port }, (err, address) =>
      console.log(`Server listening at ${address}`),
    );
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
})();
