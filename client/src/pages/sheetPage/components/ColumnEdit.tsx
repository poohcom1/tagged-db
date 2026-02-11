import { ColumnEditAction, ColumnEditType } from "@app/shared/sheetMigration";
import { Column, ColumnType, SheetData } from "@app/shared/sheets";
import { useState } from "react";
import styled from "styled-components";

// Style
const Container = styled.div`
  flex-grow: 1;
`;

const Title = styled.div`
  font-weight: 600;
  font-size: large;
`;

const EditTable = styled.table`
  width: 100%;
`;

const ButtonRow = styled.div`
  margin-top: 16px;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
`;

// Component

const COLUMN_TYPES: ColumnType[] = ["text", "number", "enum", "tags"];
const COLUMN_TYPE_NAMES: Record<ColumnType, string> = {
  text: "Text",
  number: "Number",
  enum: "Dropdown",
  tags: "Tags",
};

interface Prop {
  columnId: string | null;
  sheetData: SheetData;
  onCommit?: (actions: ColumnEditAction[]) => void;
}

export const ColumnEdit = ({ columnId, sheetData, onCommit }: Prop) => {
  const [column, setColumn] = useState<Column | undefined>(
    sheetData.columns.find((c) => c.id === columnId),
  );
  const [actions, setActions] = useState<ColumnEditAction[]>([]);

  let AdvancedEdit = null;

  switch (column?.type) {
    case "text":
      break;
    case "number":
      AdvancedEdit = (
        <>
          <EditRow label="Max">
            <input
              type="number"
              id="max"
              name="max"
              placeholder="Leave empty for none"
              defaultValue={column.max}
            />
          </EditRow>
          <EditRow label="Min">
            <input
              type="number"
              id="min"
              name="min"
              placeholder="Leave empty for none"
              defaultValue={column.min}
            />
          </EditRow>
          <EditRow label="Step">
            <input
              type="number"
              id="step"
              name="step"
              placeholder="Leave empty for none"
              defaultValue={column.step}
            />
          </EditRow>
        </>
      );
      break;
    case "enum":
      AdvancedEdit = (
        <>
          {(column.options || []).map((option, index) => (
            <EditRow key={index} label={`Option ${index + 1}`}>
              <div style={{ display: "flex", gap: 4 }}>
                <input
                  type="text"
                  value={option}
                  onChange={(e) =>
                    setActions((a) => [
                      ...a,
                      {
                        editType: ColumnEditType.EnumRename,
                        value: option,
                        newValue: e.target.value,
                      },
                    ])
                  }
                />

                <button type="button">×</button>
                <button
                  type="button"
                  // onClick={() => enumReorder(index, "up")}
                >
                  ↑
                </button>

                <button type="button">↓</button>
              </div>
            </EditRow>
          ))}
          <EditRow label="">
            <button type="button">+ Add option</button>
          </EditRow>
        </>
      );
      break;
  }

  if (!columnId) {
    return null;
  }

  if (!column) {
    return null;
  }

  return (
    <Container>
      <Title>Column Settings</Title>
      <br />
      <EditTable>
        <tbody>
          <EditRow label="Title">
            <input
              type="text"
              id="title"
              name="title"
              defaultValue={column.title}
              autoFocus
              onChange={(e) =>
                setActions((a) => [
                  ...a,
                  { editType: ColumnEditType.Rename, title: e.target.value },
                ])
              }
            />
          </EditRow>
          <EditRow label="Type">
            <select
              id="type"
              name="type"
              defaultValue={column.type}
              onChange={(e) => {
                setActions((a) => [
                  ...a,
                  {
                    editType: ColumnEditType.ChangeType,
                    toType: e.target.value as ColumnType,
                  },
                ]);
                setColumn((c) =>
                  c
                    ? {
                        ...c,
                        type: e.target.value as ColumnType,
                      }
                    : undefined,
                );
              }}
            >
              {COLUMN_TYPES.map((type) => (
                <option key={type} value={type}>
                  {COLUMN_TYPE_NAMES[type]}
                </option>
              ))}
            </select>
          </EditRow>
        </tbody>
      </EditTable>
      {AdvancedEdit && <hr style={{ opacity: "50%" }} />}
      <EditTable>
        <tbody>{AdvancedEdit}</tbody>
      </EditTable>
      <ButtonRow>
        <button
          onClick={() => {
            onCommit?.(actions);
            setActions([]);
          }}
        >
          Submit
        </button>
        <button>Delete</button>
      </ButtonRow>
    </Container>
  );
};

interface EditRowProps {
  children?: React.ReactNode;
  label: string;
}
const Td = styled.td`
  padding-top: 8px;
  font-size: small;
`;
const TdLabel = styled(Td)``;

const EditRow = ({ label, children }: EditRowProps) => {
  return (
    <tr>
      <TdLabel>{label}</TdLabel>
      <Td>{children}</Td>
    </tr>
  );
};
