import * as migration from "@app/shared/sheetMigration";
import type { DBInterface } from "../types.js";
import { Err, Ok } from "@app/shared/result";
import { type Sheet, type SheetData } from "@app/shared/sheets";

export const memoryDb: DBInterface = {
  async createSheet() {
    return Ok({ id: "1", name: "Sheet 1" });
  },
  async getSheets() {
    return Ok([{ id: "1", name: "Sheet 1" }]);
  },
  async getSheetData(id: string) {
    return db.sheetData[id];
  },

  async updateSheetDataCell(id, rowId, columnId, value) {
    const sheetData = db.sheetData[id];

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

    return Ok();
  },

  // Column
  async updateColumn(id, columnId, payload) {
    const sheetData = db.sheetData[id];
    if (!sheetData) {
      return Err("Sheet not found");
    }
    const res = migration.updateColumn(sheetData, columnId, payload);
    if (!res.ok) {
      return Err(res.error);
    }
    db.sheetData[id] = res.value;
    return Ok();
  },
  async updateColumnBatched(id, columnId, payloads) {
    let sheetData = db.sheetData[id];
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

    db.sheetData[id] = sheetData;
    return Ok();
  },
};

const db: {
  sheets: Record<string, Sheet>;
  sheetData: Record<string, SheetData>;
} = {
  sheets: {},
  sheetData: {
    "1": {
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
