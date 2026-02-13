import { Column, ColumnValue, SheetData } from "@app/shared/types/sheet";
import * as migrator from "@app/shared/sheetMigration";
import { useCallback, useEffect, useState } from "react";
import { Cell } from "./components/Cell";
import { Table, Th, Thead, Tbody, HEADER_HEIGHT, Td } from "./components/Table";
import styled from "styled-components";
import { useParams } from "react-router-dom";
import { IoIosAdd } from "react-icons/io";
import { HeaderCell } from "./components/HeaderCell";
import { ColumnEdit } from "./components/ColumnEdit";
import { BasicButton } from "../../components/BasicButton";
import { EditButton } from "../../components/EditButton";
import { ColumnEditAction, SheetAction } from "@app/shared/types/action";
import { useStorageBackend } from "../../storageBackends/useBackend";
import { COLORS } from "../../styles/colors";
import { FaFileCsv } from "react-icons/fa6";
import { IoMdClose } from "react-icons/io";
import { border } from "../../styles/mixins";
import { DesktopHeader } from "../../components/desktop/DesktopHeader";

// Styles
const Background = styled.div`
  position: absolute;
  height: 100vh;
  width: 100vw;

  background-color: ${COLORS.DESKTOP};
`;

const MainContainer = styled.div`
  margin: 48px;

  display: flex;
  flex-direction: column;

  padding: 6px;
  color: black;
  background-color: ${COLORS.PANEL};
  ${border({})};

  width: fit-content;
`;

const FileHeader = styled.div`
  color: white;
  background-color: ${COLORS.HEADER};
  padding: 4px 8px;
  margin-bottom: 4px;

  display: flex;
  align-items: center;
  gap: 8px;
`;

const FileHeaderCloseButton = styled.button`
  margin-left: auto;

  background-color: ${COLORS.PANEL};
  ${border({ thickness: 2 })};

  &:hover {
    cursor: pointer;
  }
`;

const VContainer = styled.div`
  display: flex;
  flex-direction: column;

  border-top: 2px solid grey;
  border-left: 2px solid grey;
  background-color: white;
  padding: 8px;
  /* flex-grow: 1; */
`;

// - Right column container
const AddColumnTh = styled.th`
  background-color: ${COLORS.WHITE};
  width: ${HEADER_HEIGHT}px;
  border: 2px dotted #0000006f;
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
  border: 2px dotted #0000006f;
`;

const AddRowContainer = styled(AddContainer)`
  height: ${HEADER_HEIGHT}px;
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
  const { storageBackend } = useStorageBackend();
  const sheetId = useParams<{ id: string }>().id ?? "";
  const [sheetData, setSheetData] = useState<SheetData | null>(null);
  const [currentEditColumnId, setCurrentEditColumnId] = useState<string | null>(
    null,
  );

  useEffect(() => {
    if (sheetData) {
      document.title = sheetData.name + " | MyTaggedDB";
    } else {
      document.title = "Loading... | MyTaggedDB";
    }
  }, [sheetData]);

  const loadSheet = useCallback(async () => {
    const res = await storageBackend.getSheetData(sheetId);
    if (res.ok) {
      setSheetData(res.value);
    } else {
      alert(res.error);
    }
  }, [sheetId, storageBackend]);

  useEffect(() => {
    loadSheet();
  }, [loadSheet]);

  const onUpdateCell = useCallback(
    async (rowId: string, column: Column, value: ColumnValue) => {
      if (sheetData === null) {
        return;
      }
      const action: SheetAction = {
        action: "update_cell",
        params: {
          rowId,
          columnId: column.id,
          value,
        },
      };
      const rowsResult = migrator.reduce(sheetData, action);
      if (!rowsResult.ok) {
        alert(rowsResult.error);
        return;
      }
      setSheetData(rowsResult.value);

      storageBackend.updateSheet(sheetId, action).then((res) => {
        if (!res.ok) {
          alert(res.error);
          loadSheet();
        }
      });
    },
    [loadSheet, sheetData, sheetId, storageBackend],
  );

  if (!sheetData) return null;

  const onUpdateColumn = (columnId: string, actions: ColumnEditAction[]) => {
    if (actions.length === 0) {
      return;
    }

    const action: SheetAction = {
      action: "update_column_batched",
      params: {
        columnId,
        actions,
      },
    };
    const updatedSheetData = migrator.reduce(sheetData, action);
    if (!updatedSheetData.ok) {
      alert(updatedSheetData.error);
      return;
    }
    setSheetData(updatedSheetData.value);

    storageBackend.updateSheet(sheetId, action).then((res) => {
      if (!res.ok) {
        alert(res.error);
        loadSheet();
      }
    });
  };

  const onDeleteColumn = (columnId: string) => {
    const action: SheetAction = {
      action: "delete_column",
      params: {
        columnId,
      },
    };
    const updatedRes = migrator.reduce(sheetData, action);
    if (!updatedRes.ok) {
      alert("Failed to delete column: " + updatedRes.error);
      return;
    }
    setSheetData(updatedRes.value);
    storageBackend.updateSheet(sheetId, action).then((res) => {
      if (!res.ok) {
        alert("[Server Error] Failed to delete column: " + res.error);
        loadSheet();
      }
    });
  };

  const onAddColumn = async () => {
    const action: SheetAction = {
      action: "add_column",
      params: {
        title: "Untitled column",
        type: "text",
        columnId: crypto.randomUUID(),
      },
    };

    const updateRes = migrator.reduce(sheetData, action);
    if (!updateRes.ok) {
      alert("Failed to create column: " + updateRes.error);
      return;
    }
    setSheetData(updateRes.value);
    const res = await storageBackend.updateSheet(sheetId, action);
    if (!res.ok) {
      alert("[Server Error] Failed to create column: " + res.error);
      loadSheet();
    }
  };

  const onAddRow = async () => {
    const action: SheetAction = {
      action: "add_row",
      params: {
        rowId: crypto.randomUUID(),
      },
    };
    const updatedRes = migrator.reduce(sheetData, action);
    if (!updatedRes.ok) {
      alert("Failed to create row: " + updatedRes.error);
      return;
    }
    setSheetData(updatedRes.value);
    storageBackend.updateSheet(sheetId, action).then((res) => {
      if (!res.ok) {
        alert("[Server Error] Failed to create row: " + res.error);
        loadSheet();
      }
    });
  };

  const onDeleteRow = (rowId: string) => {
    if (!confirm("Are you sure you want to delete this row?")) {
      return;
    }
    const action: SheetAction = {
      action: "delete_row",
      params: {
        rowId,
      },
    };
    const updatedRes = migrator.reduce(sheetData, action);
    if (!updatedRes.ok) {
      alert("Failed to delete row: " + updatedRes.error);
      return;
    }
    setSheetData(updatedRes.value);
    storageBackend.updateSheet(sheetId, action).then((res) => {
      if (!res.ok) {
        alert("[Server Error] Failed to delete row: " + res.error);
        loadSheet();
      }
    });
  };

  return (
    <Background>
      <DesktopHeader />
      <MainContainer>
        <FileHeader>
          <FaFileCsv /> {sheetData.name}.csv
          <FileHeaderCloseButton
            title={`Close ${sheetData.name}`}
            onClick={() =>
              (window.location.href = "/?" + storageBackend.queryParam)
            }
          >
            <IoMdClose />
          </FileHeaderCloseButton>
        </FileHeader>

        <VContainer>
          {/* Table */}
          <Table style={{ flexGrow: 1 }}>
            <Thead>
              <tr>
                {sheetData?.columns.map((column, ind) => (
                  <Th key={column.id}>
                    <HeaderCell
                      title={column.title}
                      onEdit={() => {
                        console.log("column edit: " + column.id);
                        setCurrentEditColumnId(column.id);
                      }}
                      index={ind}
                      total={sheetData.columns.length}
                      onLeft={() =>
                        onUpdateColumn(column.id, [
                          {
                            editType: "reorder",
                            toIndex: ind - 1,
                          },
                        ])
                      }
                      onRight={() =>
                        onUpdateColumn(column.id, [
                          {
                            editType: "reorder",
                            toIndex: ind + 1,
                          },
                        ])
                      }
                    />
                  </Th>
                ))}
                <AddColumnTh>
                  <AddColumnButton onClick={onAddColumn} title="Add Column">
                    <IoIosAdd />
                  </AddColumnButton>
                </AddColumnTh>
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
              <AddRowButton onClick={onAddRow} title="Add row">
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
          onSubmit={(actions) => {
            if (!currentEditColumnId) {
              return;
            }
            onUpdateColumn(currentEditColumnId, actions);
            setCurrentEditColumnId(null);
          }}
          onDelete={() => {
            if (!currentEditColumnId) {
              return;
            }
            onDeleteColumn(currentEditColumnId);
            setCurrentEditColumnId(null);
          }}
        />
      </MainContainer>
    </Background>
  );
};
