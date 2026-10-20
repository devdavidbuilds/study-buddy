import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronDown,
  Lightbulb,
  Code2,
  FileText,
  ExternalLink,
  CheckCircle2,
  XCircle,
  HelpCircle,
} from 'lucide-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

// ========================================
// INTERACTIVE LEARNING ELEMENTS
// ========================================
// Data-driven components that enhance the learning experience.
// All are optional — they only render when relevant data exists.

/* ==============================
   ExpandableSection
   ============================== */
export function ExpandableSection({
  title,
  icon: Icon,
  children,
  defaultOpen = false,
  className,
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className={`ile-expandable ${open ? 'open' : ''} ${className || ''}`}>
      <button
        type="button"
        className="ile-expandable-trigger"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
      >
        {Icon && <Icon size={16} />}
        <span>{title}</span>
        <ChevronDown
          size={16}
          className={`ile-chevron ${open ? 'rotated' : ''}`}
        />
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            className="ile-expandable-content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
          >
            <div className="ile-expandable-inner">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ==============================
   KeyConceptCards
   ============================== */
export function KeyConceptCards({ concepts }) {
  if (!concepts?.length) return null;

  return (
    <div className="ile-concept-cards">
      {concepts.map((concept, i) => (
        <motion.div
          key={i}
          className="ile-concept-card"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.08, duration: 0.3 }}
        >
          <div className="ile-concept-icon">
            <Lightbulb size={15} />
          </div>
          <p className="ile-concept-text">{concept}</p>
        </motion.div>
      ))}
    </div>
  );
}

/* ==============================
   CodeDemo
   ============================== */
export function CodeDemo({ code, codeFile, language }) {
  if (!code) return null;

  const lang = language || (codeFile ? guessLang(codeFile) : 'javascript');

  return (
    <div className="ile-code-demo">
      <div className="ile-code-demo-header">
        <Code2 size={14} />
        <span>{codeFile || 'Example Code'}</span>
      </div>
      <SyntaxHighlighter
        language={lang}
        style={oneDark}
        customStyle={{
          margin: 0,
          borderRadius: '0 0 var(--radius-md) var(--radius-md)',
          fontSize: 'var(--font-size-xs)',
          lineHeight: 1.7,
        }}
        wrapLongLines
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
}

function guessLang(filename) {
  if (!filename) return 'text';
  const ext = filename.split('.').pop()?.toLowerCase();
  const map = {
    js: 'javascript',
    jsx: 'jsx',
    ts: 'typescript',
    tsx: 'tsx',
    py: 'python',
    java: 'java',
    c: 'c',
    cpp: 'cpp',
    cs: 'csharp',
    rb: 'ruby',
    go: 'go',
    rs: 'rust',
    html: 'html',
    css: 'css',
    sql: 'sql',
    sh: 'bash',
    json: 'json',
    xml: 'xml',
    md: 'markdown',
  };
  return map[ext] || 'text';
}

/* ==============================
   EmbeddedQuiz (from lesson.quiz[])
   ============================== */
export function EmbeddedQuiz({ questions }) {
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);

  if (!questions?.length) return null;

  const handleSelect = (qIndex, option) => {
    if (submitted) return;
    setAnswers((prev) => ({ ...prev, [qIndex]: option }));
  };

  const handleSubmit = () => {
    if (Object.keys(answers).length < questions.length) return;
    setSubmitted(true);
  };

  const handleReset = () => {
    setAnswers({});
    setSubmitted(false);
  };

  const score = useMemo(() => {
    if (!submitted) return 0;
    return questions.reduce((total, q, i) => {
      return total + (answers[i] === q.answer ? 1 : 0);
    }, 0);
  }, [submitted, answers, questions]);

  return (
    <div className="ile-quiz">
      <div className="ile-quiz-header">
        <HelpCircle size={16} />
        <span>Quick Check — {questions.length} question{questions.length > 1 ? 's' : ''}</span>
      </div>

      <div className="ile-quiz-questions">
        {questions.map((q, qi) => (
          <div key={qi} className="ile-quiz-question">
            <p className="ile-quiz-question-text">
              {qi + 1}. {q.question}
            </p>

            <div className="ile-quiz-options">
              {(q.options || []).map((opt, oi) => {
                const selected = answers[qi] === opt;
                const correct = submitted && opt === q.answer;
                const wrong = submitted && selected && opt !== q.answer;

                return (
                  <button
                    key={oi}
                    type="button"
                    className={`ile-quiz-option ${selected ? 'selected' : ''} ${correct ? 'correct' : ''} ${wrong ? 'wrong' : ''}`}
                    onClick={() => handleSelect(qi, opt)}
                    disabled={submitted}
                  >
                    <span className="ile-quiz-option-marker">
                      {correct ? (
                        <CheckCircle2 size={14} />
                      ) : wrong ? (
                        <XCircle size={14} />
                      ) : (
                        String.fromCharCode(65 + oi)
                      )}
                    </span>
                    <span>{opt}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="ile-quiz-footer">
        {submitted ? (
          <>
            <span className="ile-quiz-score">
              Score: {score} / {questions.length}
            </span>
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={handleReset}
            >
              Retry
            </button>
          </>
        ) : (
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={handleSubmit}
            disabled={Object.keys(answers).length < questions.length}
          >
            Check Answers
          </button>
        )}
      </div>
    </div>
  );
}

/* ==============================
   ResourcesList
   ============================== */
export function ResourcesList({ resources }) {
  if (!resources?.length) return null;

  return (
    <div className="ile-resources">
      <div className="ile-resources-header">
        <FileText size={15} />
        <span>Lesson Resources</span>
      </div>

      <div className="ile-resources-list">
        {resources.map((resource, i) => {
          const isUrl =
            typeof resource === 'string' &&
            (resource.startsWith('http://') || resource.startsWith('https://'));

          return (
            <div key={i} className="ile-resource-item">
              <FileText size={14} />
              {isUrl ? (
                <a
                  href={resource}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ile-resource-link"
                >
                  {resource.split('/').pop() || resource}
                  <ExternalLink size={12} />
                </a>
              ) : (
                <span className="ile-resource-name">{resource}</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
