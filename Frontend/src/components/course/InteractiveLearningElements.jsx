import { useState } from 'react';
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
   Answers are scored by the server (onSubmit); the browser never
   receives the answer key before submitting.
   ============================== */
export function EmbeddedQuiz({ questions, onSubmit, previous, title = 'Quick Check' }) {
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!questions?.length) return null;

  const answeredCount = Object.keys(answers).length;

  const handleSelect = (qIndex, optionIndex) => {
    if (result || submitting) return;
    setAnswers((prev) => ({ ...prev, [qIndex]: optionIndex }));
  };

  const handleSubmit = async () => {
    if (answeredCount < questions.length || !onSubmit) return;
    setSubmitting(true);
    setError('');
    try {
      const data = await onSubmit(questions.map((_, i) => answers[i]));
      setResult(data);
    } catch (err) {
      setError(err?.response?.data?.message || 'Could not check your answers. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setAnswers({});
    setResult(null);
    setError('');
  };

  return (
    <div className="ile-quiz">
      <div className="ile-quiz-header">
        <HelpCircle size={16} />
        <span>{title} — {questions.length} question{questions.length > 1 ? 's' : ''}</span>
        {previous && !result && (
          <span className="badge badge-success" style={{ marginLeft: 'auto' }}>
            Last score {previous.correct}/{previous.total}
          </span>
        )}
      </div>

      <div className="ile-quiz-questions">
        {questions.map((q, qi) => {
          const outcome = result?.results?.[qi];

          return (
            <div key={qi} className="ile-quiz-question">
              <p className="ile-quiz-question-text">
                {qi + 1}. {q.question}
              </p>

              <div className="ile-quiz-options">
                {(q.options || []).map((opt, oi) => {
                  const selected = answers[qi] === oi;
                  const correct = Boolean(outcome) && oi === outcome.correctIndex;
                  const wrong = Boolean(outcome) && selected && !outcome.correct;

                  return (
                    <button
                      key={oi}
                      type="button"
                      className={`ile-quiz-option ${selected ? 'selected' : ''} ${correct ? 'correct' : ''} ${wrong ? 'wrong' : ''}`}
                      onClick={() => handleSelect(qi, oi)}
                      disabled={Boolean(result) || submitting}
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

              {outcome?.explanation && (
                <p className="sl-quiz-explanation">{outcome.explanation}</p>
              )}
            </div>
          );
        })}
      </div>

      {error && <p className="learn-action-message">{error}</p>}

      <div className="ile-quiz-footer">
        {result ? (
          <>
            <span className="ile-quiz-score">
              Score: {result.correct} / {result.total} ({result.percentage}%)
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
            disabled={answeredCount < questions.length || submitting || !onSubmit}
          >
            {submitting ? 'Checking…' : 'Check Answers'}
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
