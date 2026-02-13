import { Column, ColumnValue, SheetData } from "@app/shared/sheets";
import * as migrator from "@app/shared/sheetMigration";
import { useCallback, useEffect, useState } from "react";
import { Cell } from "./components/Cell";
import { Table, Th, Thead, Tbody, HEADER_HEIGHT, Td } from "./components/Table";
import styled from "styled-components";
import { useParams } from "react-router-dom";
import { IoIosAdd } from "react-icons/io";
import { HeaderCell } from "./components/HeaderCell";
import { ColumnEdit } from "./components/ColumnEdit";
import { storageBackend } from "../../lib/storageBackend";
import { BasicButton } from "../../components/BasicButton";
import { EditButton } from "../../components/EditButton";

// Styles
const MainContainer = styled.div`
  margin: 32px;
  display: flex;
`;

const VContainer = styled.div`
  display: flex;
  flex-direction: column;
  /* flex-grow: 1; */
`;

// - Right column container
const AddColumn = styled.td`
  background-color: white;
  width: ${HEADER_HEIGHT}px;
  border: 1px dotted #0000006f;
`;

const DelRowContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
`;

// - Column Button
const AddContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  border: 1px dotted #0000006f;
`;

const AddRowContainer = styled(AddContainer)`
  height: ${HEADER_HEIGHT}px;
  width: 100%;
`;

const AddColumnButton = styled(BasicButton)`
  height: ${HEADER_HEIGHT}px;
  width: ${HEADER_HEIGHT}px;
`;
const AddRowButton = styled(AddColumnButton)`
  height: ${HEADER_HEIGHT}px;
  width: 100%;
`;

// Component Page

export const SheetPage = () => {
  const sheetId = useParams<{ id: string }>().id ?? "";
  const [sheetData, setSheetData] = useState<SheetData | null>(null);
  const [currentEditColumnId, setCurrentEditColumnId] = useState<string | null>(
    null,
  );

  useEffect(() => {
    if (sheetData) {
      document.title = sheetData.name + " | TaggedDB";
    } else {
      document.title = "Loading... | TaggedDB";
    }
  }, [sheetData]);

  const loadSheets = useCallback(async () => {
    const res = await storageBackend.getSheet(sheetId);
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

      const res = await storageBackend.updateCell(
        sheetId,
        rowId,
        column.id,
        value,
      );
      if (!res.ok) {
        alert(res.error);
      }
    },
    [loadSheets, sheetData, sheetId],
  );

  if (!sheetData) return null;

  const onUpdateColumn = async (
    columnId: string,
    actions: migrator.ColumnEditAction[],
  ) => {
    if (actions.length === 0) {
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

    const res = await storageBackend.updateColumnBatched(
      sheetId,
      columnId,
      actions,
    );
    if (!res.ok) {
      alert(res.error);
      loadSheets();
    }
  };

  const addColumn = async () => {
    const column = migrator.createColumn(crypto.randomUUID());
    const updateRes = migrator.addColumn(sheetData, column);
    if (updateRes.ok) {
      setSheetData(updateRes.value);
      const res = await storageBackend.createColumn(
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
  };

  const addRow = async () => {
    const id = crypto.randomUUID();
    const updatedRes = migrator.addRow(sheetData, id);
    if (updatedRes.ok) {
      setSheetData({ ...sheetData, rows: updatedRes.value });
      const res = await storageBackend.createRow(sheetId, id);
      if (!res.ok) {
        alert("Failed to create row on BE: " + res.error);
        loadSheets();
      }
    } else {
      alert("Failed to create row on FE: " + updatedRes.error);
    }
  };

  const onDeleteRow = async (rowId: string) => {
    if (!confirm("Are you sure you want to delete this row?")) {
      return;
    }

    const updatedRes = migrator.deleteRow(sheetData, rowId);
    if (updatedRes.ok) {
      setSheetData({ ...sheetData, rows: updatedRes.value });
    }
  };

  return (
    <MainContainer>
      <VContainer>
        {/* Table */}
        <Table style={{ flexGrow: 1 }}>
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
              <AddColumn>
                <AddColumnButton onClick={addColumn} title="Add Column">
                  <IoIosAdd />
                </AddColumnButton>
              </AddColumn>
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

                <Td key="_del">
                  <DelRowContainer onClick={() => onDeleteRow(row.id)}>
                    <EditButton>del</EditButton>
                  </DelRowContainer>
                </Td>
              </tr>
            ))}
          </Tbody>
        </Table>

        {sheetData.columns.length !== 0 && (
          <AddRowContainer>
            <AddRowButton onClick={addRow} title="Add row">
              <IoIosAdd />
            </AddRowButton>
          </AddRowContainer>
        )}
      </VContainer>

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
    </MainContainer>
  );
};
