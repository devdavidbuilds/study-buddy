import { useState, useRef, useEffect } from 'react';
import { Sparkles, Send, Mic, FileText, HelpCircle, Layers, Code2 } from 'lucide-react';
import useProfile from '../../hooks/useProfile';

const tools = [
  { label: 'Summarize Notes', icon: FileText },
  { label: 'Generate Quiz', icon: HelpCircle },
  { label: 'Make Flashcards', icon: Layers },
  { label: 'Coding Help', icon: Code2 },
];

const canned = [
  "Great question! Let's break it down step by step so it really sticks.",
  "Here's a simple way to think about it: imagine each piece as a small building block.",
  "I've put together a short explanation — want me to turn this into flashcards too?",
  "Good instinct asking that. Here's the key idea, explained simply:",
];

export default function AITutor() {
  const { profile } = useProfile();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [aiSuggestedPrompts] = useState(['Summarize my latest notes', 'Create a study plan for this week', 'Explain recursion like I am 12', 'Quiz me on arrays and hashes']);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (!messages.length) {
      setMessages([{ id: 1, role: 'ai', text: `Hi ${String(profile?.name || 'there').split(' ')[0]}! 🌸 I'm your AI Tutor. Ask me anything about your courses, or try one of the suggestions below.` }]);
    }
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, profile]);

  const send = (text) => {
    const content = (text ?? input).trim();
    if (!content) return;
    const userMsg = { id: Date.now(), role: 'user', text: content };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setTimeout(() => {
      const reply = canned[Math.floor(Math.random() * canned.length)];
      setMessages(prev => [...prev, { id: Date.now() + 1, role: 'ai', text: reply }]);
    }, 500);
  };

  return (
    <div className="ai-tutor-page animate-fade-in">
      <div className="page-header" style={{ marginBottom: 'var(--space-4)' }}>
        <div>
          <h1><Sparkles size={22} style={{ color: 'var(--color-accent)', verticalAlign: '-3px' }} /> AI Tutor</h1>
          <p>Ask questions, summarize notes, or generate a quiz — anytime.</p>
        </div>
      </div>

      <div className="ai-tool-row">
        {tools.map(t => (
          <button key={t.label} className="chip" onClick={() => send(t.label)}>
            <t.icon size={13} /> {t.label}
          </button>
        ))}
      </div>

      <div className="ai-chat-window" ref={scrollRef}>
        {messages.map(m => (
          <div key={m.id} className={`ai-message ${m.role} animate-fade-in-up`}>
            <div className="ai-message-avatar">{m.role === 'ai' ? '🌸' : String(profile?.name || 'S')[0]}</div>
            <div className="ai-message-bubble">{m.text}</div>
          </div>
        ))}
      </div>

      <div className="ai-suggestions">
        {aiSuggestedPrompts.map(p => (
          <span key={p} className="chip" onClick={() => send(p)}>{p}</span>
        ))}
      </div>

      <div className="ai-input-bar">
        <input
          type="text"
          placeholder="Ask your AI Tutor anything..."
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && send()}
        />
        <button className="ai-mic-btn" title="Voice input"><Mic size={18} /></button>
        <button className="ai-send-btn" onClick={() => send()} disabled={!input.trim()}>
          <Send size={16} />
        </button>
      </div>
    </div>
  );
}
