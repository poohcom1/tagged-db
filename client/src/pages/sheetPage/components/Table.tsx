import styled from "styled-components";

export const HEADER_HEIGHT = 36;

export const Table = styled.table`
  border-collapse: collapse;
  font-size: 14px;
`;

export const Thead = styled.thead`
  background: #7997d4;
  height: ${HEADER_HEIGHT}px;
`;

export const Th = styled.th`
  text-align: left;
  padding: 8px 12px;
  border-bottom: 2px solid #e5e7eb;
  font-weight: 600;
`;

export const Tbody = styled.tbody`
  tr:nth-child(even) {
    background: #e2ecf7;
  }

  tr:nth-child(odd) {
    background: #ffffff;
  }
`;

export const Td = styled.td`
  padding: 8px 12px;
  border-bottom: 1px solid #e5e7eb;
`;
