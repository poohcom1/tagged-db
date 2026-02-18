import { useEffect } from "react";
import Editor from "@monaco-editor/react";

type Props = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  completionVariables?: string[];
};

const BUILTIN_FUNCTIONS = [
  {
    label: "get_cell",
    insertText: "get_cell(${1:column})",
    documentation: "get_cell(name_or_ind: str | int, num: int) -> str | int",
  },
  {
    label: "get_dropdown_index",
    insertText: "get_dropdown_index(${1:column})",
    documentation:
      "get_dropdown_index(name_or_ind: str | int, num: int) -> int",
  },
  {
    label: "to_dropdown_value",
    insertText: "to_dropdown_value(${1:value}, ${2:column})",
    documentation:
      "to_dropdown_value(value: str, name_or_ind: str | int, num: int) -> str",
  },
];

export function FormulaCodeEditor({
  value,
  onChange,
  placeholder,
  completionVariables,
}: Props) {
  useEffect(() => {
    setExtraVariableCompletions(completionVariables ?? []);
  }, [completionVariables]);

  return (
    <Editor
      onMount={(editor) => {
        editor.focus();
        const model = editor.getModel();
        if (!model) {
          return;
        }
        editor.setPosition(model.getFullModelRange().getEndPosition());
      }}
      height="100%"
      width="100%"
      language="python"
      value={value}
      onChange={(val) => onChange(val ?? "")}
      options={{
        minimap: { enabled: false },
        fontFamily:
          "ui-monospace,SFMono-Regular,SF Mono,Consolas,Liberation Mono,Menlo,monospace",
        fontSize: 14,
        fontWeight: "700",
        lineNumbers: "on",
        scrollBeyondLastLine: false,
        automaticLayout: true,
        placeholder,
        cursorStyle: "line",
        tabSize: 4,
      }}
      theme="vs-light"
      loading={
        <div
          style={{
            height: "100%",
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "ui-monospace,SFMono-Regular,Consolas,monospace",
            fontSize: 13,
            color: "#666",
            background: "#f3f3f3",
          }}
        >
          Initializing formula editor…
        </div>
      }
    />
  );
}

import { loader } from "@monaco-editor/react";
let extraVariableCompletions: string[] = [];

export function setExtraVariableCompletions(vars: string[]) {
  extraVariableCompletions = vars;
}

loader.init().then((monaco) => {
  monaco.languages.registerCompletionItemProvider("python", {
    triggerCharacters: ["."],
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    provideCompletionItems: (model: any, position: any) => {
      const word = model.getWordUntilPosition(position);

      const range = {
        startLineNumber: position.lineNumber,
        endLineNumber: position.lineNumber,
        startColumn: word.startColumn,
        endColumn: word.endColumn,
      };

      // static function completions
      const builtinSuggestions = BUILTIN_FUNCTIONS.map((fn) => ({
        label: fn.label,
        kind: monaco.languages.CompletionItemKind.Function,
        insertText: fn.insertText,
        insertTextRules:
          monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
        documentation: fn.documentation,
        range,
      }));

      // dynamic variable completions
      const variableSuggestions = extraVariableCompletions.map((name) => ({
        label: name,
        kind: monaco.languages.CompletionItemKind.Variable,
        insertText: name,
        documentation: `Variable: ${name}`,
        range,
      }));

      return {
        suggestions: [...builtinSuggestions, ...variableSuggestions],
      };
    },
  });
});
