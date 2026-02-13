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
  flex-grow: 1;

  &:read-only {
    font-weight: 500;
    border: 2px solid transparent;
    background: transparent;
    // Hide arrows
    -moz-appearance: textfield;
    -webkit-inner-spin-button,
    -webkit-outer-spin-button {
      -webkit-appearance: none;
      margin: 0;
    }
  }
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
  const [editting, setEditting] = useState(false);

  useEffect(() => {
    setCurrentValue(value);
  }, [value]);

  const inputRef = useRef<HTMLInputElement>(null);
  const saveRef = useRef<HTMLButtonElement>(null);

  return (
    <Container>
      <Input
        type="number"
        ref={inputRef}
        readOnly={!editting}
        value={currentValue}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            onChange?.(currentValue ?? "");
            setEditting(false);
            inputRef.current?.blur();
          } else if (e.key === "Escape") {
            setEditting(false);
            inputRef.current?.blur();
          }
        }}
        onDoubleClick={() => {
          if (!editting) {
            setEditting(true);
            inputRef.current?.select();
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
          setEditting(false);
        }}
      />
      <CustomEditButton
        ref={saveRef}
        onClick={() => {
          if (!editting) {
            setEditting(true);
            inputRef.current?.select();
          } else {
            onChange?.(currentValue ?? "");
            setEditting(false);
            inputRef.current?.blur();
          }
        }}
      >
        {!editting ? "edit" : "save"}
      </CustomEditButton>
    </Container>
  );
};
