import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Check,
  Plus,
  ChevronLeft,
  ChevronRight,
  Trash2,
  Pencil,
  Clock,
  Target,
  CalendarCheck,
  BookOpen,
  Search,
  Play,
  Pause,
  RotateCcw,
  Bell,
  Coffee,
  Sparkles,
  X,
} from 'lucide-react';
import GlassCard from '../../components/ui/GlassCard';
import PageState from '../../components/ui/PageState';
import Modal from '../../components/ui/Modal';
import ProgressBar from '../../components/ui/ProgressBar';
import { getCourses, getCourse } from '../../api/courseApi';
import {
  getStudySessions,
  createStudySession,
  updateStudySession,
  deleteStudySession,
  getStudyGoals,
  setStudyGoal,
} from '../../api/plannerApi';

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const DURATION_OPTIONS = [30, 45, 60, 90, 120, 180];
const COURSE_COLORS = ['#E75480', '#6FA8DC', '#93C47D', '#F6B26B', '#8E7CC3', '#76A5AF'];

// Local calendar day as YYYY-MM-DD (toISOString would shift to UTC).
const toDateKey = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

const addDays = (d, days) => {
  const next = new Date(d);
  next.setDate(next.getDate() + days);
  return next;
};

const startOfWeek = (d) => {
  const monday = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7));
  return monday;
};

const formatMinutes = (minutes) => {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (!h) return `${m}m`;
  return m ? `${h}h ${m}m` : `${h}h`;
};

const formatSeconds = (totalSec) => {
  const sec = Math.max(0, Math.floor(totalSec));
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
};

const endTime = (startTime, duration) => {
  const [h, m] = startTime.split(':').map(Number);
  const total = h * 60 + m + duration;
  return `${String(Math.floor(total / 60) % 24).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
};

const courseColor = (courseId = '') => {
  let hash = 0;
  for (const ch of String(courseId)) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
  return COURSE_COLORS[hash % COURSE_COLORS.length];
};

// Play a pleasant two-tone chime via Web Audio API when study time expires
const playExpirationAlarm = () => {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;

    // Tone 1: D5 (587 Hz)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(587.33, now);
    gain1.gain.setValueAtTime(0.25, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.4);

    // Tone 2: A5 (880 Hz)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(880, now + 0.22);
    gain2.gain.setValueAtTime(0.3, now + 0.22);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.85);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.22);
    osc2.stop(now + 0.85);
  } catch {
    // Audio Context unavailable or restricted by browser
  }
};

const emptyForm = (date) => ({
  id: null,
  course: null,
  moduleId: '',
  moduleName: '',
  date,
  startTime: '18:00',
  durationMinutes: 60,
  title: '',
  notes: '',
  repeatWeeks: 0,
  weeklyGoalHours: '',
});

export default function Planner() {
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date()));
  const [sessions, setSessions] = useState([]);
  const [todaySessions, setTodaySessions] = useState([]);
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionError, setActionError] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(() => emptyForm(toDateKey(new Date())));
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  // Available modules for the chosen course
  const [courseModules, setCourseModules] = useState([]);
  const [loadingModules, setLoadingModules] = useState(false);

  const [courseQuery, setCourseQuery] = useState('');
  const [courseResults, setCourseResults] = useState([]);
  const [searching, setSearching] = useState(false);

  const [editingGoal, setEditingGoal] = useState(null);
  const [goalHours, setGoalHours] = useState('');

  // ── Active Focus Timer & Expiration Reminder State ──
  const [activeTimer, setActiveTimer] = useState(null);
  const [expiredReminder, setExpiredReminder] = useState(null);

  const todayKey = toDateKey(new Date());
  const weekDays = useMemo(
    () => DAY_LABELS.map((label, i) => {
      const date = addDays(weekStart, i);
      return { label, date, key: toDateKey(date) };
    }),
    [weekStart]
  );
  const weekFrom = weekDays[0].key;
  const weekTo = weekDays[6].key;

  const loadPlanner = useCallback(async () => {
    try {
      const [weekRes, todayRes, goalsRes] = await Promise.all([
        getStudySessions(weekFrom, weekTo),
        getStudySessions(todayKey, todayKey),
        getStudyGoals(),
      ]);
      setSessions(weekRes?.data?.data || []);
      setTodaySessions(todayRes?.data?.data || []);
      setGoals(goalsRes?.data?.data || []);
      setError('');
    } catch (err) {
      setError(err?.response?.data?.message || 'Unable to load your study planner.');
    } finally {
      setLoading(false);
    }
  }, [weekFrom, weekTo, todayKey]);

  useEffect(() => {
    loadPlanner();
  }, [loadPlanner]);

  // Request browser notification permission gently when component mounts
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().catch(() => {});
    }
  }, []);

  // ── Focus Countdown Timer Tick Effect ──
  useEffect(() => {
    if (!activeTimer || !activeTimer.isRunning) return undefined;

    const interval = setInterval(() => {
      setActiveTimer((prev) => {
        if (!prev || !prev.isRunning) return prev;
        if (prev.remainingSeconds <= 1) {
          // Timer expired! Trigger audio chime and modal reminder
          playExpirationAlarm();

          if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
            try {
              new Notification("⏰ Study Time Allocation Expired!", {
                body: `Your allocated time for ${prev.courseName} ${prev.moduleName ? `(${prev.moduleName})` : ''} has ended. Great job!`,
                icon: '/favicon.svg',
              });
            } catch {}
          }

          setExpiredReminder({
            session: prev.session,
            courseName: prev.courseName,
            moduleName: prev.moduleName,
            durationMinutes: Math.round(prev.totalSeconds / 60),
          });

          return { ...prev, remainingSeconds: 0, isRunning: false };
        }
        return { ...prev, remainingSeconds: prev.remainingSeconds - 1 };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [activeTimer?.isRunning]);

  // Debounced course search for the picker.
  useEffect(() => {
    if (!modalOpen || form.id) return undefined;

    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await getCourses({ search: courseQuery.trim(), limit: 8 });
        setCourseResults(Array.isArray(res?.data?.data) ? res.data.data : []);
      } catch {
        setCourseResults([]);
      } finally {
        setSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [courseQuery, modalOpen, form.id]);

  // Load modules whenever a course is picked
  const loadModulesForCourse = async (courseId, fallbackModules = []) => {
    if (fallbackModules && fallbackModules.length > 0) {
      setCourseModules(fallbackModules);
      return;
    }
    setLoadingModules(true);
    try {
      const res = await getCourse(courseId);
      const data = res?.data?.data || res?.data;
      if (data && Array.isArray(data.modules)) {
        setCourseModules(data.modules);
      } else {
        setCourseModules([]);
      }
    } catch {
      setCourseModules([]);
    } finally {
      setLoadingModules(false);
    }
  };

  const openCreate = (date = todayKey) => {
    setForm(emptyForm(date));
    setCourseModules([]);
    setCourseQuery('');
    setFormError('');
    setModalOpen(true);
  };

  const openEdit = (session) => {
    setForm({
      id: session._id,
      course: { _id: session.course, courseName: session.courseName, courseCode: session.courseCode },
      moduleId: session.moduleId || '',
      moduleName: session.moduleName || '',
      date: session.date,
      startTime: session.startTime,
      durationMinutes: session.durationMinutes,
      title: session.title || '',
      notes: session.notes || '',
      repeatWeeks: 0,
      weeklyGoalHours: '',
    });
    setFormError('');
    setModalOpen(true);

    if (session.course) {
      loadModulesForCourse(session.course);
    }
  };

  const handleSelectCourse = (course) => {
    setForm((prev) => ({
      ...prev,
      course,
      moduleId: '',
      moduleName: '',
      title: prev.title || `Prepare for ${course.courseName}`,
    }));
    loadModulesForCourse(course._id, course.modules);
  };

  const updateForm = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const handleSave = async () => {
    setFormError('');

    if (!form.course) {
      setFormError('Please choose a course to prepare for.');
      return;
    }
    if (!form.date || !form.startTime) {
      setFormError('Please pick a date and start time.');
      return;
    }

    setSaving(true);
    try {
      if (form.id) {
        await updateStudySession(form.id, {
          date: form.date,
          startTime: form.startTime,
          durationMinutes: Number(form.durationMinutes),
          title: form.title.trim(),
          notes: form.notes.trim(),
          moduleId: form.moduleId || '',
          moduleName: form.moduleName || '',
        });
      } else {
        await createStudySession({
          courseId: form.course._id,
          date: form.date,
          startTime: form.startTime,
          durationMinutes: Number(form.durationMinutes),
          title: form.title.trim(),
          notes: form.notes.trim(),
          moduleId: form.moduleId || '',
          moduleName: form.moduleName || '',
          repeatWeeks: Number(form.repeatWeeks),
        });

        const goalMinutes = Math.round(Number(form.weeklyGoalHours) * 60);
        if (goalMinutes > 0) await setStudyGoal(form.course._id, goalMinutes);
      }

      setModalOpen(false);
      await loadPlanner();
    } catch (err) {
      setFormError(err?.response?.data?.message || 'Unable to save this session.');
    } finally {
      setSaving(false);
    }
  };

  const toggleComplete = async (session) => {
    setActionError('');
    const flip = (list) =>
      list.map((s) => (s._id === session._id ? { ...s, completed: !s.completed } : s));
    setSessions(flip);
    setTodaySessions(flip);

    try {
      await updateStudySession(session._id, { completed: !session.completed });
    } catch (err) {
      setActionError(err?.response?.data?.message || 'Unable to update the session.');
      loadPlanner();
    }
  };

  const removeSession = async (session) => {
    if (!window.confirm(`Remove the ${session.courseName} session on ${session.date}?`)) return;
    setActionError('');
    try {
      await deleteStudySession(session._id);
      await loadPlanner();
    } catch (err) {
      setActionError(err?.response?.data?.message || 'Unable to remove the session.');
    }
  };

  const saveGoal = async (courseId) => {
    setActionError('');
    try {
      await setStudyGoal(courseId, Math.max(0, Math.round(Number(goalHours || 0) * 60)));
      setEditingGoal(null);
      await loadPlanner();
    } catch (err) {
      setActionError(err?.response?.data?.message || 'Unable to save the weekly goal.');
    }
  };

  // ── Focus Timer Action Triggers ──
  const startSessionTimer = (session) => {
    const totalSec = Math.max(60, Number(session.durationMinutes || 60) * 60);
    setActiveTimer({
      session,
      courseId: session.course,
      courseName: session.courseName,
      courseCode: session.courseCode,
      moduleId: session.moduleId,
      moduleName: session.moduleName,
      totalSeconds: totalSec,
      remainingSeconds: totalSec,
      isRunning: true,
    });
  };

  const startCourseAllocationTimer = (row) => {
    const defaultMins = row.planned || row.goal || 45;
    const totalSec = Math.max(60, defaultMins * 60);
    setActiveTimer({
      session: null,
      courseId: row.courseId,
      courseName: row.courseName,
      courseCode: row.courseCode,
      moduleId: '',
      moduleName: '',
      totalSeconds: totalSec,
      remainingSeconds: totalSec,
      isRunning: true,
    });
  };

  const extendTimer = (extraSeconds = 300) => {
    setActiveTimer((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        remainingSeconds: prev.remainingSeconds + extraSeconds,
        totalSeconds: prev.totalSeconds + extraSeconds,
        isRunning: true,
      };
    });
    setExpiredReminder(null);
  };

  const finishTimerAndMarkDone = async () => {
    if (expiredReminder?.session?._id) {
      await toggleComplete(expiredReminder.session);
    }
    setExpiredReminder(null);
    setActiveTimer(null);
  };

  // Weekly totals and per-course time allocation.
  const plannedMinutes = sessions.reduce((sum, s) => sum + s.durationMinutes, 0);
  const completedMinutes = sessions
    .filter((s) => s.completed)
    .reduce((sum, s) => sum + s.durationMinutes, 0);
  const completedCount = sessions.filter((s) => s.completed).length;
  const completionRate = plannedMinutes ? Math.round((completedMinutes / plannedMinutes) * 100) : 0;

  const allocations = useMemo(() => {
    const byCourse = new Map();
    goals.forEach((g) => {
      byCourse.set(String(g.course), {
        courseId: String(g.course),
        courseName: g.courseName,
        courseCode: g.courseCode,
        goal: g.weeklyMinutes,
        planned: 0,
        completed: 0,
      });
    });
    sessions.forEach((s) => {
      const key = String(s.course);
      const row = byCourse.get(key) || {
        courseId: key,
        courseName: s.courseName,
        courseCode: s.courseCode,
        goal: 0,
        planned: 0,
        completed: 0,
      };
      row.planned += s.durationMinutes;
      if (s.completed) row.completed += s.durationMinutes;
      byCourse.set(key, row);
    });
    return [...byCourse.values()].sort((a, b) => b.planned - a.planned);
  }, [goals, sessions]);

  const weekLabel = `${weekDays[0].date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} – ${weekDays[6].date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}`;
  const isCurrentWeek = weekFrom <= todayKey && todayKey <= weekTo;

  if (loading) return <PageState title="Loading planner" message="Fetching your study schedule…" />;
  if (error) return <PageState type="error" title="Unable to load planner" message={error} onRetry={loadPlanner} />;

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1>Study Planner</h1>
          <p>
            {sessions.length
              ? `${completedCount}/${sessions.length} sessions complete · ${formatMinutes(completedMinutes)} of ${formatMinutes(plannedMinutes)} studied this week`
              : 'Pick a course, select a module, and set aside focused time to study.'}
          </p>
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => openCreate()}>
          <Plus size={16} /> Add Session
        </button>
      </div>

      {/* ── Active Focus Timer Bar / Widget ── */}
      {activeTimer && (
        <GlassCard compact className="active-timer-banner animate-fade-in" style={{ marginBottom: 'var(--space-6)', border: '1px solid var(--color-primary-muted)', background: 'linear-gradient(135deg, rgba(231,84,128,0.06), rgba(99,102,241,0.04))' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--space-3)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Clock size={24} style={{ color: activeTimer.isRunning ? 'var(--color-primary)' : 'var(--text-tertiary)' }} />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                  <h4 style={{ margin: 0, fontSize: 'var(--font-size-base)', fontWeight: 'var(--font-weight-semibold)' }}>
                    {activeTimer.courseName}
                  </h4>
                  {activeTimer.moduleName && (
                    <span className="badge badge-accent" style={{ fontSize: '11px' }}>
                      📖 {activeTimer.moduleName}
                    </span>
                  )}
                </div>
                <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)' }}>
                  {activeTimer.isRunning ? 'Focus session active' : 'Focus session paused'} · Allocated: {formatMinutes(Math.round(activeTimer.totalSeconds / 60))}
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
              <div style={{ fontSize: '1.75rem', fontWeight: 700, fontFamily: 'monospace', letterSpacing: '1px', color: activeTimer.remainingSeconds < 60 ? 'var(--color-danger)' : 'var(--text-primary)' }}>
                {formatSeconds(activeTimer.remainingSeconds)}
              </div>
              <div style={{ display: 'flex', gap: 'var(--space-1)' }}>
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => setActiveTimer((prev) => ({ ...prev, isRunning: !prev.isRunning }))}
                  title={activeTimer.isRunning ? 'Pause Timer' : 'Resume Timer'}
                >
                  {activeTimer.isRunning ? <Pause size={16} /> : <Play size={16} />}
                </button>
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => extendTimer(300)}
                  title="Add 5 minutes"
                >
                  +5m
                </button>
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => {
                    if (window.confirm('Finish this focus timer now?')) {
                      setActiveTimer(null);
                    }
                  }}
                  title="Close Timer"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
          </div>
          <div style={{ marginTop: 'var(--space-2)' }}>
            <ProgressBar
              value={activeTimer.totalSeconds ? Math.min(100, Math.round(((activeTimer.totalSeconds - activeTimer.remainingSeconds) / activeTimer.totalSeconds) * 100)) : 0}
              size="sm"
              color="var(--color-primary)"
            />
          </div>
        </GlassCard>
      )}

      <div className="planner-stats">
        <GlassCard compact className="planner-stat">
          <Clock size={18} />
          <div><strong>{formatMinutes(plannedMinutes)}</strong><span>Planned</span></div>
        </GlassCard>
        <GlassCard compact className="planner-stat">
          <CalendarCheck size={18} />
          <div><strong>{formatMinutes(completedMinutes)}</strong><span>Completed</span></div>
        </GlassCard>
        <GlassCard compact className="planner-stat">
          <Target size={18} />
          <div><strong>{completionRate}%</strong><span>On track</span></div>
        </GlassCard>
        <GlassCard compact className="planner-stat">
          <BookOpen size={18} />
          <div><strong>{allocations.filter((a) => a.planned).length}</strong><span>Courses this week</span></div>
        </GlassCard>
      </div>

      <div className="planner-toolbar">
        <button className="btn btn-ghost btn-icon" onClick={() => setWeekStart((w) => addDays(w, -7))} aria-label="Previous week">
          <ChevronLeft size={18} />
        </button>
        <span className="planner-week-label">{weekLabel}</span>
        <button className="btn btn-ghost btn-icon" onClick={() => setWeekStart((w) => addDays(w, 7))} aria-label="Next week">
          <ChevronRight size={18} />
        </button>
        {!isCurrentWeek && (
          <button className="btn btn-secondary btn-sm" onClick={() => setWeekStart(startOfWeek(new Date()))}>
            This week
          </button>
        )}
      </div>

      {actionError && <div className="planner-error">{actionError}</div>}

      <div className="planner-week">
        {weekDays.map((day, i) => {
          const daySessions = sessions.filter((s) => s.date === day.key);
          const dayMinutes = daySessions.reduce((sum, s) => sum + s.durationMinutes, 0);
          return (
            <GlassCard
              key={day.key}
              compact
              className={`planner-day animate-fade-in-up stagger-${i + 1} ${day.key === todayKey ? 'today' : ''}`}
            >
              <div className="planner-day-head">
                <div>
                  <div className="planner-day-label">{day.label}</div>
                  <div className="planner-day-date">{day.date.getDate()}</div>
                </div>
                <button className="planner-add-btn" onClick={() => openCreate(day.key)} aria-label={`Add session on ${day.label}`}>
                  <Plus size={14} />
                </button>
              </div>

              {daySessions.map((session) => (
                <div
                  key={session._id}
                  className="planner-task"
                  style={{ borderLeftColor: courseColor(session.course) }}
                >
                  <button
                    className={`planner-task-check ${session.completed ? 'done' : ''}`}
                    onClick={() => toggleComplete(session)}
                    aria-label={session.completed ? 'Mark as not done' : 'Mark as done'}
                  >
                    {session.completed && <Check size={11} />}
                  </button>
                  <div className={`planner-task-info ${session.completed ? 'done' : ''}`} onClick={() => openEdit(session)}>
                    <h5>{session.courseName}</h5>
                    {session.moduleName && (
                      <span
                        style={{
                          display: 'inline-block',
                          fontSize: '10px',
                          color: 'var(--color-primary)',
                          background: 'rgba(231,84,128,0.12)',
                          padding: '1px 5px',
                          borderRadius: '4px',
                          marginBottom: '2px',
                        }}
                      >
                        📖 {session.moduleName}
                      </span>
                    )}
                    {session.title && <p>{session.title}</p>}
                    <span>{session.startTime}–{endTime(session.startTime, session.durationMinutes)} · {formatMinutes(session.durationMinutes)}</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <button
                      className="planner-task-timer-btn"
                      onClick={() => startSessionTimer(session)}
                      title="Start Focus Timer for this session"
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--color-primary)',
                        cursor: 'pointer',
                        padding: '2px',
                        opacity: 0.8,
                      }}
                    >
                      <Play size={13} />
                    </button>
                    <button className="planner-task-delete" onClick={() => removeSession(session)} aria-label="Remove session">
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              ))}

              {daySessions.length === 0 ? (
                <p className="planner-empty">Nothing planned</p>
              ) : (
                <p className="planner-day-total">{formatMinutes(dayMinutes)} total</p>
              )}
            </GlassCard>
          );
        })}
      </div>

      {/* ── Course Time Allocation ── */}
      <h3 className="section-title">⏱️ Course Time Allocation</h3>
      <GlassCard className="planner-allocation">
        {allocations.length === 0 ? (
          <p className="planner-empty">
            No courses planned yet. Add a session to start allocating preparation time.
          </p>
        ) : (
          allocations.map((row) => {
            const target = row.goal || row.planned;
            const percent = target ? Math.round((row.completed / target) * 100) : 0;
            return (
              <div key={row.courseId} className="allocation-row">
                <span className="schedule-dot" style={{ background: courseColor(row.courseId) }} />
                <div className="allocation-info">
                  <div className="allocation-title">
                    <h4>{row.courseName}</h4>
                    {row.courseCode && <span className="badge badge-ghost">{row.courseCode}</span>}
                  </div>
                  <ProgressBar value={percent} size="sm" color={courseColor(row.courseId)} />
                  <p>
                    {formatMinutes(row.completed)} done · {formatMinutes(row.planned)} planned
                    {row.goal ? ` · goal ${formatMinutes(row.goal)}/week` : ''}
                    {row.goal && row.planned < row.goal ? ` · ${formatMinutes(row.goal - row.planned)} left to schedule` : ''}
                  </p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => startCourseAllocationTimer(row)}
                    title="Start focus timer for this allocated course"
                  >
                    <Play size={13} /> Focus Timer
                  </button>

                  {editingGoal === row.courseId ? (
                    <div className="allocation-goal-edit">
                      <input
                        type="number"
                        min="0"
                        max="70"
                        step="0.5"
                        className="input-field"
                        value={goalHours}
                        onChange={(e) => setGoalHours(e.target.value)}
                        aria-label="Weekly goal in hours"
                      />
                      <span>h/week</span>
                      <button className="btn btn-primary btn-sm" onClick={() => saveGoal(row.courseId)}>Save</button>
                      <button className="btn btn-ghost btn-sm" onClick={() => setEditingGoal(null)}>Cancel</button>
                    </div>
                  ) : (
                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={() => {
                        setEditingGoal(row.courseId);
                        setGoalHours(row.goal ? String(row.goal / 60) : '');
                      }}
                    >
                      <Target size={14} /> {row.goal ? 'Edit goal' : 'Set goal'}
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </GlassCard>

      {/* ── Today's Schedule ── */}
      <h3 className="section-title">📅 Today's Schedule</h3>
      <GlassCard>
        {todaySessions.length === 0 ? (
          <p className="planner-empty">
            Nothing scheduled for today.{' '}
            <button className="planner-link" onClick={() => openCreate(todayKey)}>Plan a session</button>
          </p>
        ) : (
          <div className="schedule-list">
            {todaySessions.map((item) => (
              <div key={item._id} className="schedule-item">
                <span className="schedule-time">{item.startTime}</span>
                <span className="schedule-dot" style={{ background: courseColor(item.course) }} />
                <div className="schedule-info">
                  <h4 style={item.completed ? { textDecoration: 'line-through' } : undefined}>
                    {item.title || `${item.courseName} preparation`}
                  </h4>
                  <p>
                    {item.courseName}
                    {item.moduleName ? ` · 📖 ${item.moduleName}` : ''}
                    {item.notes ? ` · ${item.notes}` : ''}
                  </p>
                </div>
                <span className="schedule-duration">{formatMinutes(item.durationMinutes)}</span>

                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => startSessionTimer(item)}
                  title="Start Focus Timer for this session"
                  style={{ color: 'var(--color-primary)' }}
                >
                  <Play size={14} /> Focus
                </button>

                <button
                  className={`planner-task-check ${item.completed ? 'done' : ''}`}
                  onClick={() => toggleComplete(item)}
                  aria-label={item.completed ? 'Mark as not done' : 'Mark as done'}
                >
                  {item.completed && <Check size={11} />}
                </button>
              </div>
            ))}
          </div>
        )}
      </GlassCard>

      {/* ── Time Allocation Expired Reminder Modal ── */}
      {expiredReminder && (
        <Modal
          isOpen={true}
          onClose={() => setExpiredReminder(null)}
          title="⏰ Study Time Allocation Expired!"
          footer={(
            <div style={{ display: 'flex', gap: 'var(--space-2)', justifyContent: 'flex-end', width: '100%', flexWrap: 'wrap' }}>
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => {
                  setExpiredReminder(null);
                  setActiveTimer(null);
                }}
              >
                <Coffee size={14} /> Take a Break
              </button>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => extendTimer(300)}
              >
                <Clock size={14} /> +5 More Minutes
              </button>
              <button
                className="btn btn-primary btn-sm"
                onClick={finishTimerAndMarkDone}
              >
                <Check size={14} /> Mark Session Done
              </button>
            </div>
          )}
        >
          <div style={{ textAlign: 'center', padding: 'var(--space-4) var(--space-2)' }}>
            <div style={{ fontSize: '3rem', marginBottom: 'var(--space-2)' }}>🌸🎉</div>
            <h3 style={{ marginBottom: 'var(--space-2)', fontSize: 'var(--font-size-lg)', fontWeight: 'var(--font-weight-bold)' }}>
              Great Work! Your Focus Time Has Ended
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)', maxWidth: '440px', margin: '0 auto var(--space-4)' }}>
              You've completed your allocated study block of <strong>{formatMinutes(expiredReminder.durationMinutes)}</strong> for <strong>{expiredReminder.courseName}</strong>
              {expiredReminder.moduleName ? ` on module "${expiredReminder.moduleName}"` : ''}.
            </p>
            <div style={{ background: 'var(--glass-bg-light)', padding: 'var(--space-3)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', display: 'inline-block', textAlign: 'left', fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)' }}>
              💡 <em>Tip: Giving yourself a 5-minute breather helps consolidate what you just reviewed before moving on!</em>
            </div>
          </div>
        </Modal>
      )}

      {/* ── Create / Edit Study Session Modal ── */}
      <Modal
        isOpen={modalOpen}
        onClose={() => !saving && setModalOpen(false)}
        title={form.id ? 'Edit study session' : 'Plan a study session'}
        footer={(
          <>
            <button className="btn btn-ghost btn-sm" onClick={() => setModalOpen(false)} disabled={saving}>Cancel</button>
            <button className="btn btn-primary btn-sm" onClick={handleSave} disabled={saving}>
              {saving ? 'Saving…' : form.id ? 'Save changes' : 'Add to planner'}
            </button>
          </>
        )}
      >
        <div className="planner-form">
          <div className="input-group">
            <label className="input-label">Course</label>
            {form.course ? (
              <div className="planner-selected-course">
                <span className="schedule-dot" style={{ background: courseColor(form.course._id) }} />
                <div>
                  <strong>{form.course.courseName}</strong>
                  {form.course.courseCode && <span> · {form.course.courseCode}</span>}
                </div>
                {!form.id && (
                  <button className="btn btn-ghost btn-sm" onClick={() => { updateForm('course', null); setCourseModules([]); }}>
                    <Pencil size={12} /> Change
                  </button>
                )}
              </div>
            ) : (
              <>
                <div className="input-field-wrapper">
                  <Search size={16} className="input-icon" />
                  <input
                    className="input-field"
                    placeholder="Search by course name or code"
                    value={courseQuery}
                    onChange={(e) => setCourseQuery(e.target.value)}
                    autoFocus
                  />
                </div>
                <div className="planner-course-results">
                  {searching && <p className="planner-empty">Searching…</p>}
                  {!searching && courseResults.length === 0 && (
                    <p className="planner-empty">No courses found.</p>
                  )}
                  {!searching && courseResults.map((course) => (
                    <button
                      key={course._id}
                      className="planner-course-option"
                      onClick={() => handleSelectCourse(course)}
                    >
                      <span className="schedule-dot" style={{ background: courseColor(course._id) }} />
                      <span>{course.courseName}</span>
                      {course.courseCode && <span className="badge badge-ghost">{course.courseCode}</span>}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* ── Choose Module for the Session ── */}
          {form.course && (
            <div className="input-group">
              <label className="input-label">Choose Module (optional)</label>
              {loadingModules ? (
                <p className="planner-hint">Loading modules…</p>
              ) : (
                <select
                  className="input-field"
                  value={form.moduleId || ''}
                  onChange={(e) => {
                    const selectedId = e.target.value;
                    const mod = courseModules.find((m) => String(m.id || m._id) === selectedId);
                    updateForm('moduleId', selectedId);
                    updateForm('moduleName', mod ? mod.title : '');
                    if (mod && (!form.title || form.title.startsWith('Prepare for'))) {
                      updateForm('title', `Study: ${mod.title}`);
                    }
                  }}
                >
                  <option value="">General Course Study (All Modules)</option>
                  {courseModules.map((m, idx) => (
                    <option key={m.id || m._id || idx} value={m.id || m._id}>
                      Module {m.moduleNumber || idx + 1}: {m.title}
                    </option>
                  ))}
                </select>
              )}
              {courseModules.length === 0 && !loadingModules && (
                <span className="planner-hint">No sub-modules found for this course; whole-course study will be planned.</span>
              )}
            </div>
          )}

          <div className="planner-form-row">
            <div className="input-group">
              <label className="input-label">Date</label>
              <input type="date" className="input-field" value={form.date} onChange={(e) => updateForm('date', e.target.value)} />
            </div>
            <div className="input-group">
              <label className="input-label">Start time</label>
              <input type="time" className="input-field" value={form.startTime} onChange={(e) => updateForm('startTime', e.target.value)} />
            </div>
          </div>

          <div className="input-group">
            <label className="input-label">Time to allocate</label>
            <div className="planner-duration-options">
              {DURATION_OPTIONS.map((minutes) => (
                <button
                  key={minutes}
                  type="button"
                  className={`planner-duration ${Number(form.durationMinutes) === minutes ? 'active' : ''}`}
                  onClick={() => updateForm('durationMinutes', minutes)}
                >
                  {formatMinutes(minutes)}
                </button>
              ))}
              <input
                type="number"
                min="15"
                max="480"
                step="5"
                className="input-field planner-duration-custom"
                value={form.durationMinutes}
                onChange={(e) => updateForm('durationMinutes', e.target.value)}
                aria-label="Custom duration in minutes"
              />
              <span className="planner-hint">min</span>
            </div>
          </div>

          <div className="input-group">
            <label className="input-label">Topic / Specific Focus (optional)</label>
            <input
              className="input-field"
              placeholder="e.g. Revise practice questions, code assignments"
              value={form.title}
              maxLength={120}
              onChange={(e) => updateForm('title', e.target.value)}
            />
          </div>

          <div className="input-group">
            <label className="input-label">Notes (optional)</label>
            <textarea
              className="input-field"
              rows={2}
              maxLength={500}
              value={form.notes}
              onChange={(e) => updateForm('notes', e.target.value)}
            />
          </div>

          {!form.id && (
            <div className="planner-form-row">
              <div className="input-group">
                <label className="input-label">Repeat weekly</label>
                <select className="input-field" value={form.repeatWeeks} onChange={(e) => updateForm('repeatWeeks', e.target.value)}>
                  <option value={0}>Just this once</option>
                  {[1, 2, 3, 5, 7, 11].map((n) => (
                    <option key={n} value={n}>For {n + 1} weeks</option>
                  ))}
                </select>
              </div>
              <div className="input-group">
                <label className="input-label">Weekly goal (hours, optional)</label>
                <input
                  type="number"
                  min="0"
                  max="70"
                  step="0.5"
                  className="input-field"
                  placeholder="e.g. 5"
                  value={form.weeklyGoalHours}
                  onChange={(e) => updateForm('weeklyGoalHours', e.target.value)}
                />
              </div>
            </div>
          )}

          {formError && <div className="planner-error">{formError}</div>}
        </div>
      </Modal>
    </div>
  );
}
