import styled from "styled-components";
import { BaseInput } from "../../../../components/BaseInput";
import { BaseTextEdit } from "./BaseTextEdit";

const Input = styled(BaseInput)`
  padding: 0;
  min-width: 50px;
  width: 100%;
`;

interface Props {
  onChange?: (value: string) => void;
  value?: string;
}

export const TextEdit = ({ value, onChange }: Props) => {
  const isLink = value?.startsWith("http://") || value?.startsWith("https://");

  return (
    <BaseTextEdit
      autoResize
      value={value}
      onChange={onChange}
      displayComponent={({ value }) =>
        isLink ? (
          <a href={value} target="_blank">
            {value}
          </a>
        ) : (
          <span style={{ fontWeight: 600 }}>{value}</span>
        )
      }
      inputComponent={({
        currentValue,
        setCurrentValue: onCurrentValueChange,
        setEditing,
        inputRef,
        onBlur,
      }) => (
        <Input
          tabIndex={0}
          ref={inputRef}
          value={currentValue}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              onCurrentValueChange?.(currentValue ?? "");
              setEditing(false);
              inputRef.current?.blur();
            } else if (e.key === "Escape") {
              setEditing(false);
              inputRef.current?.blur();
            }
          }}
          onChange={(e) => onCurrentValueChange?.(e.target.value)}
          onBlur={onBlur}
        />
      )}
    />
  );
};
