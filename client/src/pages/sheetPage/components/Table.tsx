import styled from "styled-components";

export const HEADER_HEIGHT = 36;

export const Table = styled.table`
  border-collapse: collapse;
  font-size: 14px;
  table-layout: fixed;
`;

export const Thead = styled.thead`
  height: ${HEADER_HEIGHT}px;
`;

export const Th = styled.th`
  text-align: left;
  padding: 8px 12px;
  font-weight: 600;
  background: #e7f1f7;

  // Sticky
  position: sticky;
  top: 0;
  // - border doesn't work with sticky, hack with outline
  outline: 1px solid #7d7d80;
  border: none;
`;

export const Tbody = styled.tbody`
  tr:nth-child(even) {
    background: #f1f1f1;
  }

  tr:nth-child(odd) {
    background: #ffffff;
  }
`;

export const Td = styled.td`
  min-height: 50px;
  padding: 8px 12px;
  border: 1px solid #7d7d80;
`;
