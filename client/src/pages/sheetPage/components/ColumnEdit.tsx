import { ColumnEditAction, ColumnEditType } from "@app/shared/sheetMigration";
import { Column, ColumnType, SheetData } from "@app/shared/sheets";
import { addDefaultEnum, validateEnums } from "@app/shared/sheetValidation";
import { useCallback, useEffect, useRef, useState } from "react";
import styled from "styled-components";
import { EditModalContainer } from "../../../components/EditModalContainer";

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
  isOpen: boolean;
  onClose: () => void;

  columnId: string | null;
  sheetData: SheetData;
  onCommit?: (actions: ColumnEditAction[]) => void;
}

export const ColumnEdit = ({
  columnId,
  sheetData,
  onCommit,
  isOpen,
  onClose,
}: Prop) => {
  const [column, setColumn] = useState<Column | undefined>(
    sheetData.columns.find((c) => c.id === columnId),
  );

  const actions = useRef<Partial<Record<ColumnEditType, ColumnEditAction>>>({});
  const currentColumnId = useRef<string | null>(null);
  // Enum States
  const [enumOptions, setEnumOptions] = useState<string[]>([]);

  useEffect(() => {
    if (columnId !== currentColumnId.current) {
      currentColumnId.current = columnId;
      setColumn(sheetData.columns.find((c) => c.id === columnId));
      actions.current = {};
      if (column && "options" in column) {
        setEnumOptions(column?.options || []);
      }
    }
  }, [column, columnId, sheetData.columns]);

  const onCommitAction = useCallback(() => {
    if (!column) return;

    const actionArr: ColumnEditAction[] = [];
    for (const action of Object.values(actions.current)) {
      actionArr.push(action);
    }
    if (column.type === "enum") {
      const res = validateEnums(enumOptions);
      if (!res.ok) {
        alert(res.error);
        return;
      }
      actionArr.push({
        editType: ColumnEditType.EnumUpdate,
        values: enumOptions,
      });
    }
    onCommit?.(actionArr);
    actions.current = {};
  }, [column, enumOptions, onCommit]);

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
          {enumOptions.map((option, index) => (
            <EditRow key={index} label={`Option ${index + 1}`}>
              <div style={{ display: "flex", gap: 4 }}>
                <input
                  type="text"
                  value={option}
                  onChange={(e) =>
                    setEnumOptions((o) => {
                      o[index] = e.target.value;
                      return [...o];
                    })
                  }
                />
                <button
                  type="button"
                  onClick={() =>
                    setEnumOptions((o) => o.filter((_, i) => i !== index))
                  }
                >
                  ×
                </button>
                <button
                  type="button"
                  disabled={index === 0}
                  onClick={() =>
                    setEnumOptions((o) => {
                      const copy = [...o];
                      [copy[index - 1], copy[index]] = [
                        copy[index],
                        copy[index - 1],
                      ];
                      return copy;
                    })
                  }
                >
                  ↑
                </button>

                <button
                  type="button"
                  disabled={index === enumOptions.length - 1}
                  onClick={() =>
                    setEnumOptions((o) => {
                      const copy = [...o];
                      [copy[index + 1], copy[index]] = [
                        copy[index],
                        copy[index + 1],
                      ];
                      return copy;
                    })
                  }
                >
                  ↓
                </button>
              </div>
            </EditRow>
          ))}
          <EditRow label="">
            <button
              type="button"
              onClick={() => setEnumOptions((o) => addDefaultEnum(o))}
            >
              + Add option
            </button>
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
    <EditModalContainer isOpen={isOpen} onClose={onClose}>
      <Container
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            onCommitAction();
          } else if (e.key === "Escape") {
            onClose();
          }
        }}
      >
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
                  (actions.current[ColumnEditType.Rename] = {
                    editType: ColumnEditType.Rename,
                    title: e.target.value,
                  })
                }
              />
            </EditRow>
            <EditRow label="Type">
              <select
                id="type"
                name="type"
                defaultValue={column.type}
                onChange={(e) => {
                  actions.current[ColumnEditType.ChangeType] = {
                    editType: ColumnEditType.ChangeType,
                    toType: e.target.value as ColumnType,
                  };
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
          <button onClick={onCommitAction}>Update</button>
          <button
            onClick={() => {
              if (
                confirm(
                  `Are you sure you want to delete column "${column.title}"?`,
                )
              ) {
                onCommit?.([
                  {
                    editType: ColumnEditType.Delete,
                  },
                ]);
              }
            }}
          >
            Delete
          </button>
        </ButtonRow>
      </Container>
    </EditModalContainer>
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
