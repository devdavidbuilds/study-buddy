import { useState, useEffect, useRef, useMemo } from 'react';
import { Play, Pause, RotateCcw } from 'lucide-react';

// ========================================
// VISUAL EXPLANATIONS
// ========================================
// Lightweight, topic-matched CSS/SVG animations that help students
// visualize difficult CS concepts. The component inspects lesson.title
// and lesson.content to decide which (if any) animation to show.
// Returns null when no relevant topic is detected.

/* ---------- Topic detection ---------- */

const TOPIC_PATTERNS = [
  {
    id: 'sorting',
    patterns: [/sorting/i, /bubble\s*sort/i, /selection\s*sort/i, /insertion\s*sort/i, /merge\s*sort/i, /quick\s*sort/i],
  },
  {
    id: 'stack',
    patterns: [/\bstack\b/i, /\bpush\b.*\bpop\b/i, /LIFO/i],
  },
  {
    id: 'queue',
    patterns: [/\bqueue\b/i, /\benqueue\b/i, /\bdequeue\b/i, /FIFO/i],
  },
  {
    id: 'linkedlist',
    patterns: [/linked\s*list/i, /singly\s*linked/i, /doubly\s*linked/i],
  },
  {
    id: 'tree',
    patterns: [/\bbinary\s*tree\b/i, /\bBST\b/, /\btree\s*traversal\b/i, /\binorder\b/i, /\bpreorder\b/i, /\bpostorder\b/i],
  },
  {
    id: 'network',
    patterns: [/\bpacket\b/i, /\bTCP\b/, /\bUDP\b/, /\bOSI\s*model/i, /network\s*layer/i, /\brouting\b/i],
  },
  {
    id: 'process',
    patterns: [/process\s*scheduling/i, /\bnormalization\b/i, /\b[1-3]NF\b/, /\bBCNF\b/i, /process\s*state/i, /process\s*lifecycle/i],
  },
];

function detectTopic(title, content) {
  const combined = `${title || ''} ${content || ''}`;
  for (const topic of TOPIC_PATTERNS) {
    if (topic.patterns.some((p) => p.test(combined))) {
      return topic.id;
    }
  }
  return null;
}

/* ==============================
   Sorting Animation
   ============================== */
function SortingAnimation() {
  const initialArr = useMemo(() => [38, 27, 43, 3, 9, 82, 10], []);
  const [arr, setArr] = useState([...initialArr]);
  const [active, setActive] = useState([-1, -1]);
  const [sorted, setSorted] = useState(false);
  const [running, setRunning] = useState(false);
  const timerRef = useRef(null);

  const maxVal = Math.max(...initialArr);

  const runSort = () => {
    if (running) return;
    setRunning(true);
    setSorted(false);

    const steps = [];
    const copy = [...initialArr];

    // Bubble sort to generate steps
    for (let i = 0; i < copy.length; i++) {
      for (let j = 0; j < copy.length - i - 1; j++) {
        steps.push({ compare: [j, j + 1], arr: [...copy] });
        if (copy[j] > copy[j + 1]) {
          [copy[j], copy[j + 1]] = [copy[j + 1], copy[j]];
          steps.push({ swap: [j, j + 1], arr: [...copy] });
        }
      }
    }
    steps.push({ done: true, arr: [...copy] });

    let stepIdx = 0;
    timerRef.current = setInterval(() => {
      if (stepIdx >= steps.length) {
        clearInterval(timerRef.current);
        setRunning(false);
        setSorted(true);
        setActive([-1, -1]);
        return;
      }
      const step = steps[stepIdx];
      setArr([...step.arr]);
      if (step.compare) setActive(step.compare);
      else if (step.swap) setActive(step.swap);
      else setActive([-1, -1]);
      stepIdx++;
    }, 400);
  };

  const reset = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setArr([...initialArr]);
    setActive([-1, -1]);
    setSorted(false);
    setRunning(false);
  };

  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); }, []);

  return (
    <div className="ve-animation-box">
      <div className="ve-label">Bubble Sort Visualization</div>
      <div className="ve-bars">
        {arr.map((val, i) => (
          <div
            key={i}
            className={`ve-bar ${active.includes(i) ? 've-bar-active' : ''} ${sorted ? 've-bar-sorted' : ''}`}
            style={{ height: `${(val / maxVal) * 100}%` }}
          >
            <span className="ve-bar-value">{val}</span>
          </div>
        ))}
      </div>
      <div className="ve-controls">
        <button type="button" className="btn btn-primary btn-sm" onClick={runSort} disabled={running}>
          <Play size={14} /> {running ? 'Sorting…' : 'Sort'}
        </button>
        <button type="button" className="btn btn-ghost btn-sm" onClick={reset}>
          <RotateCcw size={14} /> Reset
        </button>
      </div>
    </div>
  );
}

/* ==============================
   Stack Animation
   ============================== */
function StackAnimation() {
  const [stack, setStack] = useState([]);
  const [nextVal, setNextVal] = useState(1);
  const maxSize = 6;

  const push = () => {
    if (stack.length >= maxSize) return;
    setStack((prev) => [...prev, nextVal]);
    setNextVal((v) => v + 1);
  };

  const pop = () => {
    setStack((prev) => prev.slice(0, -1));
  };

  const reset = () => {
    setStack([]);
    setNextVal(1);
  };

  return (
    <div className="ve-animation-box">
      <div className="ve-label">Stack — LIFO</div>
      <div className="ve-stack-container">
        <div className="ve-stack">
          {stack.length === 0 && (
            <div className="ve-stack-empty">Empty</div>
          )}
          {[...stack].reverse().map((val, i) => (
            <div
              key={`${val}-${i}`}
              className={`ve-stack-item ${i === 0 ? 've-stack-top' : ''}`}
              style={{ animationDelay: `${i * 0.05}s` }}
            >
              {val}
              {i === 0 && <span className="ve-stack-pointer">← top</span>}
            </div>
          ))}
        </div>
      </div>
      <div className="ve-controls">
        <button type="button" className="btn btn-primary btn-sm" onClick={push} disabled={stack.length >= maxSize}>
          Push
        </button>
        <button type="button" className="btn btn-ghost btn-sm" onClick={pop} disabled={stack.length === 0}>
          Pop
        </button>
        <button type="button" className="btn btn-ghost btn-sm" onClick={reset}>
          <RotateCcw size={14} /> Reset
        </button>
      </div>
    </div>
  );
}

/* ==============================
   Queue Animation
   ============================== */
function QueueAnimation() {
  const [queue, setQueue] = useState([]);
  const [nextVal, setNextVal] = useState(1);
  const maxSize = 6;

  const enqueue = () => {
    if (queue.length >= maxSize) return;
    setQueue((prev) => [...prev, nextVal]);
    setNextVal((v) => v + 1);
  };

  const dequeue = () => {
    setQueue((prev) => prev.slice(1));
  };

  const reset = () => {
    setQueue([]);
    setNextVal(1);
  };

  return (
    <div className="ve-animation-box">
      <div className="ve-label">Queue — FIFO</div>
      <div className="ve-queue-container">
        {queue.length === 0 && (
          <div className="ve-stack-empty">Empty</div>
        )}
        {queue.map((val, i) => (
          <div
            key={`${val}-${i}`}
            className={`ve-queue-item ${i === 0 ? 've-queue-front' : ''} ${i === queue.length - 1 ? 've-queue-rear' : ''}`}
          >
            {val}
          </div>
        ))}
      </div>
      {queue.length > 0 && (
        <div className="ve-queue-labels">
          <span className="ve-queue-label-front">Front</span>
          <span className="ve-queue-label-rear">Rear</span>
        </div>
      )}
      <div className="ve-controls">
        <button type="button" className="btn btn-primary btn-sm" onClick={enqueue} disabled={queue.length >= maxSize}>
          Enqueue
        </button>
        <button type="button" className="btn btn-ghost btn-sm" onClick={dequeue} disabled={queue.length === 0}>
          Dequeue
        </button>
        <button type="button" className="btn btn-ghost btn-sm" onClick={reset}>
          <RotateCcw size={14} /> Reset
        </button>
      </div>
    </div>
  );
}

/* ==============================
   Linked List Animation
   ============================== */
function LinkedListAnimation() {
  const [nodes, setNodes] = useState([10, 20, 30]);
  const [nextVal, setNextVal] = useState(40);

  const addNode = () => {
    if (nodes.length >= 7) return;
    setNodes((prev) => [...prev, nextVal]);
    setNextVal((v) => v + 10);
  };

  const removeNode = () => {
    setNodes((prev) => prev.slice(0, -1));
  };

  const reset = () => {
    setNodes([10, 20, 30]);
    setNextVal(40);
  };

  return (
    <div className="ve-animation-box">
      <div className="ve-label">Singly Linked List</div>
      <div className="ve-ll-container">
        {nodes.map((val, i) => (
          <div key={i} className="ve-ll-node-wrap">
            <div className="ve-ll-node">
              <span className="ve-ll-data">{val}</span>
              <span className="ve-ll-next">{i < nodes.length - 1 ? '→' : '∅'}</span>
            </div>
            {i < nodes.length - 1 && <div className="ve-ll-arrow">→</div>}
          </div>
        ))}
        {nodes.length === 0 && (
          <div className="ve-stack-empty">NULL</div>
        )}
      </div>
      <div className="ve-controls">
        <button type="button" className="btn btn-primary btn-sm" onClick={addNode} disabled={nodes.length >= 7}>
          Append
        </button>
        <button type="button" className="btn btn-ghost btn-sm" onClick={removeNode} disabled={nodes.length === 0}>
          Remove Last
        </button>
        <button type="button" className="btn btn-ghost btn-sm" onClick={reset}>
          <RotateCcw size={14} /> Reset
        </button>
      </div>
    </div>
  );
}

/* ==============================
   Network Packet Animation
   ============================== */
function NetworkAnimation() {
  const [sending, setSending] = useState(false);
  const [packetPos, setPacketPos] = useState(-1);
  const nodes = ['Client', 'Router', 'Switch', 'Server'];
  const timerRef = useRef(null);

  const sendPacket = () => {
    if (sending) return;
    setSending(true);
    setPacketPos(0);

    let pos = 0;
    timerRef.current = setInterval(() => {
      pos++;
      if (pos >= nodes.length) {
        clearInterval(timerRef.current);
        setSending(false);
        setPacketPos(-1);
        return;
      }
      setPacketPos(pos);
    }, 800);
  };

  const reset = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setSending(false);
    setPacketPos(-1);
  };

  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); }, []);

  return (
    <div className="ve-animation-box">
      <div className="ve-label">Network Packet Traversal</div>
      <div className="ve-network-container">
        {nodes.map((name, i) => (
          <div key={i} className="ve-network-node-wrap">
            <div className={`ve-network-node ${packetPos === i ? 've-network-active' : ''}`}>
              <div className="ve-network-icon">
                {i === 0 ? '💻' : i === nodes.length - 1 ? '🖥️' : '🔀'}
              </div>
              <span>{name}</span>
            </div>
            {i < nodes.length - 1 && (
              <div className="ve-network-link">
                <div className={`ve-network-wire ${packetPos === i ? 've-network-pulse' : ''}`} />
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="ve-controls">
        <button type="button" className="btn btn-primary btn-sm" onClick={sendPacket} disabled={sending}>
          <Play size={14} /> Send Packet
        </button>
        <button type="button" className="btn btn-ghost btn-sm" onClick={reset}>
          <RotateCcw size={14} /> Reset
        </button>
      </div>
    </div>
  );
}

/* ==============================
   Process / Step-by-step Flow
   ============================== */
function ProcessFlowAnimation() {
  const steps = ['New', 'Ready', 'Running', 'Waiting', 'Terminated'];
  const [activeStep, setActiveStep] = useState(-1);
  const [running, setRunning] = useState(false);
  const timerRef = useRef(null);

  const runFlow = () => {
    if (running) return;
    setRunning(true);
    setActiveStep(0);

    let step = 0;
    timerRef.current = setInterval(() => {
      step++;
      if (step >= steps.length) {
        clearInterval(timerRef.current);
        setRunning(false);
        return;
      }
      setActiveStep(step);
    }, 900);
  };

  const reset = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setRunning(false);
    setActiveStep(-1);
  };

  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); }, []);

  return (
    <div className="ve-animation-box">
      <div className="ve-label">Process State Transition</div>
      <div className="ve-process-flow">
        {steps.map((step, i) => (
          <div key={i} className="ve-process-step-wrap">
            <div
              className={`ve-process-step ${activeStep >= i ? 've-process-active' : ''} ${activeStep === i ? 've-process-current' : ''}`}
            >
              {step}
            </div>
            {i < steps.length - 1 && (
              <div className={`ve-process-arrow ${activeStep > i ? 've-process-arrow-active' : ''}`}>
                →
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="ve-controls">
        <button type="button" className="btn btn-primary btn-sm" onClick={runFlow} disabled={running}>
          <Play size={14} /> Animate
        </button>
        <button type="button" className="btn btn-ghost btn-sm" onClick={reset}>
          <RotateCcw size={14} /> Reset
        </button>
      </div>
    </div>
  );
}

/* ==============================
   Binary Tree Animation
   ============================== */
function TreeAnimation() {
  const [nodes, setNodes] = useState([50, 30, 70, 20, 40]);
  const [highlighted, setHighlighted] = useState(-1);
  const [running, setRunning] = useState(false);
  const timerRef = useRef(null);

  const runTraversal = () => {
    if (running) return;
    setRunning(true);

    // In-order-ish traversal simulation (left-root-right for sorted array)
    const sorted = [...nodes].sort((a, b) => a - b);
    let step = 0;

    timerRef.current = setInterval(() => {
      if (step >= sorted.length) {
        clearInterval(timerRef.current);
        setRunning(false);
        setHighlighted(-1);
        return;
      }
      setHighlighted(nodes.indexOf(sorted[step]));
      step++;
    }, 700);
  };

  const reset = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setRunning(false);
    setHighlighted(-1);
  };

  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); }, []);

  // Simple tree-as-array layout (index 0 = root, 1,2 = children, 3,4 = grandchildren)
  const rows = [
    [0],
    [1, 2],
    [3, 4],
  ];

  return (
    <div className="ve-animation-box">
      <div className="ve-label">Binary Tree Traversal</div>
      <div className="ve-tree-container">
        {rows.map((row, ri) => (
          <div key={ri} className="ve-tree-row">
            {row.map((ni) => (
              ni < nodes.length ? (
                <div
                  key={ni}
                  className={`ve-tree-node ${highlighted === ni ? 've-tree-highlighted' : ''}`}
                >
                  {nodes[ni]}
                </div>
              ) : (
                <div key={ni} className="ve-tree-node ve-tree-empty" />
              )
            ))}
          </div>
        ))}
        {/* SVG connectors */}
        <svg className="ve-tree-lines" viewBox="0 0 200 100" preserveAspectRatio="none">
          <line x1="100" y1="12" x2="55" y2="42" stroke="var(--border-color-hover)" strokeWidth="1.5" />
          <line x1="100" y1="12" x2="145" y2="42" stroke="var(--border-color-hover)" strokeWidth="1.5" />
          {nodes.length > 3 && (
            <line x1="55" y1="52" x2="32" y2="82" stroke="var(--border-color-hover)" strokeWidth="1.5" />
          )}
          {nodes.length > 4 && (
            <line x1="55" y1="52" x2="78" y2="82" stroke="var(--border-color-hover)" strokeWidth="1.5" />
          )}
        </svg>
      </div>
      <div className="ve-controls">
        <button type="button" className="btn btn-primary btn-sm" onClick={runTraversal} disabled={running}>
          <Play size={14} /> In-Order
        </button>
        <button type="button" className="btn btn-ghost btn-sm" onClick={reset}>
          <RotateCcw size={14} /> Reset
        </button>
      </div>
    </div>
  );
}

/* ==============================
   Main Export
   ============================== */
export default function VisualExplanations({ title, content }) {
  const topic = useMemo(() => detectTopic(title, content), [title, content]);

  if (!topic) return null;

  const AnimationComponent = {
    sorting: SortingAnimation,
    stack: StackAnimation,
    queue: QueueAnimation,
    linkedlist: LinkedListAnimation,
    tree: TreeAnimation,
    network: NetworkAnimation,
    process: ProcessFlowAnimation,
  }[topic];

  if (!AnimationComponent) return null;

  return (
    <div className="ve-wrapper">
      <AnimationComponent />
    </div>
  );
}
