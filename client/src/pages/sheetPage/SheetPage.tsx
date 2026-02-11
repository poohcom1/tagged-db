import { Column, ColumnValue, SheetData } from "@app/shared/sheets";
import * as migrator from "@app/shared/sheetMigration";
import { useCallback, useEffect, useState } from "react";
import { Cell } from "./components/Cell";
import { Table, Th, Thead, Tbody, HEADER_HEIGHT } from "./components/Table";
import styled from "styled-components";
import { useParams } from "react-router-dom";
import { IoIosAdd } from "react-icons/io";
import { HeaderCell } from "./components/HeaderCell";
import { ColumnEdit } from "./components/ColumnEdit";
import * as api from "../../lib/api";
import { BasicButton } from "../../components/BasicButton";

// Styles
const TableContainer = styled.div`
  margin: 32px;
  display: flex;
`;

const EmptySheetContainer = styled.div`
  margin: 32px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  font-size: larger;
  font-weight: 600;
`;

// - Column Button
const BUTTON_MARGIN = 8;

const AddColumnContainer = styled.div`
  height: ${HEADER_HEIGHT}px;
  width: ${HEADER_HEIGHT}px;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const AddColumnButton = styled(BasicButton)`
  height: ${HEADER_HEIGHT - BUTTON_MARGIN}px;
  width: ${HEADER_HEIGHT - BUTTON_MARGIN}px;
`;

// Component Page

export const SheetPage = () => {
  const sheetId = useParams<{ id: string }>().id ?? "";
  const [sheetData, setSheetData] = useState<SheetData | null>(null);
  const [currentEditColumnId, setCurrentEditColumnId] = useState<string | null>(
    null,
  );

  const loadSheets = useCallback(async () => {
    const res = await api.getSheet(sheetId);
    if (res.ok) {
      setSheetData(res.value);
    } else {
      alert(res.error);
    }
  }, [sheetId]);

  useEffect(() => {
    loadSheets();
  }, [loadSheets]);

  const onUpdateCell = useCallback(
    async (rowId: string, column: Column, value: ColumnValue) => {
      if (sheetData === null) {
        return;
      }
      const rowsResult = migrator.updateCell(
        sheetData,
        rowId,
        column.id,
        value,
      );
      if (!rowsResult.ok) {
        alert(rowsResult.error);
        loadSheets();
        return;
      }

      let tagCache: SheetData["tagCache"] | undefined;
      if (column.type === "tags") {
        tagCache = migrator.updateTagCache({
          ...sheetData,
          rows: rowsResult.value,
        });
      }
      setSheetData((s) =>
        s
          ? { ...s, rows: rowsResult.value, tagCache: tagCache ?? s.tagCache }
          : null,
      );

      const res = await api.updateCell(sheetId, rowId, column.id, value);
      if (!res.ok) {
        alert(res.error);
      }
    },
    [loadSheets, sheetData, sheetId],
  );

  const onUpdateColumn = useCallback(
    async (columnId: string, actions: migrator.ColumnEditAction[]) => {
      if (sheetData === null) {
        return;
      }

      let updatedSheetData = sheetData;
      for (const action of actions) {
        const columnUpdateResult = migrator.updateColumn(
          sheetData,
          columnId,
          action,
        );
        if (!columnUpdateResult.ok) {
          alert(columnUpdateResult.error);
          return;
        }
        updatedSheetData = columnUpdateResult.value;
      }
      setSheetData(updatedSheetData);

      const res = await api.updateColumnBatched(sheetId, columnId, actions);
      if (!res.ok) {
        alert(res.error);
        loadSheets();
      }
    },
    [loadSheets, sheetData, sheetId],
  );

  const addColumn = useCallback(async () => {
    if (sheetData === null) {
      return;
    }
    const column = migrator.createColumn(crypto.randomUUID());
    const updateRes = migrator.addColumn(sheetData, column);
    if (updateRes.ok) {
      setSheetData(updateRes.value);
      const res = await api.createColumn(
        sheetId,
        column.id,
        column.title,
        column.type,
      );
      if (!res.ok) {
        alert("Failed to create column on BE: " + res.error);
        loadSheets();
      }
    } else {
      alert("Failed to create column on FE: " + updateRes.error);
    }
  }, [loadSheets, sheetData, sheetId]);

  if (!sheetData) return null;

  return (
    <TableContainer>
      {/* Table */}
      <Table>
        <Thead>
          <tr>
            {sheetData?.columns.map((column) => (
              <Th key={column.id}>
                <HeaderCell
                  title={column.title}
                  onEdit={() => {
                    console.log("column edit: " + column.id);
                    setCurrentEditColumnId(column.id);
                  }}
                />
              </Th>
            ))}
          </tr>
        </Thead>
        <Tbody>
          {/* Rows */}
          {sheetData.rows.map((row) => (
            <tr key={row.id}>
              {sheetData.columns.map((column) => (
                <Cell
                  rowId={row.id}
                  key={column.id}
                  value={row.values[column.id]}
                  columnInfo={column}
                  onCellUpdate={onUpdateCell}
                  tagSuggestions={sheetData.tagCache[column.id]}
                />
              ))}
            </tr>
          ))}
        </Tbody>
      </Table>
      {sheetData.columns.length === 0 ? (
        <EmptySheetContainer>
          <div>Empty Sheet!</div>
          <button onClick={addColumn}>Add Column</button>
        </EmptySheetContainer>
      ) : (
        <AddColumnContainer>
          <AddColumnButton onClick={addColumn} title="Add Column">
            <IoIosAdd />
          </AddColumnButton>
        </AddColumnContainer>
      )}

      {/* Modals */}
      <ColumnEdit
        key={currentEditColumnId} // force state reset
        isOpen={!!currentEditColumnId}
        onClose={() => setCurrentEditColumnId(null)}
        columnId={currentEditColumnId}
        sheetData={sheetData}
        onCommit={(actions) => {
          if (!currentEditColumnId) {
            return;
          }
          onUpdateColumn(currentEditColumnId, actions);
          setCurrentEditColumnId(null);
        }}
      />
    </TableContainer>
  );
};
