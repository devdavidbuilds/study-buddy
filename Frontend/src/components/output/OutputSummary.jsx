import { Clock, Cpu, CheckCircle2 } from 'lucide-react';

export default function OutputSummary({ status, time, memory, passedCount, totalCount, error }) {
  if (error) {
    return (
      <div className="codelab-output-summary error">
        <span className="codelab-output-status">{status}</span>
      </div>
    );
  }

  const allPassed = passedCount === totalCount;

  return (
    <div className={`codelab-output-summary ${allPassed ? 'success' : 'partial'}`}>
      <span className="codelab-output-status">{status}</span>
      <div className="codelab-output-stats">
        <span><Clock size={13} /> {time} ms</span>
        <span><Cpu size={13} /> {memory} MB</span>
        <span><CheckCircle2 size={13} /> {passedCount}/{totalCount} passed</span>
      </div>
    </div>
  );
}
