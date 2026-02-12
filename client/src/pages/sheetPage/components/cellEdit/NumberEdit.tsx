import { useEffect, useState } from "react";
import styled from "styled-components";
import { EditButton } from "../../../../components/EditButton";

const Text = styled.span`
  padding: 8px 12px;
  font-weight: 600;
`;

interface Props {
  onChange?: (value: string) => void;
  onCancel?: () => void;
  value?: string;
  min?: number;
  max?: number;
  step?: number;
}

export const NumberEdit = ({ value, onChange, min, max, step }: Props) => {
  const [currentValue, setCurrentValue] = useState(value);
  const [editting, setEditting] = useState(false);

  useEffect(() => {
    setCurrentValue(value);
  }, [value]);

  if (editting) {
    return (
      <input
        type="number"
        min={min}
        max={max}
        step={step}
        value={currentValue}
        autoFocus
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            onChange?.(currentValue ?? "");
            setEditting(false);
          } else if (e.key === "Escape") {
            setEditting(false);
          }
        }}
        onChange={(e) => {
          setCurrentValue(e.target.value);
        }}
        onBlur={() => {
          onChange?.(currentValue ?? "");
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
