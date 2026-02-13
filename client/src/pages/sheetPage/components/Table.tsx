import styled from "styled-components";

export const HEADER_HEIGHT = 36;

export const Table = styled.table`
  border-collapse: collapse;
  font-size: 14px;
  table-layout: fixed;
`;

export const Thead = styled.thead`
  background: #b0d3f8;
  height: ${HEADER_HEIGHT}px;
`;

export const Th = styled.th`
  text-align: left;
  padding: 8px 12px;
  border-bottom: 2px solid #e5e7eb;
  font-weight: 600;
  border: 1px solid #83818d;
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
  min-height: 50px;
  padding: 8px 12px;
  border: 1px solid #83818d;
`;
