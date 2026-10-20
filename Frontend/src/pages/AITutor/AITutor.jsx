import { useState, useRef, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Sparkles, Send, Mic, FileText, HelpCircle, Layers, Code2 } from 'lucide-react';
import useProfile from '../../hooks/useProfile';
import { getCourse } from '../../api/courseApi';
import { sendChatbotMessage } from '../../api/chatbotApi';

const tools = [
  { label: 'Summarize Notes', icon: FileText },
  { label: 'Generate Quiz', icon: HelpCircle },
  { label: 'Make Flashcards', icon: Layers },
  { label: 'Coding Help', icon: Code2 },
];

export default function AITutor() {
  const { profile } = useProfile();
  const [searchParams] = useSearchParams();
  const [courseContext, setCourseContext] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [aiSuggestedPrompts] = useState([
    'Explain recursion like I\'m 12',
    'What is the difference between stack and queue?',
    'Write a C++ program to check if a number is prime',
    'Explain TCP three-way handshake',
  ]);
  const scrollRef = useRef(null);

  useEffect(() => {
    const courseId = searchParams.get('courseId');
    if (!courseId) {
      setCourseContext(null);
      return;
    }

    getCourse(courseId).then((response) => {
      setCourseContext({
        course: response?.data?.data || response?.data || null,
        moduleId: searchParams.get('moduleId'),
        lessonId: searchParams.get('lessonId'),
      });
    }).catch(() => setCourseContext(null));
  }, [searchParams]);

  useEffect(() => {
    if (!messages.length) {
      const courseName = courseContext?.course?.courseName;
      const greeting = courseName
        ? `Hi ${String(profile?.name || 'there').split(' ')[0]}! 🌸 I'm your AI Tutor. You're studying **${courseName}** — ask me anything about it, or any other topic!`
        : `Hi ${String(profile?.name || 'there').split(' ')[0]}! 🌸 I'm your AI Tutor. Ask me anything — any subject, programming question, or concept.`;
      setMessages([{ id: 1, role: 'ai', text: greeting }]);
    }
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, profile, courseContext]);

  const send = async (text) => {
    const content = (text ?? input).trim();
    if (!content || loading) return;
    const userMsg = { id: Date.now(), role: 'user', text: content };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      // Build payload — courseId is optional
      const payload = {
        message: content,
        history: messages.map((message) => ({
          role: message.role === 'ai' ? 'assistant' : 'user',
          content: message.text,
        })),
      };

      // Add course context only when available
      if (courseContext?.course?._id) {
        payload.courseId = courseContext.course._id;
        payload.context = {
          courseName: courseContext.course.courseName,
          moduleId: courseContext.moduleId,
          lessonId: courseContext.lessonId,
        };
      }

      const response = await sendChatbotMessage(payload);
      const reply = response?.data?.data?.answer;
      if (!reply) throw new Error('The tutor returned no answer.');
      setMessages(prev => [...prev, { id: Date.now() + 1, role: 'ai', text: reply }]);
    } catch (error) {
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        role: 'ai',
        text: error?.response?.data?.message || error.message || 'Something went wrong while generating the response. Please try again.',
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  return (
    <div className="ai-tutor-page animate-fade-in">
      <div className="page-header" style={{ marginBottom: 'var(--space-4)' }}>
        <div>
          <h1><Sparkles size={22} style={{ color: 'var(--color-accent)', verticalAlign: '-3px' }} /> AI Tutor</h1>
          <p>
            {courseContext?.course?.courseName
              ? `Studying: ${courseContext.course.courseName}`
              : 'Ask questions, get explanations, debug code — anytime.'}
          </p>
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
            <div className="ai-message-bubble" style={{ whiteSpace: 'pre-wrap' }}>{m.text}</div>
          </div>
        ))}
        {loading && (
          <div className="ai-message ai animate-fade-in-up">
            <div className="ai-message-avatar">🌸</div>
            <div className="ai-message-bubble" style={{ color: 'var(--text-tertiary)' }}>Thinking…</div>
          </div>
        )}
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
          onKeyDown={handleKeyDown}
          disabled={loading}
        />
        <button className="ai-mic-btn" title="Voice input"><Mic size={18} /></button>
        <button className="ai-send-btn" onClick={() => send()} disabled={!input.trim() || loading}>
          <Send size={16} />
        </button>
      </div>
    </div>
  );
}
