import { Column, ColumnType, ColumnValue } from "@app/shared";
import React, { useMemo, useState } from "react";
import { Td } from "./Table";
import styled from "styled-components";
import { TextEdit } from "./edit/TextEdit";
import { NumberEdit } from "./edit/NumberEdit";
import { EnumEdit } from "./edit/EnumEdit";
import { TagEdit } from "./edit/TagEdit";

const Container = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 8px;
`;

interface Prop {
  rowId: string;
  columnInfo?: Column;
  value: ColumnValue;
  tagSuggestions?: string[];

  onChange?: (value: ColumnValue) => void;
}

export const Cell = React.memo(
  ({ rowId, columnInfo, value, onChange, tagSuggestions = [] }: Prop) => {
    const EditComponent = useMemo(() => {
      if (columnInfo == null) {
        return (
          <TextEdit
            value={value as string}
            onChange={(val) => {
              onChange?.(val);
            }}
          />
        );
      }

      switch (columnInfo.type) {
        case "text":
          return (
            <TextEdit
              value={value as string}
              onChange={(val) => {
                onChange?.(val);
              }}
            />
          );
        case "number":
          return (
            <NumberEdit
              value={value as number}
              onChange={onChange}
              min={columnInfo.min}
              max={columnInfo.max}
              step={columnInfo.step}
            />
          );
        case "enum":
          return (
            <EnumEdit
              value={value as string}
              onChange={onChange}
              options={columnInfo.options}
            />
          );
        case "tags":
          return (
            <TagEdit
              rowId={rowId}
              columnId={columnInfo.id}
              value={value as string[]}
              onChange={onChange}
              tags={tagSuggestions}
            />
          );
      }
    }, [columnInfo?.type, value]);

    return (
      <Td>
        <Container>{EditComponent}</Container>
      </Td>
    );
  },
);
