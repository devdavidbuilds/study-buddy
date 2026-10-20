import { useMemo } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import {
  AlertTriangle,
  Info,
  Lightbulb,
  BookOpen,
} from 'lucide-react';

// ========================================
// LESSON CONTENT RENDERER
// ========================================
// Parses lesson.content (plain or markdown-ish text) into structured,
// visually rich learning sections. Never fabricates content — only
// improves presentation of the existing text.

/* ---------- tiny helpers ---------- */

/** Detect the programming language from a fenced code-block opener. */
function detectLang(line) {
  const m = line.match(/^```(\w+)/);
  return m ? m[1].toLowerCase() : '';
}

/** Turn inline markdown into JSX (bold, italic, inline code). */
function renderInline(text, key) {
  // Split on patterns: **bold**, *italic*, `code`
  const parts = [];
  let remaining = text;
  let partIndex = 0;

  while (remaining.length > 0) {
    // Inline code
    const codeMatch = remaining.match(/`([^`]+)`/);
    // Bold
    const boldMatch = remaining.match(/\*\*(.+?)\*\*/);
    // Italic
    const italicMatch = remaining.match(/\*(.+?)\*/);

    // Find earliest match
    let earliest = null;
    let earliestIndex = Infinity;

    if (codeMatch && remaining.indexOf(codeMatch[0]) < earliestIndex) {
      earliestIndex = remaining.indexOf(codeMatch[0]);
      earliest = { type: 'code', match: codeMatch };
    }
    if (boldMatch && remaining.indexOf(boldMatch[0]) < earliestIndex) {
      earliestIndex = remaining.indexOf(boldMatch[0]);
      earliest = { type: 'bold', match: boldMatch };
    }
    if (italicMatch && !boldMatch && remaining.indexOf(italicMatch[0]) < earliestIndex) {
      earliestIndex = remaining.indexOf(italicMatch[0]);
      earliest = { type: 'italic', match: italicMatch };
    }

    if (!earliest) {
      parts.push(remaining);
      break;
    }

    const idx = remaining.indexOf(earliest.match[0]);
    if (idx > 0) parts.push(remaining.slice(0, idx));

    if (earliest.type === 'code') {
      parts.push(
        <code key={`${key}-c-${partIndex}`} className="lcr-inline-code">
          {earliest.match[1]}
        </code>
      );
    } else if (earliest.type === 'bold') {
      parts.push(
        <strong key={`${key}-b-${partIndex}`}>{earliest.match[1]}</strong>
      );
    } else {
      parts.push(
        <em key={`${key}-i-${partIndex}`}>{earliest.match[1]}</em>
      );
    }

    remaining = remaining.slice(idx + earliest.match[0].length);
    partIndex++;
  }

  return parts;
}

/* ---------- Block-level parser ---------- */

/**
 * Parse lines of text into an array of block objects:
 *   { type: 'heading', level, text }
 *   { type: 'paragraph', text }
 *   { type: 'list', items: string[] }
 *   { type: 'code', lang, code }
 *   { type: 'callout', variant, text }  (Note/Important/Example/Tip)
 */
function parseBlocks(text) {
  if (!text) return [];

  const lines = text.split('\n');
  const blocks = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    // Skip blank lines
    if (!trimmed) {
      i++;
      continue;
    }

    // Fenced code block
    if (trimmed.startsWith('```')) {
      const lang = detectLang(trimmed);
      const codeLines = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith('```')) {
        codeLines.push(lines[i]);
        i++;
      }
      i++; // skip closing ```
      blocks.push({ type: 'code', lang: lang || 'text', code: codeLines.join('\n') });
      continue;
    }

    // Headings
    const headingMatch = trimmed.match(/^(#{1,4})\s+(.+)/);
    if (headingMatch) {
      blocks.push({
        type: 'heading',
        level: headingMatch[1].length,
        text: headingMatch[2],
      });
      i++;
      continue;
    }

    // Callout detection (Note:, Important:, Example:, Tip:, Warning:)
    const calloutMatch = trimmed.match(
      /^(?:>?\s*)?(Note|Important|Example|Tip|Warning|Definition)\s*[:\-–]\s*(.+)/i
    );
    if (calloutMatch) {
      const variant = calloutMatch[1].toLowerCase();
      // Collect continuation lines
      let calloutText = calloutMatch[2];
      i++;
      while (
        i < lines.length &&
        lines[i].trim() &&
        !lines[i].trim().startsWith('#') &&
        !lines[i].trim().startsWith('```') &&
        !lines[i].trim().match(/^(?:>?\s*)?(Note|Important|Example|Tip|Warning|Definition)\s*[:\-–]/i) &&
        !lines[i].trim().match(/^[-*•]\s/)
      ) {
        calloutText += ' ' + lines[i].trim();
        i++;
      }
      blocks.push({ type: 'callout', variant, text: calloutText });
      continue;
    }

    // List items (-, *, •, or numbered)
    if (trimmed.match(/^[-*•]\s/) || trimmed.match(/^\d+[.)]\s/)) {
      const items = [];
      while (
        i < lines.length &&
        (lines[i].trim().match(/^[-*•]\s/) ||
          lines[i].trim().match(/^\d+[.)]\s/))
      ) {
        items.push(lines[i].trim().replace(/^[-*•]\s+/, '').replace(/^\d+[.)]\s+/, ''));
        i++;
      }
      blocks.push({ type: 'list', items });
      continue;
    }

    // Regular paragraph — collect contiguous non-blank, non-special lines
    let paraText = trimmed;
    i++;
    while (
      i < lines.length &&
      lines[i].trim() &&
      !lines[i].trim().startsWith('#') &&
      !lines[i].trim().startsWith('```') &&
      !lines[i].trim().match(/^[-*•]\s/) &&
      !lines[i].trim().match(/^\d+[.)]\s/) &&
      !lines[i].trim().match(/^(?:>?\s*)?(Note|Important|Example|Tip|Warning|Definition)\s*[:\-–]/i)
    ) {
      paraText += ' ' + lines[i].trim();
      i++;
    }
    blocks.push({ type: 'paragraph', text: paraText });
  }

  return blocks;
}

/* ---------- Callout icon helper ---------- */
function CalloutIcon({ variant }) {
  switch (variant) {
    case 'warning':
    case 'important':
      return <AlertTriangle size={16} />;
    case 'tip':
      return <Lightbulb size={16} />;
    case 'example':
      return <BookOpen size={16} />;
    default:
      return <Info size={16} />;
  }
}

/* ---------- Main component ---------- */

export default function LessonContentRenderer({ content, className }) {
  const blocks = useMemo(() => parseBlocks(content), [content]);

  if (!blocks.length) {
    return (
      <p className="lcr-empty">
        No reading material is available for this lesson yet.
      </p>
    );
  }

  return (
    <div className={`lcr-root ${className || ''}`}>
      {blocks.map((block, idx) => {
        switch (block.type) {
          case 'heading': {
            const Tag = `h${Math.min(block.level + 1, 6)}`; // offset so lesson title is h2
            return (
              <Tag key={idx} className={`lcr-heading lcr-h${block.level}`}>
                {renderInline(block.text, idx)}
              </Tag>
            );
          }

          case 'paragraph':
            return (
              <p key={idx} className="lcr-paragraph">
                {renderInline(block.text, idx)}
              </p>
            );

          case 'list':
            return (
              <ul key={idx} className="lcr-list">
                {block.items.map((item, li) => (
                  <li key={li} className="lcr-list-item">
                    {renderInline(item, `${idx}-${li}`)}
                  </li>
                ))}
              </ul>
            );

          case 'code':
            return (
              <div key={idx} className="lcr-code-wrapper">
                <div className="lcr-code-header">
                  <span className="lcr-code-lang">{block.lang}</span>
                </div>
                <SyntaxHighlighter
                  language={block.lang}
                  style={oneDark}
                  customStyle={{
                    margin: 0,
                    borderRadius: '0 0 var(--radius-md) var(--radius-md)',
                    fontSize: 'var(--font-size-xs)',
                    lineHeight: 1.7,
                  }}
                  wrapLongLines
                >
                  {block.code}
                </SyntaxHighlighter>
              </div>
            );

          case 'callout':
            return (
              <div
                key={idx}
                className={`lcr-callout lcr-callout-${block.variant}`}
              >
                <div className="lcr-callout-icon">
                  <CalloutIcon variant={block.variant} />
                </div>
                <div className="lcr-callout-body">
                  <span className="lcr-callout-label">{block.variant}</span>
                  <p>{renderInline(block.text, idx)}</p>
                </div>
              </div>
            );

          default:
            return null;
        }
      })}
    </div>
  );
}
