// Not sure how well starlark runs in server, let's keep this in client instead of shared for now

import {
  createModule,
  DEFAULT_FORMULA,
  MAIN_FUNCTION,
  TAB_SPACES,
} from "@app/shared/formula";
import { parseRowvalue } from "@app/shared/sheetValidation";
import { Err, Ok, Result } from "@app/shared/types/result";
import { Row, SheetData } from "@app/shared/types/sheet";
import { Starlark } from "starlark-wasm";
import wasmUrl from "starlark-wasm/wasm?url";

// Data
export type ComputedValue = Result<unknown>;
export type ComputedRow = Record<string, ComputedValue | undefined>;
export type ComputedSheet = Record<string, ComputedRow | undefined>; // rowId -> columnId -> value

export interface RowWithComputed extends Row {
  formulaValues: ComputedRow;
}

export function injectComputedValues(
  rows: Row[],
  computedSheet: ComputedSheet,
): RowWithComputed[] {
  return rows.map((row) => {
    const computedSheetValues: Record<string, string> = {};
    for (const columnId in computedSheet[row.id]) {
      const value = computedSheet[row.id]?.[columnId];
      if (value?.ok) {
        computedSheetValues[columnId] = String(value.value);
      }
    }
    return {
      ...row,
      values: {
        ...row.values,
        ...computedSheetValues,
      },
      formulaValues: computedSheet[row.id] || {},
    };
  });
}

// Computation
type RowCall = {
  rowId: string;
  columnId: string;
  filename: string;
  code: string;
  injectedLineCount: number;
};

export const starlarkRuntimePromise = Starlark.init(wasmUrl);

let sheetCache: SheetData | null = null;
let valuesCache: ComputedSheet = {};

export async function computeSheetValues(
  sheetData: SheetData,
): Promise<ComputedSheet> {
  await starlarkRuntimePromise;

  const formulaColumns = sheetData.columns.filter(
    (column) => column.type === "formula",
  );

  const rowCalls: RowCall[] = [];

  for (const column of formulaColumns) {
    const columnCacheHit =
      JSON.stringify(sheetCache?.columns) === JSON.stringify(sheetData.columns);

    for (const row of sheetData.rows) {
      // Generate input
      const rowsInput = createRowInputParams(sheetData, row);
      if (columnCacheHit && sheetCache) {
        const cacheRow = sheetCache?.rows.find((r) => r.id === row.id);
        if (cacheRow) {
          const cachedInput = createRowInputParams(sheetCache, cacheRow);
          if (JSON.stringify(cachedInput) === JSON.stringify(rowsInput)) {
            continue;
          }
        }
      }

      // Fill up column by index
      for (let i = 0; i < sheetData.columns.length; i++) {
        const column = sheetData.columns[i];
        rowsInput[i] = parseRowvalue(column.type, row.values[column.id]);
      }
      const [code, injectedLineCount] = createModule(
        column.formula ?? DEFAULT_FORMULA,
        sheetData.columns.filter((c) => c.type !== "formula"),
        row,
      );
      rowCalls.push({
        rowId: row.id,
        columnId: column.id,
        filename: `formula_${row.id}_${column.id}.star`,
        code,
        injectedLineCount,
      });
    }
  }

  const files: Record<string, string> = {};

  for (const rowCall of rowCalls) {
    files[rowCall.filename] = rowCall.code;
  }

  const starklarkInstance = new Starlark({
    load: async (filename) => {
      return files[filename];
    },
    print: (msg) => console.log("[formula output] ", msg),
  });

  const computedValues: ComputedSheet = JSON.parse(JSON.stringify(valuesCache));

  const runPromises: Promise<unknown>[] = [];
  for (const rowCall of rowCalls) {
    runPromises.push(
      starklarkInstance
        .run(rowCall.filename, MAIN_FUNCTION, [], {}, 1)
        .then((result) => {
          const rowValues = computedValues[rowCall.rowId] ?? {};
          rowValues[rowCall.columnId] = Ok(result);
          computedValues[rowCall.rowId] = rowValues;
        })
        .catch((err) => {
          const rowValues = computedValues[rowCall.rowId] ?? {};

          rowValues[rowCall.columnId] = Err(
            String(
              adjustErrorLine(
                err,
                rowCall.filename,
                rowCall.injectedLineCount + 1,
              ),
            ),
          );
          computedValues[rowCall.rowId] = rowValues;
        }),
    );
  }
  await Promise.allSettled(runPromises);
  console.debug(`[TaggedDB] Computed ${rowCalls.length} rows`);
  sheetCache = JSON.parse(JSON.stringify(sheetData));
  valuesCache = JSON.parse(JSON.stringify(computedValues));
  return computedValues;
}

function createRowInputParams(
  sheetData: SheetData,
  row: Row,
): Record<string | number, string | number | null> {
  const rowsInput: Record<string | number, string | number | null> = {};
  const nonFormulaColumns = sheetData.columns.filter(
    (c) => c.type !== "formula",
  );
  // Fill up row values
  for (let i = nonFormulaColumns.length - 1; i >= 0; i--) {
    // go backward to first column name gets precedence
    const column = sheetData.columns[i];
    const rowValue = row.values[column.id];
    rowsInput[column.title] = parseRowvalue(column.type, rowValue);
  }
  return rowsInput;
}

// util
function adjustErrorLine(
  err: unknown,
  filename: string,
  offset: number,
): string {
  const errString = String(err);

  const startIndex = errString.indexOf(filename);
  if (startIndex === -1) return errString;

  // Get substring starting at filename
  const afterFile = errString.slice(startIndex);

  // file.star:line:column:...
  const parts = afterFile.split(":");

  if (parts.length < 3) return errString;

  const line = Number(parts[1]);
  const column = Number(parts[2]);

  if (Number.isNaN(line)) return errString;
  if (Number.isNaN(column)) return errString;

  const newLine = line - offset;
  const newColumn = column - TAB_SPACES.length + 1;

  // Rebuild only the location part
  const oldLocation = `${parts[0]}:${parts[1]}:${parts[2]}`;
  const newLocation = `${newLine}:${newColumn}`;

  return errString.replace(oldLocation, newLocation);
}
