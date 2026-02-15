import styled from "styled-components";
import { BaseTextEdit } from "./BaseTextEdit";

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
  width: 100%;
`;

interface Props {
  onChange?: (value: string) => void;
  value?: string;
}

export const NumberEdit = ({ value, onChange }: Props) => {
  return (
    <BaseTextEdit
      autoResize
      value={value}
      onChange={onChange}
      displayComponent={({ value }) => <span>{value}</span>}
      inputComponent={({
        setEditing,
        currentValue,
        setCurrentValue,
        inputRef,
        onBlur,
      }) => (
        <Input
          type="text"
          inputMode="decimal"
          ref={inputRef}
          value={currentValue}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              setCurrentValue?.(currentValue ?? "");
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
            setCurrentValue?.(e.target.value);
          }}
          onBlur={onBlur}
        />
      )}
    />
  );
};
