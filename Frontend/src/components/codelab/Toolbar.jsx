import { useRef, useState } from 'react';
import {
  Play, Send, Save, RotateCcw, Maximize, Minimize, Download, Upload,
  Settings, Sparkles, ChevronDown,
} from 'lucide-react';

const languages = [
  { id: 'python', label: 'Python', ext: '.py', monacoId: 'python' },
  { id: 'cpp', label: 'C++', ext: '.cpp', monacoId: 'cpp' },
  { id: 'c', label: 'C', ext: '.c', monacoId: 'c' },
];

export default function Toolbar({
  language, onLanguageChange, onRun, onSubmit, onSave, onReset,
  isFullscreen, onToggleFullscreen, onDownload, onUpload,
  aiOpen, onToggleAI, running, submitting,
  fontSize, onFontSizeChange, submitDisabled = false,
}) {
  const fileInputRef = useRef(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const activeLang = languages.find(l => l.id === language);

  return (
    <div className="codelab-toolbar">
      <div className="codelab-toolbar-left">
        <div className="codelab-lang-select">
          <select value={language} onChange={e => onLanguageChange(e.target.value)}>
            {languages.map(l => <option key={l.id} value={l.id}>{l.label}</option>)}
          </select>
          <ChevronDown size={13} />
        </div>
      </div>

      <div className="codelab-toolbar-center">
        <button className="codelab-tool-btn primary" onClick={onRun} disabled={running || submitting}>
          <Play size={14} /> {running ? 'Running...' : 'Run'}
        </button>
        <button
          className="codelab-tool-btn accent"
          onClick={onSubmit}
          disabled={running || submitting || submitDisabled}
          title={submitDisabled ? 'Sample programs have no tests to submit — just Run them.' : undefined}
        >
          <Send size={14} /> {submitting ? 'Submitting...' : 'Submit'}
        </button>
        <button className="codelab-tool-btn" onClick={onSave}><Save size={14} /> Save</button>
        <button className="codelab-tool-btn" onClick={onReset}><RotateCcw size={14} /> Reset</button>
      </div>

      <div className="codelab-toolbar-right">
        <button
          className={`codelab-tool-icon-btn ${aiOpen ? 'active' : ''}`}
          onClick={onToggleAI}
          title="AI Assistant"
        >
          <Sparkles size={15} />
        </button>
        <button className="codelab-tool-icon-btn" onClick={onDownload} title="Download code">
          <Download size={15} />
        </button>
        <button className="codelab-tool-icon-btn" onClick={() => fileInputRef.current?.click()} title="Upload code">
          <Upload size={15} />
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept={`.${activeLang?.ext},.txt`}
          style={{ display: 'none' }}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = () => onUpload(String(reader.result));
            reader.readAsText(file);
            e.target.value = '';
          }}
        />
        <button className="codelab-tool-icon-btn" onClick={onToggleFullscreen} title="Toggle fullscreen">
          {isFullscreen ? <Minimize size={15} /> : <Maximize size={15} />}
        </button>
        <div className="codelab-settings-wrap">
          <button className="codelab-tool-icon-btn" onClick={() => setSettingsOpen(o => !o)} title="Settings">
            <Settings size={15} />
          </button>
          {settingsOpen && (
            <div className="codelab-settings-dropdown">
              <span>Font Size</span>
              <div className="codelab-font-controls">
                <button onClick={() => onFontSizeChange(-1)}>-</button>
                <span>{fontSize}px</span>
                <button onClick={() => onFontSizeChange(1)}>+</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
