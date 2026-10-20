import { useState, useRef, useEffect } from 'react';
import { Sparkles, X, Send } from 'lucide-react';
import { aiActions, getAiResponse } from '../../data/codeLabData';

export default function AIPanel({ open, onClose, problem, lastError, code, language, lastOutput }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [hintIndex, setHintIndex] = useState(0);
  const scrollRef = useRef(null);

  useEffect(() => {
    // Reset the conversation when the problem changes
    setMessages([{ role: 'ai', text: `Hi! I'm your Code Lab AI Assistant 🌸 Ask me anything about "${problem.title}" — I'll guide you with hints rather than giving away the full solution right away.` }]);
    setHintIndex(0);
  }, [problem.id, problem.title]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const ask = (actionId, label) => {
    setMessages(prev => [...prev, { role: 'user', text: label }]);
    setTimeout(() => {
      let response;
      if (actionId === 'explain-error') {
        response = lastError
          ? `The issue seems to be around: \`${lastError.substring(0, 200)}\`. Review the latest test case and compare your output with the expected behavior.`
          : "I don't see any errors from your last run — try running your code first, then ask again.";
      } else if (actionId === 'give-hint') {
        response = getAiResponse('give-hint', problem, hintIndex);
        setHintIndex(n => Math.min(n + 1, (problem.hints?.length || 1) - 1));
      } else {
        response = getAiResponse(actionId, problem, hintIndex);
      }
      setMessages(prev => [...prev, { role: 'ai', text: response }]);
    }, 450);
  };

  const sendFreeform = () => {
    const text = input.trim();
    if (!text) return;
    setMessages(prev => [...prev, { role: 'user', text }]);
    setInput('');
    setTimeout(() => {
      setMessages(prev => [...prev, { role: 'ai', text: getAiResponse('freeform', problem, hintIndex) }]);
    }, 450);
  };

  if (!open) return null;

  return (
    <div className="codelab-ai-panel">
      <div className="codelab-ai-header">
        <span><Sparkles size={15} /> AI Assistant</span>
        <button onClick={onClose} aria-label="Close AI Assistant"><X size={16} /></button>
      </div>

      <div className="codelab-ai-actions">
        {aiActions.map(a => (
          <button key={a.id} className="codelab-ai-action-chip" onClick={() => ask(a.id, a.label)}>
            {a.label}
          </button>
        ))}
      </div>

      <div className="codelab-ai-messages" ref={scrollRef}>
        {messages.map((m, i) => (
          <div key={i} className={`codelab-ai-message ${m.role}`}>
            <div className="codelab-ai-bubble">{m.text}</div>
          </div>
        ))}
      </div>

      <div className="codelab-ai-input-row">
        <input
          type="text"
          placeholder="Ask about this problem..."
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && sendFreeform()}
        />
        <button onClick={sendFreeform} disabled={!input.trim()} aria-label="Send"><Send size={14} /></button>
      </div>
    </div>
  );
}
