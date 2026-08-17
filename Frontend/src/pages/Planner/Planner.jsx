import { useEffect, useState } from 'react';
import { Check, Plus } from 'lucide-react';
import GlassCard from '../../components/ui/GlassCard';
import PageState from '../../components/ui/PageState';
import { getCourses } from '../../api/courseApi';

const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function Planner() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadPlanner = async () => {
      try {
        const res = await getCourses();
        const courses = Array.isArray(res?.data?.data) ? res.data.data : [];
        const mapped = courses.slice(0, 6).map((course, index) => ({
          id: course._id || course.id || index + 1,
          title: `${course.title || 'Study'} milestone`,
          day: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][index % 7],
          time: ['09:00', '11:00', '13:00', '15:00', '17:00', '19:00'][index % 6],
          done: index % 2 === 0,
        }));
        setTasks(mapped);
      } catch (err) {
        setError(err?.response?.data?.message || 'Unable to load planner content.');
      } finally {
        setLoading(false);
      }
    };
    loadPlanner();
  }, []);

  const toggleTask = (id) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, done: !t.done } : t));
  };

  const completedCount = tasks.filter(t => t.done).length;
  const schedule = [
    { id: 1, time: '09:00', title: 'Algorithms Review', course: 'DSA', duration: '45m', color: '#E75480' },
    { id: 2, time: '14:00', title: 'Code Lab Session', course: 'Frontend', duration: '60m', color: '#6FA8DC' },
  ];

  if (loading) return <PageState title="Loading planner" message="Fetching your study schedule…" />;
  if (error) return <PageState type="error" title="Unable to load planner" message={error} onRetry={() => window.location.reload()} />;

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1>Study Planner</h1>
          <p>{completedCount}/{tasks.length} tasks complete this week</p>
        </div>
        <button className="btn btn-primary btn-sm"><Plus size={16} /> Add Task</button>
      </div>

      <div className="planner-week">
        {days.map((day, i) => (
          <GlassCard key={day} compact className={`planner-day animate-fade-in-up stagger-${i + 1}`}>
            <div className="planner-day-label">{day}</div>
            {tasks.filter(t => t.day === day).map(task => (
              <div key={task.id} className="planner-task" onClick={() => toggleTask(task.id)}>
                <div className={`planner-task-check ${task.done ? 'done' : ''}`}>
                  {task.done && <Check size={11} />}
                </div>
                <div className={`planner-task-info ${task.done ? 'done' : ''}`}>
                  <h5>{task.title}</h5>
                  <span>{task.time}</span>
                </div>
              </div>
            ))}
            {tasks.filter(t => t.day === day).length === 0 && (
              <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>Nothing planned</p>
            )}
          </GlassCard>
        ))}
      </div>

      <h3 className="section-title">📅 Today's Schedule</h3>
      <GlassCard>
        <div className="schedule-list">
          {schedule.map(item => (
            <div key={item.id} className="schedule-item">
              <span className="schedule-time">{item.time}</span>
              <span className="schedule-dot" style={{ background: item.color }} />
              <div className="schedule-info">
                <h4>{item.title}</h4>
                <p>{item.course}</p>
              </div>
              <span className="schedule-duration">{item.duration}</span>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}
