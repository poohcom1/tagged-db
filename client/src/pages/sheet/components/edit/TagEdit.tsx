import { useEffect, useMemo, useState } from "react";
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
  value: string[];
  rowId: string;
  columnId: string;
  tags: string[];
}

export const TagEdit = ({ value, onChange, tags, rowId, columnId }: Props) => {
  const [currentValue, setCurrentValue] = useState(value);
  const [editting, setEditting] = useState(false);

  const tagObjects = tags.map((tag) => ({ id: tag, name: tag, className: "" }));

  useEffect(() => {
    setCurrentValue(value);
  }, [value]);

  if (editting) {
    return null;
  }

  return (
    <>
      <Text>{value.join(", ")}</Text>
      <EditButton onClick={() => setEditting(true)}>edit</EditButton>
    </>
  );
};

function normalize(value: string) {
  const tags = value
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);

  return [...new Set(tags).values().toArray()].join(", ");
}

function fuzzySearch(query: string, tags: string[]) {
  return tags.filter((tag) => tag.toLowerCase().includes(query.toLowerCase()));
}
