import { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import { EditButton } from "../../../../components/EditButton";

const Container = styled.div`
  display: flex;
  align-items: center;
  flex-grow: 1;
  gap: 4px;
`;

const Input = styled.input`
  padding: 0;
  // Hide arrows
  -moz-appearance: textfield;
  -webkit-inner-spin-button,
  -webkit-outer-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
  min-width: 25px;
`;

const CustomEditButton = styled(EditButton)`
  margin-left: auto;
  text-align: right;
  min-width: 25px;
`;

interface Props {
  onChange?: (value: string) => void;
  value?: string;
}

export const NumberEdit = ({ value, onChange }: Props) => {
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
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  return (
    <Container ref={containerRef}>
      <div
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
        <span>{editing ? currentValue : value}</span>
      </div>
      <Input
        type="text"
        inputMode="decimal"
        style={{ width: displayWidth + "px" }}
        hidden={!editing}
        ref={inputRef}
        value={currentValue}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            onChange?.(currentValue ?? "");
            setEditing(false);
            inputRef.current?.blur();
          } else if (e.key === "Escape") {
            setEditing(false);
            inputRef.current?.blur();
          }
          const allowedControlKeys = [
            "Backspace",
            "Delete",
            "ArrowLeft",
            "ArrowRight",
            "Tab",
            "Home",
            "End",
          ];

          if (allowedControlKeys.includes(e.key)) return;
          if (e.ctrlKey || e.metaKey) return;
          const value = inputRef.current?.value ?? "";
          if (e.key >= "0" && e.key <= "9") return;
          if (e.key === "." && !value.includes(".")) return;
          if (
            e.key === "-" &&
            inputRef.current?.selectionStart === 0 &&
            !value.includes("-")
          )
            return;
          e.preventDefault();
        }}
        onChange={(e) => {
          setCurrentValue(e.target.value);
        }}
        onBlur={(e) => {
          if (e.relatedTarget === saveRef.current) {
            return;
          }
          onChange?.(currentValue ?? "");
          setEditing(false);
        }}
      />
      <CustomEditButton
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
