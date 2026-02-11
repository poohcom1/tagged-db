import { Column, ColumnValue, SheetData } from "@app/shared/sheets";
import * as migrator from "@app/shared/sheetMigration";
import { useCallback, useEffect, useState } from "react";
import { Cell } from "./components/Cell";
import { Table, Th, Thead, Tbody, HEADER_HEIGHT } from "./components/Table";
import styled from "styled-components";
import { useParams } from "react-router-dom";
import { BaseButton } from "../../components/BaseButton";
import { IoIosAdd } from "react-icons/io";
import { HeaderCell } from "./components/HeaderCell";
import { EditModalContainer } from "../../components/EditModalContainer";
import { ColumnEdit } from "./components/ColumnEdit";
import * as api from "../../lib/api";

// Styles
const TableContainer = styled.div`
  margin: 32px;
  display: flex;
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

const AddColumnButton = styled(BaseButton)`
  height: ${HEADER_HEIGHT - BUTTON_MARGIN}px;
  width: ${HEADER_HEIGHT - BUTTON_MARGIN}px;
  justify-content: center;
  align-items: center;

  &:hover {
    background-color: #b4b4b4;
  }
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
      const res = await api.updateCell(sheetId, rowId, column.id, value);
      if (!res.ok) {
        alert(res.error);
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
    },
    [loadSheets, sheetData, sheetId],
  );

  const onUpdateColumn = useCallback(
    async (columnId: string, actions: migrator.ColumnEditAction[]) => {
      if (sheetData === null) {
        return;
      }
      api.updateColumnBatched(sheetId, columnId, actions).then((res) => {
        if (!res.ok) {
          alert(res.error);
          loadSheets();
        }
      });

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
    },
    [loadSheets, sheetData, sheetId],
  );

  const addColumn = useCallback(() => {}, []);

  if (!sheetData) return null;

  console.log(sheetData.tagCache);

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
                  onEdit={() => setCurrentEditColumnId(column.id)}
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
      <AddColumnContainer>
        <AddColumnButton onClick={addColumn} title="Add Column">
          <IoIosAdd />
        </AddColumnButton>
      </AddColumnContainer>
      {/* Modals */}
      <EditModalContainer
        isOpen={!!currentEditColumnId}
        onClose={() => setCurrentEditColumnId(null)}
      >
        <ColumnEdit
          key={currentEditColumnId} // force state reset
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
      </EditModalContainer>
    </TableContainer>
  );
};
