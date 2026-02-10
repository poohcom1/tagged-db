import { NAME_COLUMN_ID, SheetData } from "@app/shared";
import { useCallback, useEffect, useState } from "react";
import { Cell } from "./components/Cell";
import { Table, Th, Td, Thead, Tbody } from "./components/Table";
import styled from "styled-components";

const TableContainer = styled.div`
  margin: 32px;
`;

export const SheetPage = () => {
  const [sheetData, setSheetData] = useState<SheetData | null>(null);

  useEffect(() => {
    fetch("/api/sheet-data/1")
      .then((res) => res.json())
      .then(setSheetData);
  }, []);

  const updateCell = useCallback(
    (id: number, rowId: string, columnId: string, value: string) => {
      fetch("/api/sheet-data/1", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ rowId, columnId, value }),
      }).then((res) => {
        if (!res.ok) {
          res.text().then(alert);
        }
      });
    },
    [],
  );

  if (!sheetData) return null;

  const columnOrder = sheetData.columns.map((column) => column.id);

  return (
    <TableContainer>
      <Table>
        <Thead>
          <tr>
            <Th>Name</Th>
            {sheetData?.columns.map((column) => (
              <Th key={column.id}>{column.title}</Th>
            ))}
          </tr>
        </Thead>
        <Tbody>
          {/* Rows */}
          {sheetData?.rows.map((row) => (
            <tr key={row.id}>
              <Cell
                rowId={row.id}
                key="_name"
                value={row.name}
                onChange={(value) => {
                  row.name = value as string;
                  updateCell(1, row.id, NAME_COLUMN_ID, value as string);
                  setSheetData({ ...sheetData });
                }}
              />
              {columnOrder?.map((columnId, ind) => (
                <Cell
                  rowId={row.id}
                  key={columnId}
                  value={row.values[columnId]}
                  columnInfo={sheetData.columns[ind]}
                  onChange={(value) => {
                    row.values[columnId] = value;
                    updateCell(1, row.id, columnId, value as string);
                    setSheetData({ ...sheetData });
                  }}
                  tagSuggestions={sheetData.tagCache[columnId]}
                />
              ))}
            </tr>
          ))}
        </Tbody>
      </Table>
      <input
        id="tags"
        name="tags"
        list="tag-suggestions"
        placeholder="tag1, tag2, tag3"
      />

      <datalist id="tag-suggestions">
        <option value="javascript"></option>
        <option value="typescript"></option>
        <option value="fastify"></option>
        <option value="node"></option>
        <option value="html"></option>
      </datalist>
    </TableContainer>
  );
};
