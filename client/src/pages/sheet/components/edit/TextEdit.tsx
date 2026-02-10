import { useEffect, useState } from "react";
import styled from "styled-components";

const Text = styled.span`
  padding: 8px 12px;
  font-weight: 600;
`;

const EditButton = styled.button`
  // clear
  background: none;
  border: none;
  padding: 0;
  font: inherit;
  cursor: pointer;
  outline: inherit;

  font-size: smaller;
  &:hover {
    text-decoration: underline;
  }
  color: #5383a1;
`;

interface Props {
  onChange?: (value: string) => void;
  value: string;
}

export const TextEdit = ({ value, onChange }: Props) => {
  const [currentValue, setCurrentValue] = useState(value);
  const [editting, setEditting] = useState(false);

  useEffect(() => {
    setCurrentValue(value);
  }, [value]);

  if (editting) {
    return (
      <input
        value={currentValue}
        autoFocus
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            onChange?.(currentValue);
            setEditting(false);
          } else if (e.key === "Escape") {
            setEditting(false);
          }
        }}
        onChange={(e) => {
          setCurrentValue(e.target.value);
        }}
        onBlur={() => {
          onChange?.(currentValue);
          setEditting(false);
        }}
      />
    );
  }

  return (
    <>
      <Text>{value}</Text>
      <EditButton
        onClick={() => {
          setEditting(true);
        }}
      >
        edit
      </EditButton>
    </>
  );
};
