import { Minus, Plus } from 'lucide-react';

export default function EditorStatusBar({ language, cursor, wordCount, fontSize, onZoom }) {
  return (
    <div className="editor-statusbar">
      <div className="statusbar-left">
        <span className="statusbar-badge">{language}</span>
        <span>Ln {cursor.line}, Col {cursor.column}</span>
        <span>{wordCount} words</span>
      </div>
      <div className="statusbar-right">
        <button className="statusbar-zoom-btn" onClick={() => onZoom(-1)} aria-label="Zoom out"><Minus size={12} /></button>
        <span>{fontSize}px</span>
        <button className="statusbar-zoom-btn" onClick={() => onZoom(1)} aria-label="Zoom in"><Plus size={12} /></button>
        <span className="statusbar-saved">Saved</span>
      </div>
    </div>
  );
}
