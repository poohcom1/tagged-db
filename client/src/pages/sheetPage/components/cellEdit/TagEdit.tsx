import { cleanTagText, parseTags } from "@app/shared/sheetValidation";
import { useEffect, useMemo, useRef, useState } from "react";
import styled from "styled-components";
import { EditButton } from "../../../../components/EditButton";

// Styled
const Container = styled.div`
  display: flex;
`;

const CustomEditButton = styled(EditButton)`
  margin-left: auto;
  text-align: right;
  min-width: 25px;
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

  onTagClicked?: (tag: string) => void;
}

export const TagEdit = ({
  value,
  onChange,
  tags: suggestions,
  onTagClicked,
}: Props) => {
  const [editing, setEditing] = useState(false);
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

  const apply = (tag: string) => {
    const next = prefix ? `${prefix}, ${tag}` : tag;
    setInput(next);
    setIndex(0);
  };

  const commit = () => {
    onChange?.(cleanTagText(input));
    setEditing(false);
  };

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const tags = parseTags(value ?? "");

  if (!editing) {
    return (
      <Container>
        {tags.map((tag, ind) => (
          <>
            <EditButton
              key={tag}
              onClick={() => {
                onTagClicked?.(tag);
              }}
            >
              {tag}
            </EditButton>
            {ind < tags.length - 1 && (
              <div key={`${tag}_comma`} style={{ marginRight: "4px" }}>
                ,
              </div>
            )}
          </>
        ))}
        <CustomEditButton
          onClick={() => {
            setEditing(true);
          }}
        >
          edit
        </CustomEditButton>
      </Container>
    );
  }

  return (
    <>
      <Container>
        <textarea
          style={{ resize: "vertical" }}
          ref={textareaRef}
          rows={1}
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
            } else if (e.key === "Tab") {
              // cycle
              setIndex((i) => (i + 1) % matches.length);
              e.preventDefault();
            } else if (e.key === "Enter") {
              if (matches.length > 0 && matches[index]) {
                apply(matches[index]);
                e.preventDefault();
              } else {
                commit();
                e.preventDefault();
              }
            } else if (e.key === "Escape") {
              setEditing(false);
              setInput(value ?? "");
            }
          }}
          // onBlur={commit}
        />
        <CustomEditButton onClick={commit}>save</CustomEditButton>
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
    </>
  );
};

function fuzzySearch(token: string, tags: string[]) {
  return tags.filter((tag) => tag.toLowerCase().includes(token.toLowerCase()));
}
