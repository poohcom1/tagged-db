import * as migration from "@app/shared/sheetMigration";
import type { DBInterface } from "../types.js";
import { Err, Ok, Result } from "@app/shared/result";
import { type SheetMeta, type SheetData } from "@app/shared/sheets";
import { resolve } from "path";
import { writeFile } from "fs/promises";

export const memoryDb: DBInterface = {
  async createSheet(title: string) {
    if (Object.values(db.sheetData).find((s) => s.name === title)) {
      return Err("Sheet already exists");
    }

    const uuid = crypto.randomUUID();
    const sheet = migration.createSheet(uuid, title);
    db.sheetData[uuid] = sheet;
    return Ok(sheet);
  },
  async renameSheet(sheetId: string, title: string) {
    const sheet = db.sheetData[sheetId];
    if (!sheet) {
      return Err("Sheet not found");
    }
    sheet.name = title;
    db.sheetData[sheetId] = sheet;
    return Ok(sheet);
  },
  async deleteSheet(sheetId: string) {
    delete db.sheetData[sheetId];
    return Ok();
  },
  async getSheets() {
    return Ok(Object.values(db.sheetData));
  },
  async getSheetData(sheetId: string) {
    return Result(db.sheetData[sheetId], "Sheet not found: " + sheetId);
  },

  async addRow(sheetId, rowId) {
    const sheetData = db.sheetData[sheetId];
    if (!sheetData) {
      return Err("Sheet not found");
    }
    const res = migration.addRow(sheetData, rowId ?? crypto.randomUUID());
    if (!res.ok) {
      return Err(res.error);
    }
    db.sheetData[sheetId] = migration.updateTimestamp({
      ...sheetData,
      rows: res.value,
    });
    return Ok();
  },
  async updateSheetDataCell(sheetId, rowId, columnId, value) {
    const sheetData = db.sheetData[sheetId];

    if (!sheetData) {
      return { error: "Sheet not found", ok: false };
    }

    const row = sheetData.rows.find((row) => row.id === rowId);
    if (!row) {
      return { error: "Row not found", ok: false };
    }

    row.values[columnId] = value;

    if (
      sheetData.columns.find((column) => column.id === columnId)?.type ===
      "tags"
    ) {
      sheetData.tagCache = migration.updateTagCache(sheetData);
    }

    db.sheetData[sheetId] = migration.updateTimestamp(sheetData);

    return Ok();
  },

  // Column
  async addColumn(sheetId, columnId, title, type) {
    const sheetData = db.sheetData[sheetId];
    if (!sheetData) {
      return Err("Sheet not found");
    }
    const res = migration.addColumn(sheetData, { id: columnId, title, type });
    if (!res.ok) {
      return Err(res.error);
    }
    db.sheetData[sheetId] = migration.updateTimestamp(res.value);
    return Ok();
  },
  async updateColumn(sheetId, columnId, payload) {
    const sheetData = db.sheetData[sheetId];
    if (!sheetData) {
      return Err("Sheet not found");
    }
    const res = migration.updateColumn(sheetData, columnId, payload);
    if (!res.ok) {
      return Err(res.error);
    }
    db.sheetData[sheetId] = migration.updateTimestamp(res.value);
    return Ok();
  },
  async updateColumnBatched(sheetId, columnId, payloads) {
    let sheetData = db.sheetData[sheetId];
    if (!sheetData) {
      return Err("Sheet not found");
    }

    for (const payload of payloads) {
      const res = migration.updateColumn(sheetData, columnId, payload);
      if (!res.ok) {
        return Err(res.error);
      }
      sheetData = res.value;
    }

    db.sheetData[sheetId] = migration.updateTimestamp(sheetData);
    return Ok();
  },
};

const db: {
  sheetData: Record<string, SheetData>;
} = {
  sheetData: {
    "1": {
      id: "1",
      name: "Sheet 1",
      created: new Date().toISOString(),
      updated: new Date().toISOString(),
      columns: [
        {
          id: "name",
          title: "Name",
          type: "text",
        },
        {
          id: "artist",
          title: "Artist",
          type: "text",
        },
        {
          id: "tonic",
          title: "Tonic",
          type: "text",
        },
        {
          id: "score",
          title: "Score",
          type: "number",
          step: 1,
        },
        {
          id: "mode",
          title: "Mode",
          type: "enum",
          options: ["major", "minor"],
        },
        {
          id: "tags",
          title: "Tags",
          type: "tags",
        },
      ],
      tagCache: {
        tags: ["tag1", "tag2", "tag3"],
      },
      rows: [
        {
          id: "1",
          values: {
            name: "Zeus no Chuusai",
            artist: "Revue Starlight",
            tonic: "B",
            score: "10",
            mode: "major",
            tags: "tag1, tag2",
          },
        },
        {
          id: "2",
          values: {
            name: "closing",
            artist: "White Album",
            tonic: "C#",
            score: "9",
            mode: "minor",
            tags: "tag2, tag3",
          },
        },
      ],
    },
  },
};

// DEBUGGING OUT

const DEBUG_DB_PATH = resolve(process.cwd(), "debug_db.json");

async function dumpDbToFile() {
  try {
    await writeFile(DEBUG_DB_PATH, JSON.stringify(db, null, 2), "utf-8");
  } catch (err) {
    console.error("Failed to write debug DB file:", err);
  }
}

// Dump every 2 seconds
if (process.env.NODE_ENV !== "production") {
  setInterval(() => {
    dumpDbToFile();
  }, 2000);
}
