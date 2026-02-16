import { useRef } from "react";
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
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <Container ref={containerRef}>
      <Input
        type="date"
        ref={inputRef}
        value={value}
        onChange={(e) => {
          onChange?.(e.target.value);
        }}
      />
    </Container>
  );
};
