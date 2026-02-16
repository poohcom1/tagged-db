import { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import { EditButton } from "../../../../components/EditButton";
import { BaseInput } from "../../../../components/BaseInput";
import { isTabFocus } from "../../../../utils/tabFocus";

const Container = styled.div`
  display: flex;
  align-items: center;
  flex-grow: 1;
  gap: 4px;
  width: fix-content;
`;

const Input = styled(BaseInput)`
  padding: 0;
  min-width: 50px;
  flex-grow: 1;
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

export const TextEdit = ({ value, onChange }: Props) => {
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

  const isLink =
    currentValue?.startsWith("http://") || currentValue?.startsWith("https://");

  const startEdit = () => {
    setEditing(true);
    setTimeout(() => inputRef.current?.select(), 50);
  };

  return (
    <Container ref={containerRef}>
      <div
        tabIndex={0}
        onFocus={() => {
          if (isTabFocus()) {
            startEdit();
          }
        }}
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
        {!editing && isLink ? (
          <a href={value} target="_blank">
            {value}
          </a>
        ) : (
          <span style={{ fontWeight: 600 }}>
            {editing ? currentValue : value}
          </span>
        )}
      </div>
      <Input
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
