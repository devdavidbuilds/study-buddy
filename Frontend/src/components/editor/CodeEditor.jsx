import { useRef, useCallback } from 'react';
import Editor from '@monaco-editor/react';

/** Custom dark Monaco theme with a soft sakura accent, defined once before mount. */
function defineSakuraDarkTheme(monaco) {
  monaco.editor.defineTheme('sakura-dark', {
    base: 'vs-dark',
    inherit: true,
    rules: [
      { token: 'comment', foreground: '8A8578', fontStyle: 'italic' },
      { token: 'keyword', foreground: 'F4B3CE' },
      { token: 'string', foreground: 'B9E3B0' },
      { token: 'number', foreground: 'F0A94E' },
      { token: 'type', foreground: 'C9B6E4' },
      { token: 'function', foreground: 'E9A3C5' },
      { token: 'identifier', foreground: 'E7DFE0' },
    ],
    colors: {
      'editor.background': '#1E1A20',
      'editor.foreground': '#EDE6E8',
      'editor.lineHighlightBackground': '#2A242C',
      'editor.selectionBackground': '#E7548055',
      'editorCursor.foreground': '#F8C8DC',
      'editorLineNumber.foreground': '#5C5560',
      'editorLineNumber.activeForeground': '#F4B3CE',
      'editorIndentGuide.background': '#332C36',
      'editorIndentGuide.activeBackground': '#4A4150',
      'editorGutter.background': '#1E1A20',
      'editorWidget.background': '#241F26',
      'editorSuggestWidget.background': '#241F26',
      'editorSuggestWidget.border': '#3A323D',
      'editorBracketMatch.background': '#E7548033',
      'editorBracketMatch.border': '#E75480',
      'scrollbarSlider.background': '#F8C8DC22',
      'scrollbarSlider.hoverBackground': '#F8C8DC3A',
    },
  });
}

export default function CodeEditor({
  value,
  language,
  onChange,
  fontSize = 14,
  onCursorChange,
  onRun,
  onSave,
}) {
  const editorRef = useRef(null);

  const handleBeforeMount = useCallback((monaco) => {
    defineSakuraDarkTheme(monaco);
  }, []);

  const handleMount = useCallback((editor, monaco) => {
    editorRef.current = editor;

    editor.onDidChangeCursorPosition((e) => {
      onCursorChange?.({ line: e.position.lineNumber, column: e.position.column });
    });

    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
      onRun?.();
    });
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
      onSave?.();
    });

    editor.focus();
  }, [onCursorChange, onRun, onSave]);

  return (
    <Editor
      language={language}
      value={value}
      theme="sakura-dark"
      beforeMount={handleBeforeMount}
      onMount={handleMount}
      onChange={(v) => onChange?.(v ?? '')}
      options={{
        fontSize,
        fontFamily: "'JetBrains Mono', 'Fira Code', Consolas, monospace",
        fontLigatures: true,
        minimap: { enabled: true, scale: 1 },
        automaticLayout: true,
        smoothScrolling: true,
        cursorBlinking: 'smooth',
        cursorSmoothCaretAnimation: 'on',
        lineNumbers: 'on',
        renderLineHighlight: 'all',
        bracketPairColorization: { enabled: true },
        guides: { indentation: true, bracketPairs: true },
        autoClosingBrackets: 'languageDefined',
        autoClosingQuotes: 'languageDefined',
        matchBrackets: 'always',
        folding: true,
        foldingStrategy: 'indentation',
        stickyScroll: { enabled: true },
        wordWrap: 'off',
        tabSize: 4,
        scrollBeyondLastLine: false,
        padding: { top: 16 },
        multiCursorModifier: 'alt',
        quickSuggestions: true,
        suggestOnTriggerCharacters: true,
      }}
    />
  );
}
