import { Column, ColumnType, EnumColumn, Row } from "./types/sheet.js";

export const MAIN_FUNCTION = "fx";
export const TAB_SPACES = "    ";

export const DEFAULT_FORMULA = `"""
This is python (starlark) code.
API:
  get_cell(column: int | str, num: int = 0) -> int | str

  get_dropdown_index(column: int | str, num: int = 0) -> int
  to_dropdown_value(value: str, name: str, num: int = 0) -> str

Return a value to determine the formula output.
"""
return None
`;

export const createModule = (
  formula: string,
  columns: Column[],
  row: Row,
): [string, number] => {
  if (!formula) {
    return [`def ${MAIN_FUNCTION}():\n${TAB_SPACES}return None\n`, 0];
  }

  const injects = createInjects(columns, row);
  let base = `${createInjects(columns, row)}\ndef ${MAIN_FUNCTION}():\n`;

  const formulaLines = formula.split("\n");

  for (let i = formulaLines.length - 1; i >= 0; i--) {
    const line = formulaLines[i]!;
    if (line.trim() === "") {
      formulaLines.splice(i, 1);
    } else {
      break;
    }
  }

  for (let i = 0; i < formulaLines.length; i++) {
    const line = formulaLines[i]!;

    if (i === formulaLines.length - 1 && !line.trim().startsWith("return ")) {
      base += `${TAB_SPACES}return ${line}\n`;
    } else {
      base += `${TAB_SPACES}${line}\n`;
    }
  }

  return [base, injects.split("\n").length];
};

interface CellsDict {
  columnName: string;
  value: any;
}
const pythonCellsDictString = (cellDict: CellsDict, columnType: ColumnType) =>
  `{ "column_name": ${serializeRowValue("text", cellDict.columnName)}, "value": ${serializeRowValue(columnType, cellDict.value)} }`;
const pythonDropdownColumnString = (column: EnumColumn, index: number) =>
  `{ "column_name": ${serializeRowValue("text", column.title)}, "index": ${index}, "values": [${(column.options || []).map((o) => `${serializeRowValue("text", o)}`).join(",")}] }`;

const functionInjects = (
  cellsArrString: string,
  dropdownColumnString: string,
) => `
__cells = ${cellsArrString}
__dropdown_columns = ${dropdownColumnString}

def get_cell(name_or_ind, num=0):
    if num < 0:
        fail("Occurrence index starts at 0!")

    # Integer column index
    if type(name_or_ind) == "int":
        if name_or_ind < 0:
            fail("Column index starts at 0!")

        if name_or_ind >= len(__cells):
            return ""

        return __cells[name_or_ind]["value"]

    # Column name
    i = 0
    for cell in __cells:
        if cell["column_name"] == name_or_ind:
            if i == num:
                return cell["value"]
            i = i + 1

    return ""


def get_dropdown_index(name_or_ind, num=0):
    if num < 0:
        fail("Occurrence index starts at 0!")

    value = get_cell(name_or_ind, num)
    column_dict = None

    if type(name_or_ind) == "int":
        if name_or_ind < 0:
            fail("Column index starts at 0!")

        for column in __dropdown_columns:
            if column["index"] == name_or_ind:
                column_dict = column
                break
    else:
        for column in __dropdown_columns:
            if column["column_name"] == name_or_ind:
                column_dict = column
                break

    if column_dict != None:
        i = 0
        for v in column_dict["values"]:
            if v == value:
                return i
            i = i + 1

    return None


def to_dropdown_value(value, name_or_ind, num=0):
    if num < 0:
        fail("Occurrence index starts at 0!")

    column_dict = None

    if type(name_or_ind) == "int":
        if name_or_ind < 0:
            fail("Column index starts at 0!")

        for column in __dropdown_columns:
            if column["index"] == name_or_ind:
                column_dict = column
                break
    else:
        for column in __dropdown_columns:
            if column["column_name"] == name_or_ind:
                column_dict = column
                break

    if column_dict != None:
        if value < 0:
            return None
        if value >= len(column_dict["values"]):
            return None
        return column_dict["values"][value]

    return None
`;

export const BUILT_IN_FUNCS = [
  "get_cell",
  "get_dropdown_index",
  "to_dropdown_value",
];

export function getColumnInjectedVariables(columns: Column[]) {
  const injectedNames: string[] = [];
  for (const column of columns) {
    const varName = sanitizeStarlarkVar(column.title);
    if (injectedNames.includes(varName)) {
      continue;
    }
    injectedNames.push(varName);
  }
  return injectedNames;
}

const createInjects = (columns: Column[], row: Row): string => {
  let injects = "";
  // Magic names
  const injected: string[] = [];
  for (const column of columns) {
    const varName = sanitizeStarlarkVar(column.title);
    if (injected.includes(varName)) {
      continue;
    }
    injected.push(varName);
    injects += `${varName} = ${serializeRowValue(column.type, row.values[column.id])}\n`;
  }
  // Global functions
  const pythonDictItems = [];
  for (const column of columns) {
    pythonDictItems.push(
      pythonCellsDictString(
        { columnName: column.title, value: row.values[column.id] },
        column.type,
      ),
    );
  }

  const pythonDictArr = `[${pythonDictItems.join(", ")}]`;
  const pythonColumnArr = `[${columns
    .filter((c) => c.type === "enum")
    .map((c, i) => pythonDropdownColumnString(c, i))
    .join(", ")}]`;
  injects += functionInjects(pythonDictArr, pythonColumnArr);
  return injects;
};

export const serializeRowValue = (
  columnType: ColumnType,
  value: string | undefined,
): string => {
  if (columnType === "number") {
    return Number(value).toString();
  } else if (value !== undefined && value !== null) {
    value = value.replace(/"/g, '\\"');
    return `"${value}"`;
  }
  return '""';
};

export const sanitizeStarlarkVar = (columnName: string): string => {
  // Make it pyton compatible
  const RESERVED_PYTHON_KEYWORDS = [
    "and",
    "as",
    "assert",
    "break",
    "class",
    "continue",
    "def",
    "del",
    "elif",
    "else",
    "except",
    "exec",
    "finally",
    "for",
    "from",
    "global",
    "if",
    "import",
    "in",
    "is",
    "lambda",
    "not",
    "or",
    "pass",
    "print",
    "raise",
    "return",
    "try",
    "while",
    "with",
    "yield",
  ];
  if (RESERVED_PYTHON_KEYWORDS.includes(columnName)) {
    columnName = columnName + "_";
  }
  return columnName.replace(" ", "_").replace(/[^a-zA-Z0-9_]/g, "");
};
