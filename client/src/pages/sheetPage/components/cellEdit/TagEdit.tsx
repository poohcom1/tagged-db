import { cleanTagText, parseTags } from "@app/shared/sheetValidation";
import { useEffect, useMemo, useRef, useState } from "react";
import styled from "styled-components";
import { EditButton } from "../../../../components/EditButton";
import { BaseTextEdit } from "./BaseTextEdit";

// Styled
const Container = styled.div`
  display: flex;
`;

const Dropdown = styled.div`
  position: fixed;

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
  value?: string;
  rowId: string;
  columnId: string;
  tags: string[];

  onTagClicked?: (tag: string, e: React.MouseEvent) => void;
}

export const TagEdit = ({
  value,
  onChange,
  tags: suggestions,
  onTagClicked,
}: Props) => {
  const [input, setInput] = useState("");
  const [index, setIndex] = useState(0);

  useEffect(() => {
    setInput(value ?? "");
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
    const tagsExceptLast = parseTags(input);
    return lastToken
      ? fuzzySearch(
          lastToken,
          suggestions.filter((t) => !tagsExceptLast.includes(t)),
        )
      : [];
  }, [input, lastToken, suggestions]);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const apply = (tag: string) => {
    const next = prefix ? `${prefix}, ${tag}` : tag;
    setInput(next);
    setIndex(0);
    // move cursor to end of input
    textareaRef.current?.setSelectionRange(next.length, next.length);
  };

  const tags = parseTags(value ?? "");

  return (
    <BaseTextEdit
      value={input}
      onChange={setInput}
      displayComponent={() => (
        <div>
          {tags.map((tag, ind) => (
            <EditButton
              key={tag}
              onClick={(e) => {
                onTagClicked?.(tag, e);
              }}
              style={{ marginRight: "4px", fontSize: "small" }}
            >
              {tag}
              {ind < tags.length - 1 && ","}
            </EditButton>
          ))}
        </div>
      )}
      inputComponent={({ setEditing, onBlur }) => (
        <div>
          <Container>
            <textarea
              style={{ resize: "vertical" }}
              ref={textareaRef}
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
                  e.preventDefault();
                } else if (e.key === "ArrowUp") {
                  setIndex((i) => Math.max(i - 1, 0));
                  e.preventDefault();
                } else if (e.key === "Enter") {
                  if (matches.length > 0 && matches[index]) {
                    apply(matches[index]);
                    e.preventDefault();
                  } else {
                    onChange?.(cleanTagText(input));
                    setEditing(false);
                    e.preventDefault();
                  }
                } else if (e.key === "Escape") {
                  setEditing(false);
                  setInput(value ?? "");
                }
              }}
              onBlur={onBlur}
            />
          </Container>
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
        </div>
      )}
    />
  );
};

function fuzzySearch(token: string, tags: string[]) {
  return tags.filter((tag) => tag.toLowerCase().includes(token.toLowerCase()));
}
