import { useState, useRef, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Sparkles, Send, Paperclip, FileText, X } from 'lucide-react';
import useProfile from '../../hooks/useProfile';
import { getCourse } from '../../api/courseApi';
import { sendChatbotMessage, summarizeNotes } from '../../api/chatbotApi';
import { sendAiChatMessage } from '../../api/aiChatApi';
import LessonContentRenderer from '../../components/course/LessonContentRenderer';

export default function AITutor() {
  const { profile } = useProfile();
  const [searchParams] = useSearchParams();
  const [courseContext, setCourseContext] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [attachedFile, setAttachedFile] = useState(null);
  // 'tutor' = existing /api/chatbot, 'finetuned' = Study Buddy model via /api/ai-chat
  const [engine, setEngine] = useState('tutor');
  const scrollRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const courseId = searchParams.get('courseId');
    if (!courseId) {
      setCourseContext(null);
      return;
    }

    getCourse(courseId)
      .then((response) => {
        setCourseContext({
          course: response?.data?.data || response?.data || null,
          moduleId: searchParams.get('moduleId'),
          lessonId: searchParams.get('lessonId'),
        });
      })
      .catch(() => setCourseContext(null));
  }, [searchParams]);

  useEffect(() => {
    // The greeting is (re)written until the conversation starts, so it picks
    // up the student's name and course once they have loaded.
    const onlyGreeting = messages.length === 1 && messages[0].id === 1;
    if (!messages.length || onlyGreeting) {
      const courseName = courseContext?.course?.courseName;
      const greeting = courseName
        ? `Hi ${String(profile?.fullName || 'there').split(' ')[0]}! 🌸 I'm Buddy, your personal AI study companion. You're studying **${courseName}** — ask me anything about it, or upload your lecture notes for an instant summary!`
        : `Hi ${String(profile?.fullName || 'there').split(' ')[0]}! 🌸 I'm Buddy, your personal AI study companion. Ask me anything — any subject, programming question, or upload your study notes for an instant structured summary!`;
      if (!onlyGreeting || messages[0].text !== greeting) {
        setMessages([{ id: 1, role: 'ai', text: greeting }]);
      }
    }
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, profile, courseContext]);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 15 * 1024 * 1024) {
      alert('File size exceeds the 15MB limit. Please choose a smaller file.');
      e.target.value = '';
      return;
    }

    setAttachedFile(file);
  };

  const removeAttachedFile = () => {
    setAttachedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const send = async (text) => {
    const content = (text ?? input).trim();
    if ((!content && !attachedFile) || loading) return;

    // ── Note Summarization Mode ──
    if (attachedFile) {
      const fileToUpload = attachedFile;
      const noteName = fileToUpload.name;
      const noteSizeKb = (fileToUpload.size / 1024).toFixed(1);

      const userMsgText = `📄 **Uploaded notes for summarization:** \`${noteName}\` (${noteSizeKb} KB)${
        content
          ? `\n\n*${content}*`
          : '\n\n*Please provide a comprehensive summary of these notes with key concepts, definitions, and study takeaways.*'
      }`;

      const userMsg = { id: Date.now(), role: 'user', text: userMsgText };
      setMessages((prev) => [...prev, userMsg]);
      setInput('');
      removeAttachedFile();
      setLoading(true);

      try {
        const formData = new FormData();
        formData.append('file', fileToUpload);
        if (content) {
          formData.append('prompt', content);
        }
        if (courseContext?.course?._id) {
          formData.append('courseId', courseContext.course._id);
        }

        const response = await summarizeNotes(formData);
        const reply = response?.data?.data?.answer;
        if (!reply) throw new Error('Buddy could not summarize this file.');
        const notice = response?.data?.data?.notice;
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now() + 1,
            role: 'ai',
            text: notice ? `${reply}\n\n*${notice}*` : reply,
          },
        ]);
      } catch (error) {
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now() + 1,
            role: 'ai',
            text:
              error?.response?.data?.message ||
              error.message ||
              'Something went wrong while summarizing your notes. Please make sure the file contains readable text and try again.',
          },
        ]);
      } finally {
        setLoading(false);
      }
      return;
    }

    // ── Standard Chat Mode ──
    const userMsg = { id: Date.now(), role: 'user', text: content };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      if (engine === 'finetuned') {
        // The fine-tuned model only accepts a single message (no history or course context)
        const response = await sendAiChatMessage({ message: content });
        const reply = response?.data?.reply;
        if (!reply) throw new Error('The model returned no answer.');
        setMessages((prev) => [...prev, { id: Date.now() + 1, role: 'ai', text: reply }]);
        return;
      }

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
      // Set when the AI model was unavailable and a built-in answer was used.
      const notice = response?.data?.data?.notice;
      setMessages((prev) => [
        ...prev,
        { id: Date.now() + 1, role: 'ai', text: notice ? `${reply}\n\n*${notice}*` : reply },
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          role: 'ai',
          text:
            error?.response?.data?.message ||
            error.message ||
            'Something went wrong while generating the response. Please try again.',
        },
      ]);
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
          <h1>
            <Sparkles size={22} style={{ color: 'var(--color-accent)', verticalAlign: '-3px' }} /> Buddy
          </h1>
          <p>
            {courseContext?.course?.courseName
              ? `Studying: ${courseContext.course.courseName}`
              : 'Ask questions, get explanations, debug code, or upload notes to summarize — anytime.'}
          </p>
        </div>
        <div className="ai-tool-row" style={{ marginBottom: 0 }}>
          <button
            className={`chip${engine === 'tutor' ? ' active' : ''}`}
            onClick={() => setEngine('tutor')}
            disabled={loading}
          >
            Buddy
          </button>
          <button
            className={`chip${engine === 'finetuned' ? ' active' : ''}`}
            onClick={() => setEngine('finetuned')}
            disabled={loading}
          >
            Fine-tuned model
          </button>
          <button
            className="chip"
            onClick={() => fileInputRef.current?.click()}
            disabled={loading}
            title="Upload notes (PDF, TXT, MD) to summarize"
          >
            <FileText size={14} style={{ verticalAlign: '-2px', marginRight: '6px' }} />
            Upload Notes
          </button>
        </div>
      </div>

      <div className="ai-chat-window" ref={scrollRef}>
        {messages.map((m) => (
          <div key={m.id} className={`ai-message ${m.role} animate-fade-in-up`}>
            <div className="ai-message-avatar">{m.role === 'ai' ? '🌸' : String(profile?.fullName || 'S')[0]}</div>
            {m.role === 'ai' ? (
              <div className="ai-message-bubble">
                <LessonContentRenderer content={m.text} className="ai-markdown" />
              </div>
            ) : (
              <div className="ai-message-bubble" style={{ whiteSpace: 'pre-wrap' }}>
                {m.text}
              </div>
            )}
          </div>
        ))}
        {loading && (
          <div className="ai-message ai animate-fade-in-up">
            <div className="ai-message-avatar">🌸</div>
            <div className="ai-message-bubble" style={{ color: 'var(--text-tertiary)' }}>
              {attachedFile ? 'Reading and summarizing your notes…' : 'Thinking…'}
            </div>
          </div>
        )}
      </div>

      {attachedFile && (
        <div className="ai-file-preview animate-fade-in-up">
          <div className="ai-file-info">
            <FileText size={18} className="ai-file-icon" />
            <div className="ai-file-meta">
              <span className="ai-file-name">{attachedFile.name}</span>
              <span className="ai-file-size">{(attachedFile.size / 1024).toFixed(1)} KB • Ready for summarization</span>
            </div>
          </div>
          <button
            type="button"
            className="ai-file-remove-btn"
            onClick={removeAttachedFile}
            title="Remove attached notes"
          >
            <X size={16} />
          </button>
        </div>
      )}

      <div className="ai-input-bar">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".pdf,.txt,.md,.doc,.docx"
          style={{ display: 'none' }}
        />
        <button
          type="button"
          className="ai-attach-btn"
          title="Upload notes (PDF, TXT, MD) to summarize"
          onClick={() => fileInputRef.current?.click()}
          disabled={loading}
        >
          <Paperclip size={18} />
        </button>
        <input
          type="text"
          placeholder={
            attachedFile
              ? "Add specific instructions (e.g. 'Focus on core definitions') or press Enter to summarize..."
              : "Ask Buddy anything, or attach notes to summarize..."
          }
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={loading}
        />
        <button
          className="ai-send-btn"
          onClick={() => send()}
          disabled={(!input.trim() && !attachedFile) || loading}
          title={attachedFile ? 'Summarize notes' : 'Send message'}
        >
          <Send size={16} />
        </button>
      </div>
    </div>
  );
}
