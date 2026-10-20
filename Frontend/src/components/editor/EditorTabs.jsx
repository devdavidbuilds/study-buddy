import { X, Plus } from 'lucide-react';

export default function EditorTabs({ tabs, activeTabId, onSelect, onClose, onAdd }) {
  return (
    <div className="editor-tabs">
      {tabs.map(tab => (
        <div
          key={tab.id}
          className={`editor-tab ${tab.id === activeTabId ? 'active' : ''}`}
          onClick={() => onSelect(tab.id)}
        >
          <span className="editor-tab-dot" style={{ opacity: tab.dirty ? 1 : 0 }} />
          <span className="editor-tab-name">{tab.name}</span>
          {tabs.length > 1 && (
            <button
              className="editor-tab-close"
              onClick={(e) => { e.stopPropagation(); onClose(tab.id); }}
              aria-label={`Close ${tab.name}`}
            >
              <X size={12} />
            </button>
          )}
        </div>
      ))}
      <button className="editor-tab-add" onClick={onAdd} aria-label="New scratch tab" title="New scratch file">
        <Plus size={14} />
      </button>
    </div>
  );
}
