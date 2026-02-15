import { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import { BaseInput } from "../../../../components/BaseInput";

const Container = styled.div`
  display: flex;
  align-items: center;
  flex-grow: 1;
  gap: 4px;
  width: fix-content;
`;

const Input = styled(BaseInput)`
  padding: 0;
  min-width: 100px;
`;

interface Props {
  onChange?: (value: string) => void;
  value?: string;
}

export const DateEdit = ({ value, onChange }: Props) => {
  const [currentValue, setCurrentValue] = useState(value);
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

  return (
    <Container ref={containerRef}>
      <Input
        type="date"
        style={{ width: displayWidth + "px" }}
        ref={inputRef}
        value={currentValue}
        onChange={(e) => {
          setCurrentValue(e.target.value);
        }}
        onBlur={(e) => {
          if (e.relatedTarget === saveRef.current) {
            return;
          }
          onChange?.(currentValue ?? "");
        }}
      />
    </Container>
  );
};
