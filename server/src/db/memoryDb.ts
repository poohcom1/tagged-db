import { NAME_COLUMN_ID, Ok, type Sheet, type SheetData } from "@app/shared";
import type { DBInterface } from "../types.js";

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

    if (columnId === NAME_COLUMN_ID) {
      sheetData.rows.find((row) => row.id === rowId)!.name = value;
    } else {
      sheetData.rows.find((row) => row.id === rowId)!.values[columnId] = value;
    }

    console.log(sheetData);

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
          name: "Zeus no Chuusai",
          values: {
            artist: "Revue Starlight",
            tonic: "B",
            score: 10,
            mode: "major",
            tags: ["tag1", "tag2"],
          },
        },
        {
          id: "2",
          name: "closing",
          values: {
            artist: "White Album",
            tonic: "C#",
            score: 9,
            mode: "minor",
            tags: ["tag2", "tag3"],
          },
        },
      ],
    },
  },
};
