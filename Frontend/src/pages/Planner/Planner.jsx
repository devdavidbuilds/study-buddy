import { useCallback, useEffect, useMemo, useState } from 'react';
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
} from 'lucide-react';
import GlassCard from '../../components/ui/GlassCard';
import PageState from '../../components/ui/PageState';
import Modal from '../../components/ui/Modal';
import ProgressBar from '../../components/ui/ProgressBar';
import { getCourses } from '../../api/courseApi';
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

const emptyForm = (date) => ({
  id: null,
  course: null,
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

  const [courseQuery, setCourseQuery] = useState('');
  const [courseResults, setCourseResults] = useState([]);
  const [searching, setSearching] = useState(false);

  const [editingGoal, setEditingGoal] = useState(null);
  const [goalHours, setGoalHours] = useState('');

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

  const openCreate = (date = todayKey) => {
    setForm(emptyForm(date));
    setCourseQuery('');
    setFormError('');
    setModalOpen(true);
  };

  const openEdit = (session) => {
    setForm({
      id: session._id,
      course: { _id: session.course, courseName: session.courseName, courseCode: session.courseCode },
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
        });
      } else {
        await createStudySession({
          courseId: form.course._id,
          date: form.date,
          startTime: form.startTime,
          durationMinutes: Number(form.durationMinutes),
          title: form.title.trim(),
          notes: form.notes.trim(),
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
              : 'Pick a course and set aside time to prepare for it.'}
          </p>
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => openCreate()}>
          <Plus size={16} /> Add Session
        </button>
      </div>

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
                    {session.title && <p>{session.title}</p>}
                    <span>{session.startTime}–{endTime(session.startTime, session.durationMinutes)} · {formatMinutes(session.durationMinutes)}</span>
                  </div>
                  <button className="planner-task-delete" onClick={() => removeSession(session)} aria-label="Remove session">
                    <Trash2 size={12} />
                  </button>
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
            );
          })
        )}
      </GlassCard>

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
                  <p>{item.courseName}{item.notes ? ` · ${item.notes}` : ''}</p>
                </div>
                <span className="schedule-duration">{formatMinutes(item.durationMinutes)}</span>
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
                  <button className="btn btn-ghost btn-sm" onClick={() => updateForm('course', null)}>
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
                      onClick={() => updateForm('course', course)}
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
            <label className="input-label">Topic (optional)</label>
            <input
              className="input-field"
              placeholder="e.g. Revise unit 3, practise past papers"
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
