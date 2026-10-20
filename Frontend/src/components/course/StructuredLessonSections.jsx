import { useState } from 'react';
import {
  AlertTriangle,
  Bookmark,
  Briefcase,
  ClipboardCheck,
  Eye,
  EyeOff,
  Lightbulb,
  ListOrdered,
  NotebookPen,
  Target,
} from 'lucide-react';

import GlassCard from '../ui/GlassCard';
import LessonContentRenderer from './LessonContentRenderer';
import { ExpandableSection, CodeDemo } from './InteractiveLearningElements';

// ========================================
// STRUCTURED LESSON SECTIONS
// ========================================
// Renders the optional `lesson.learning` object written by the course
// content pipeline. Every section is data-driven and renders nothing when
// its data is missing, so the same components work for any course,
// subject or length — and lessons without structured content are
// unaffected.

const PRACTICE_LABELS = {
  'short-answer': 'Short answer',
  'output-prediction': 'Predict the output',
  debugging: 'Debugging',
  coding: 'Coding challenge',
  'sql-exercise': 'SQL exercise',
  'schema-design': 'Schema design',
  calculation: 'Calculation',
  derivation: 'Derivation',
  conceptual: 'Conceptual',
  'case-study': 'Case study',
  scenario: 'Decision scenario',
  'design-task': 'Design challenge',
  critique: 'Critique',
  'technique-drill': 'Technique drill',
  'listening-task': 'Listening task',
  'theory-exercise': 'Theory exercise',
  reflection: 'Reflection',
  project: 'Mini project',
};

/* ==============================
   Learning objectives (replaces the single objective line)
   ============================== */
export function LessonObjectives({ objectives }) {
  if (!objectives?.length) return null;

  return (
    <div className="learn-objective">
      <div className="learn-objective-icon">
        <Target size={16} />
      </div>
      <div>
        <p className="sl-objective-label">By the end of this lesson you will be able to:</p>
        <ul className="sl-list">
          {objectives.map((objective, i) => (
            <li key={i}>{objective}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

/* ==============================
   Worked examples
   ============================== */
export function WorkedExamples({ examples }) {
  if (!examples?.length) return null;

  return (
    <GlassCard>
      <h3 className="learn-section-heading">
        <ListOrdered size={16} />
        Worked Examples
      </h3>

      {examples.map((example, i) => (
        <ExpandableSection
          key={i}
          title={example.title || `Example ${i + 1}`}
          icon={Bookmark}
          defaultOpen={i === 0}
        >
          {example.scenario && <LessonContentRenderer content={example.scenario} />}

          {example.steps?.length > 0 && (
            <ol className="sl-steps">
              {example.steps.map((step, si) => (
                <li key={si}>{step}</li>
              ))}
            </ol>
          )}

          {example.code && (
            <CodeDemo code={example.code} language={example.language || 'text'} codeFile={example.language ? `Example (${example.language})` : undefined} />
          )}

          {example.solution && (
            <div className="sl-solution">
              <span className="sl-solution-label">Solution</span>
              <LessonContentRenderer content={example.solution} />
            </div>
          )}
        </ExpandableSection>
      ))}
    </GlassCard>
  );
}

/* ==============================
   Real-world applications
   ============================== */
export function RealWorldApplications({ applications }) {
  if (!applications?.length) return null;

  return (
    <GlassCard>
      <h3 className="learn-section-heading">
        <Briefcase size={16} />
        Real-World Applications
      </h3>
      <ul className="sl-list">
        {applications.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ul>
    </GlassCard>
  );
}

/* ==============================
   Common mistakes + tips
   ============================== */
export function MistakesAndTips({ mistakes, tips }) {
  if (!mistakes?.length && !tips?.length) return null;

  return (
    <GlassCard>
      <h3 className="learn-section-heading">
        <AlertTriangle size={16} />
        Common Mistakes &amp; Tips
      </h3>

      {(mistakes || []).map((item, i) => (
        <div key={`m-${i}`} className="lcr-callout lcr-callout-warning">
          <div className="lcr-callout-icon">
            <AlertTriangle size={16} />
          </div>
          <div className="lcr-callout-body">
            <span className="lcr-callout-label">{item.mistake}</span>
            <p>{item.fix}</p>
          </div>
        </div>
      ))}

      {(tips || []).map((tip, i) => (
        <div key={`t-${i}`} className="lcr-callout lcr-callout-tip">
          <div className="lcr-callout-icon">
            <Lightbulb size={16} />
          </div>
          <div className="lcr-callout-body">
            <span className="lcr-callout-label">Tip</span>
            <p>{tip}</p>
          </div>
        </div>
      ))}
    </GlassCard>
  );
}

/* ==============================
   Key takeaways + revision notes
   ============================== */
export function TakeawaysAndRevision({ takeaways, revisionNotes }) {
  if (!takeaways?.length && !revisionNotes) return null;

  return (
    <GlassCard>
      <h3 className="learn-section-heading">
        <NotebookPen size={16} />
        Key Takeaways
      </h3>

      {takeaways?.length > 0 && (
        <ul className="sl-list sl-takeaways">
          {takeaways.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      )}

      {revisionNotes && (
        <ExpandableSection title="Revision notes" icon={NotebookPen}>
          <LessonContentRenderer content={revisionNotes} />
        </ExpandableSection>
      )}
    </GlassCard>
  );
}

/* ==============================
   Practice activities (self-check, ungraded)
   ============================== */
function PracticeItem({ item, index }) {
  const [showHint, setShowHint] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);

  return (
    <div className="sl-practice-item">
      <div className="sl-practice-head">
        <span className="badge badge-ghost">{PRACTICE_LABELS[item.type] || 'Practice'}</span>
        <span className="sl-practice-number">#{index + 1}</span>
      </div>

      <LessonContentRenderer content={item.prompt} />

      <div className="sl-practice-actions">
        {item.hint && (
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => setShowHint((v) => !v)}>
            <Lightbulb size={14} />
            {showHint ? 'Hide hint' : 'Hint'}
          </button>
        )}
        {item.answer && (
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => setShowAnswer((v) => !v)}>
            {showAnswer ? <EyeOff size={14} /> : <Eye size={14} />}
            {showAnswer ? 'Hide answer' : 'Show model answer'}
          </button>
        )}
      </div>

      {showHint && item.hint && (
        <div className="lcr-callout lcr-callout-tip">
          <div className="lcr-callout-body">
            <span className="lcr-callout-label">Hint</span>
            <p>{item.hint}</p>
          </div>
        </div>
      )}

      {showAnswer && item.answer && (
        <div className="sl-solution">
          <span className="sl-solution-label">Model answer</span>
          <LessonContentRenderer content={item.answer} />
        </div>
      )}
    </div>
  );
}

export function PracticeActivities({ practice }) {
  if (!practice?.length) return null;

  return (
    <GlassCard>
      <h3 className="learn-section-heading">
        <ClipboardCheck size={16} />
        Practice
      </h3>
      <p className="learn-assignment-instructions">
        Try each activity on your own first, then compare with the model answer.
      </p>
      {practice.map((item, i) => (
        <PracticeItem key={i} item={item} index={i} />
      ))}
    </GlassCard>
  );
}
