import { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import { EditButton } from "../../../../components/EditButton";

const Container = styled.div`
  display: flex;
  align-items: center;
  flex-grow: 1;
  gap: 4px;
  width: fix-content;
`;

const CustomEditButton = styled(EditButton)`
  margin-left: auto;
  text-align: right;
  min-width: 25px;
`;

interface InputComponentProps {
  currentValue?: string;
  setCurrentValue?: (value: string) => void;

  editing: boolean;
  setEditing: (editing: boolean) => void;

  onBlur: (e: React.FocusEvent) => void;
  inputRef: React.RefObject<HTMLInputElement | null>;
}

interface Props {
  value?: string;
  onChange?: (value: string) => void;
  autoResize?: boolean;
  displayComponent?: (props: { value?: string }) => React.ReactNode;
  inputComponent: (props: InputComponentProps) => React.ReactNode;
}

export const BaseTextEdit = ({
  value,
  onChange,
  displayComponent,
  inputComponent,
  autoResize,
}: Props) => {
  const [currentValue, setCurrentValue] = useState(value);
  const [editing, setEditing] = useState(false);
  const [displayWidth, setDisplayWidth] = useState<number | undefined>(
    undefined,
  );

  useEffect(() => {
    setCurrentValue(value);
  }, [value]);

  useEffect(() => {
    setDisplayWidth(measureRef.current?.scrollWidth);
  }, [currentValue]);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const saveRef = useRef<HTMLButtonElement>(null);

  const measureRef = useRef<HTMLDivElement>(null);

  const startEdit = () => {
    setEditing(true);
    setTimeout(() => inputRef.current?.select(), 50);
  };

  const onBlur = (e: React.FocusEvent) => {
    if (e.relatedTarget === saveRef.current) {
      return;
    }
    setCurrentValue(currentValue ?? "");
    setEditing(false);
  };

  return (
    <Container ref={containerRef}>
      {autoResize ? (
        <div
          tabIndex={0}
          onFocus={startEdit}
          ref={measureRef}
          style={{
            ...(editing
              ? {
                  position: "absolute",
                  opacity: "0",
                  pointerEvents: "none",
                  whiteSpace: "nowrap",
                }
              : {}),
            margin: "0px",
            padding: "8px",
            border: "2px solid transparent",
          }}
        >
          {displayComponent?.({ value }) ?? (
            <span style={{ fontWeight: 600 }}>
              {editing ? currentValue : value}
            </span>
          )}
        </div>
      ) : (
        !editing && (
          <div
            tabIndex={0}
            onFocus={startEdit}
            ref={measureRef}
            style={{
              margin: "0px",
              padding: "8px",
              border: "2px solid transparent",
            }}
          >
            {displayComponent?.({ value }) ?? (
              <span style={{ fontWeight: 600 }}>
                {editing ? currentValue : value}
              </span>
            )}
          </div>
        )
      )}
      {editing && (
        <div
          style={{
            flexGrow: currentValue ? 0 : 1,
            width: autoResize ? displayWidth + "px" : undefined,
          }}
        >
          {inputComponent({
            currentValue,
            setCurrentValue: onChange,
            editing,
            setEditing,
            inputRef,
            onBlur,
          })}
        </div>
      )}
      <CustomEditButton
        tabIndex={-1}
        ref={saveRef}
        onClick={() => {
          if (!editing) {
            startEdit();
          } else {
            onChange?.(currentValue ?? "");
            setEditing(false);
            inputRef.current?.blur();
          }
        }}
      >
        {!editing ? "edit" : "save"}
      </CustomEditButton>
    </Container>
  );
};
