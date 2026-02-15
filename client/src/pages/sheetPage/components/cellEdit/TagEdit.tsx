import { cleanTagText, parseTags } from "@app/shared/sheetValidation";
import { useEffect, useMemo, useRef, useState } from "react";
import styled from "styled-components";
import { EditButton } from "../../../../components/EditButton";
import { isTabFocus } from "../../../../utils/tabFocus";

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

  onTagClicked?: (tag: string, e: React.MouseEvent) => void;
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

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const saveRef = useRef<HTMLButtonElement>(null);

  const apply = (tag: string) => {
    const next = prefix ? `${prefix}, ${tag}` : tag;
    setInput(next);
    setIndex(0);
    // move cursor to end of input
    textareaRef.current?.setSelectionRange(next.length, next.length);
  };

  const commit = () => {
    onChange?.(cleanTagText(input));
    setEditing(false);
  };

  const tags = parseTags(value ?? "");

  return (
    <>
      <Container>
        {!editing ? (
          <div
            tabIndex={0}
            onFocus={() => {
              if (isTabFocus()) {
                setEditing(true);
              }
            }}
            style={{ maxWidth: "150px" }}
          >
            {tags.map((tag, ind) => (
              <EditButton
                key={tag}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onTagClicked?.(tag, e);
                }}
                style={{
                  marginRight: "4px",
                  fontSize: "small",
                }}
              >
                {tag}
                {ind < tags.length - 1 && ","}
              </EditButton>
            ))}
          </div>
        ) : (
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
              if (matches.length > 0) {
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
                  if (matches[index]) {
                    apply(matches[index]);
                    e.preventDefault();
                  }
                }
              }

              if (e.key === "Enter ") {
                commit();
                e.preventDefault();
              } else if (e.key === "Escape") {
                setEditing(false);
                setInput(value ?? "");
              }
            }}
            onBlur={(e) => {
              if (e.relatedTarget !== saveRef.current) {
                commit();
              }
            }}
          />
        )}
        <CustomEditButton
          ref={saveRef}
          tabIndex={-1}
          onClick={() => (editing ? commit() : setEditing(true))}
        >
          {editing ? "Save" : "Edit"}
        </CustomEditButton>
      </Container>
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
    </>
  );
};

function fuzzySearch(token: string, tags: string[]) {
  return tags.filter((tag) => tag.toLowerCase().includes(token.toLowerCase()));
}
