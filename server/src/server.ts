import Fastify from "fastify";
import fs from "fs";
import cors from "@fastify/cors";
import basicAuth from "@fastify/basic-auth";
import {
  CREATE_SHEET,
  DELETE_SHEET,
  GET_SHEETS,
  GET_SHEET_DATA,
  RENAME_SHEET,
  UPDATE_SHEET,
  type EndpointOf,
} from "@app/shared/endpoints";
import { errorToString } from "@app/shared/util";
import { jsonFsDb } from "./db/jsonFsDb.js";
import { SheetError } from "./lib/errors.js";

let https: { key?: string; cert?: string } | null = null;

if (
  process.env.HTTPS_ENABLED === "true" &&
  process.env.HTTPS_KEY_PATH &&
  process.env.HTTPS_CERT_PATH
) {
  https = {
    key: fs.readFileSync(process.env.HTTPS_KEY_PATH).toString(),
    cert: fs.readFileSync(process.env.HTTPS_CERT_PATH).toString(),
  };
}

(async () => {
  const server = Fastify({
    logger: process.env.LOG_JSON
      ? true
      : {
          transport: {
            target: "pino-pretty",
            options: {
              translateTime: "HH:MM:ss",
              ignore: "pid,hostname",
              colorize: true,
            },
          },
        },
    https,
  });

  if (https?.key && https?.cert) {
    server.log.info("HTTPS enabled");
  }

  // Static
  await server.register(cors, {
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type"],
  });

  // HTTP
  const ENABLE_ADMIN_AUTH = process.env.ADMIN_AUTH === "true";

  if (ENABLE_ADMIN_AUTH) {
    server.log.info("Admin auth enabled");
    await server.register(basicAuth, {
      validate: async (username, password, req, reply) => {
        if (
          username !== process.env.ADMIN_USER ||
          password !== process.env.ADMIN_PASS
        ) {
          return new Error("Unauthorized");
        }
      },
      authenticate: true,
    });

    server.after(() => {
      server.addHook("onRequest", server.basicAuth);
    });
  }

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
    if (error instanceof SheetError) {
      server.log.error("[internal server error] " + error.message);
      return reply.send(error.message);
    }
    return reply.send(error);
  });

  // Run the server!
  const port = Number(process.env.PORT) || 3000;
  try {
    server.listen({ port, host: "0.0.0.0" });
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
})();
