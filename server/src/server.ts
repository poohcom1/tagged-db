import Fastify from "fastify";
import fastifyStatic from "@fastify/static";
import path from "path";
import type { Sheet, SheetData } from "@app/shared";
import { memoryDb } from "./db/memoryDb.js";

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

server.get<{ Reply: Sheet[] }>(
  "/api/my-sheets",
  async function handler(request, reply) {
    const res = await db.getSheets();
    if (res.ok) {
      return res.value;
    } else {
      return reply.code(500);
    }
  },
);

// Sheet
server.get<{ Reply: SheetData; Params: { id: string } }>(
  "/api/sheet-data/:id",
  async function handler(request, reply) {
    const sheetData = await db.getSheetData(request.params.id);
    if (!sheetData) return reply.code(500).send();
    return sheetData;
  },
);

server.post<{
  Body: { rowId: string; columnId: string; value: string };
  Params: { id: string };
}>("/api/sheet-data/:id", async function handler(request, reply) {
  const res = await db.updateSheetDataCell(
    request.params.id,
    request.body.rowId,
    request.body.columnId,
    request.body.value,
  );
  if (res.ok) {
    return reply.code(200).send();
  } else {
    return reply.code(500).send(res.error);
  }
});

// Run the server!
try {
  server.listen({ port: 3000 }, (err, address) =>
    console.log(`Server listening at ${address}`),
  );
} catch (err) {
  server.log.error(err);
  process.exit(1);
}
