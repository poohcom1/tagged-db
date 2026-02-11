import Fastify from "fastify";
import fastifyStatic from "@fastify/static";
import path from "path";
import type { SheetMeta, SheetData } from "@app/shared/sheets";
import { memoryDb } from "./db/memoryDb.js";
import type { ColumnEditAction } from "@app/shared/sheetMigration";
import { validateType } from "@app/shared/sheetValidation";

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

// My Sheets
const db = memoryDb;

server.get<{ Reply: SheetMeta[] }>(
  "/api/sheets",
  async function handler(request, reply) {
    const res = await db.getSheets();
    if (res.ok) {
      return res.value;
    } else {
      return reply.code(500);
    }
  },
);

server.post<{ Body: { title: string }; Reply: SheetMeta | string }>(
  "/api/sheets",
  async function handler(request, reply) {
    const res = await db.createSheet(request.body.title);
    if (res.ok) {
      return res.value;
    } else {
      return reply.code(500).send(res.error);
    }
  },
);

server.patch<{
  Params: { sheetId: string };
  Body: { title: string };
  Reply: SheetMeta | string;
}>("/api/sheets/:sheetId", async function handler(request, reply) {
  const res = await db.renameSheet(request.params.sheetId, request.body.title);
  if (res.ok) {
    return res.value;
  } else {
    return reply.code(500).send(res.error);
  }
});

server.delete<{
  Params: { sheetId: string };
  Reply: SheetMeta | string;
}>("/api/sheets/:sheetId", async function handler(request, reply) {
  const res = await db.deleteSheet(request.params.sheetId);
  if (res.ok) {
    return reply.code(200).send();
  } else {
    return reply.code(500).send(res.error);
  }
});

// Sheet
server.get<{ Params: { sheetId: string }; Reply: SheetData | string }>(
  "/api/sheet-data/:sheetId",
  async function handler(request, reply) {
    const sheetData = await db.getSheetData(request.params.sheetId);
    if (!sheetData)
      return reply.code(500).send("Sheet not found: " + request.params.sheetId);
    return sheetData;
  },
);

server.post<{
  Params: { sheetId: string };
  Body: { columnId: string; title: string; type: string };
}>("/api/sheet-data/:sheetId/column", async function handler(request, reply) {
  if (!validateType(request.body.type))
    return reply.code(500).send("Invalid column type: " + request.body.type);

  const res = await db.addColumn(
    request.params.sheetId,
    request.body.columnId,
    request.body.title,
    request.body.type,
  );
  if (res.ok) {
    return reply.code(200).send();
  } else {
    return reply.code(500).send(res.error);
  }
});

server.patch<{
  Params: { sheetId: string };
  Body: { rowId: string; columnId: string; value: string };
}>("/api/sheet-data/:sheetId", async function handler(request, reply) {
  const res = await db.updateSheetDataCell(
    request.params.sheetId,
    request.body.rowId,
    request.body.columnId,
    request.body.value,
  );
  // fake delay 20 s
  await new Promise((resolve) => setTimeout(resolve, 20000));
  if (res.ok) {
    return reply.code(200).send();
  } else {
    return reply.code(500).send(res.error);
  }
});

server.patch<{
  Body: { payload: ColumnEditAction[] };
  Params: { sheetId: string; columnId: string };
}>(
  "/api/sheet-data/:sheetId/column/:columnId",
  async function handler(request, reply) {
    const res = await db.updateColumnBatched(
      request.params.sheetId,
      request.params.columnId,
      request.body.payload,
    );
    if (res.ok) {
      return reply.code(200).send();
    } else {
      return reply.code(500).send(res.error);
    }
  },
);

// Run the server!
try {
  server.listen({ port: 3000 }, (err, address) =>
    console.log(`Server listening at http://localhost:3000`),
  );
} catch (err) {
  server.log.error(err);
  process.exit(1);
}
