import { cleanTagText } from "@app/shared/sheetValidation";
import { useEffect, useMemo, useState } from "react";
import styled from "styled-components";

// Styled
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

const Dropdown = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;

  background: white;
  border: 1px solid #ccc;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
  z-index: 1000;
`;

const Item = styled.div<{ active: boolean }>`
  padding: 4px 8px;
  cursor: pointer;
  background: ${({ active }) => (active ? "#eee" : "white")};

  &:hover {
    background: #eee;
  }
`;

// Component

interface Props {
  onChange?: (value: string) => void;
  value: string;
  rowId: string;
  columnId: string;
  tags: string[];
}

export const TagEdit = ({ value, onChange, tags: suggestions }: Props) => {
  const [editing, setEditing] = useState(false);
  const [input, setInput] = useState("");
  const [index, setIndex] = useState(0);

  useEffect(() => {
    setInput(value);
  }, [value]);

  const { prefix, lastToken } = useMemo(() => {
    const parts = input.split(",");
    const last = parts.pop() ?? "";
    return {
      prefix: parts
        .map((p) => p.trim())
        .filter(Boolean)
        .join(", "),
      lastToken: last.trim(),
    };
  }, [input]);

  const matches = useMemo(() => {
    const tagsExceptLast = parseTagsExceptLast(input);
    return lastToken
      ? fuzzySearch(
          lastToken,
          suggestions.filter((t) => !tagsExceptLast.includes(t)),
        )
      : [];
  }, [input, lastToken, suggestions]);

  const apply = (tag: string) => {
    const next = prefix ? `${prefix}, ${tag}` : tag;
    setInput(next + ", ");
    setIndex(0);
  };

  const commit = () => {
    onChange?.(cleanTagText(input));
    setEditing(false);
  };

  if (!editing) {
    return (
      <>
        <Text>{value}</Text>
        <EditButton onClick={() => setEditing(true)}>edit</EditButton>
      </>
    );
  }

  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      <textarea
        value={input}
        autoFocus
        onFocus={(e) => {
          const element = e.target;
          const length = element.value.length;
          element.setSelectionRange(length, length);
        }}
        onChange={(e) => {
          setInput(e.target.value);
          setIndex(0);
        }}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown") {
            setIndex((i) => Math.min(i + 1, matches.length - 1));
          } else if (e.key === "ArrowUp") {
            setIndex((i) => Math.max(i - 1, 0));
          } else if (e.key === "Enter") {
            if (matches[index]) {
              apply(matches[index]);
            } else {
              commit();
            }
          } else if (e.key === "Escape") {
            setEditing(false);
          }
        }}
        onBlur={commit}
      />

      {matches.length > 0 && (
        <Dropdown>
          {matches.map((tag, i) => (
            <Item
              key={tag}
              active={i === index}
              onMouseDown={(e) => {
                e.preventDefault();
                apply(tag);
              }}
            >
              {tag}
            </Item>
          ))}
        </Dropdown>
      )}
    </div>
  );
};

function parseTagsExceptLast(input: string): string[] {
  return new Set(
    input
      .split(",")
      .slice(0, -1)
      .map((t) => t.trim())
      .filter(Boolean),
  )
    .values()
    .toArray();
}

function fuzzySearch(token: string, tags: string[]) {
  return tags.filter((tag) => tag.toLowerCase().includes(token.toLowerCase()));
}
