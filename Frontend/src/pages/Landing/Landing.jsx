import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Sparkles,
  Star,
  LayoutDashboard,
  Terminal,
  Brain,
  BarChart3,
  Users,
  Trophy,
  BookOpen,
  Code2,
  HelpCircle,
  FolderGit2,
  Flame,
} from 'lucide-react';

import { useEffect, useState } from 'react';
import { getCourses } from '../../api/courseApi';
import { generateInitials } from '../../utils/helpers';
import GlassCard from '../../components/ui/GlassCard';
import SakuraPetals from '../../components/ui/SakuraPetals';
import ThemeToggle from '../../components/ui/ThemeToggle';
import './Landing.css';

/* ---- Lucide icon lookup (features + stats) ---- */
const iconMap = {
  LayoutDashboard, Terminal, Brain, BarChart3, Users, Trophy,
  BookOpen, Code2, HelpCircle, FolderGit2,
};

/* ---- Framer Motion presets ---- */
const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.1, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
};

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

export default function Landing() {
  const [courses, setCourses] = useState([]);
  useEffect(() => {
    const loadCourses = async () => {
      try {
        const res = await getCourses();
        setCourses(Array.isArray(res?.data?.data) ? res.data.data : []);
      } catch {
        setCourses([]);
      }
    };
    loadCourses();
  }, []);

  const features = [
    { title: 'Buddy AI', description: 'Get nuanced explanations and study help from Buddy in real time.', icon: 'Brain' },
    { title: 'Code Lab', description: 'Run code, compare outputs, and work through challenge problems.', icon: 'Terminal' },
    { title: 'Progress Insights', description: 'Track growth with elegant analytics and milestones.', icon: 'BarChart3' },
    { title: 'Calm Planning', description: 'Keep your schedule, notes, and tasks in one beautiful workspace.', icon: 'LayoutDashboard' },
  ];
  const platformStats = [
    { label: 'Active learners', value: '12k+', icon: 'Users' },
    { label: 'Weekly problems', value: '3.2k', icon: 'Trophy' },
    { label: 'Study streaks', value: '94%', icon: 'Flame' },
  ];
  const testimonials = [
    { id: 1, name: 'Mina', role: 'Computer Science', text: 'The experience feels premium and calm while still pushing me to improve.', avatarColor: '#F8C8DC', rating: 5 },
    { id: 2, name: 'Jay', role: 'Engineering Student', text: 'I finally have one place for planning, coding, and reviewing progress.', avatarColor: '#C9B6E4', rating: 5 },
  ];
  // Decorative preview card: catalog courses carry no progress, so show a sample value.
  const heroBase = courses[2] || { thumbnail: '📘', title: 'AI for Developers' };
  const heroCourse = { ...heroBase, title: heroBase.title || heroBase.courseName, progress: heroBase.progress ?? 45 };

  return (
    <div className="landing-page">
      <SakuraPetals count={12} />

      {/* ============ Navbar ============ */}
      <nav className="landing-nav">
        <Link to="/" className="landing-nav-logo">
          <div className="logo-icon">🌸</div>
          <h1>Study Buddy</h1>
        </Link>

        <div className="landing-nav-links">
          <a href="#features">Features</a>
          <a href="#courses">Courses</a>
          <a href="#stats">Progress</a>
          <a href="#about">About</a>
        </div>

        <div className="landing-nav-actions">
          <ThemeToggle />
          <Link to="/login"><button className="nav-btn nav-btn-ghost">Log In</button></Link>
          <Link to="/login"><button className="nav-btn nav-btn-primary">Sign Up</button></Link>
        </div>
      </nav>

      {/* ============ Hero ============ */}
      <section className="hero">
        {/* Background layers */}
        <div className="hero-bg">
          <div className="hero-noise" />
          <div className="hero-radial" />
          <div className="orb orb-1" />
          <div className="orb orb-2" />
          <div className="orb orb-3" />
          <div className="sakura-silhouette" />
        </div>

        <div className="hero-inner">
          {/* Left – text */}
          <motion.div
            className="hero-content"
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
          >
            <motion.div className="hero-badge" variants={fadeUp} custom={0}>
              <Sparkles size={14} />
              <span>Built for Engineering Students</span>
            </motion.div>

            <motion.h1 variants={fadeUp} custom={1}>
              Study Smarter.<br />
              <span className="gradient-text">Learn Better.</span><br />
              Grow Every Day.
            </motion.h1>

            <motion.p variants={fadeUp} custom={2}>
              Study Buddy helps engineering students organize courses, learn effectively,
              track progress, and achieve academic excellence — in a calm, beautiful space.
            </motion.p>

            <motion.div className="hero-actions" variants={fadeUp} custom={3}>
              <Link to="/workspace">
                <button className="hero-btn hero-btn-primary">
                  Start Learning
                  <ArrowRight size={18} className="btn-arrow" />
                </button>
              </Link>
              <Link to="/courses">
                <button className="hero-btn hero-btn-secondary">
                  Explore Courses
                </button>
              </Link>
            </motion.div>
          </motion.div>

          {/* Right – floating visual */}
          <motion.div
            className="hero-visual"
            initial={{ opacity: 0, x: 60 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.9, delay: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <div className="hero-visual-scene">
              <div className="scene-emoji">🌳</div>
            </div>

            {/* Course card */}
            <div className="float-card float-course">
              <div className="float-course-icon">{heroCourse.thumbnail}</div>
              <div className="float-course-info">
                <span className="float-course-title">{heroCourse.title}</span>
                <span className="float-course-meta">{heroCourse.progress}% complete</span>
              </div>
              <div className="float-course-bar">
                <div className="float-course-fill" style={{ width: `${heroCourse.progress}%` }} />
              </div>
            </div>

            {/* Analytics mini-card */}
            <div className="float-card float-analytics">
              <div className="float-analytics-header">
                <BarChart3 size={14} />
                <span>Weekly Progress</span>
              </div>
              <div className="float-analytics-bars">
                {[65, 45, 80, 35, 90, 60, 50].map((h, i) => (
                  <div key={i} className="mini-bar" style={{ height: `${h}%` }} />
                ))}
              </div>
            </div>

            {/* Streak badge */}
            <div className="float-card float-xp">
              <Flame size={16} className="xp-icon" />
              <div>
                <span className="xp-value">12 Day Streak</span>
                <span className="xp-label">Keep it going 🌸</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ============ Features ============ */}
      <section className="section" id="features">
        <motion.div
          className="section-header"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          variants={fadeUp}
        >
          <h2>Built for <span className="gradient-text">Modern Students</span></h2>
          <p>Every feature is carefully crafted to help you learn faster, stay organized, and achieve more.</p>
        </motion.div>

        <motion.div
          className="features-grid"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          variants={staggerContainer}
        >
          {features.map((f, i) => {
            const Icon = iconMap[f.icon];
            return (
              <motion.div key={f.title} variants={fadeUp} custom={i}>
                <GlassCard hoverable className="feature-card">
                  <div className="feature-icon-wrap">
                    {Icon && <Icon size={24} />}
                  </div>
                  <h3>{f.title}</h3>
                  <p>{f.description}</p>
                </GlassCard>
              </motion.div>
            );
          })}
        </motion.div>
      </section>

      {/* ============ Featured Courses ============ */}
      <section className="section" id="courses">
        <motion.div
          className="section-header"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          variants={fadeUp}
        >
          <h2>Popular <span className="gradient-text">Subjects</span></h2>
          <p>Jump into a course and start building momentum today.</p>
        </motion.div>

        <motion.div
          className="landing-courses-grid"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          variants={staggerContainer}
        >
          {courses.slice(0, 4).map((c, i) => (
            <motion.div key={c.id} variants={fadeUp} custom={i}>
              <GlassCard hoverable className="landing-course-card">
                <div className="landing-course-thumb" style={{ background: `${c.color || '#E75480'}22` }}>{c.thumbnail || '📘'}</div>
                <h4>{c.title}</h4>
                <p>{c.instructor || 'Study Buddy'}</p>
                <div className="landing-course-footer">
                  <span><Star size={12} fill="currentColor" /> {c.rating ?? '4.8'}</span>
                  <span>{c.duration || '4 weeks'}</span>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ============ Stats ============ */}
      <section className="section" id="stats">
        <motion.div
          className="stats-grid"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          variants={staggerContainer}
        >
          {platformStats.map((s, i) => {
            const Icon = iconMap[s.icon];
            return (
              <motion.div key={s.label} variants={fadeUp} custom={i}>
                <GlassCard className="stat-card">
                  <div className="stat-icon-wrap">
                    {Icon && <Icon size={22} />}
                  </div>
                  <div className="stat-value gradient-text">{s.value}</div>
                  <div className="stat-label">{s.label}</div>
                </GlassCard>
              </motion.div>
            );
          })}
        </motion.div>
      </section>

      {/* ============ Testimonials ============ */}
      <section className="section" id="testimonials">
        <motion.div
          className="section-header"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          variants={fadeUp}
        >
          <h2>Loved by <span className="gradient-text">Students</span></h2>
          <p>Hear from students who transformed their academic journey with Study Buddy.</p>
        </motion.div>

        <motion.div
          className="testimonials-grid"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          variants={staggerContainer}
        >
          {testimonials.map((t, i) => (
            <motion.div key={t.id} variants={fadeUp} custom={i}>
              <GlassCard hoverable className="testimonial-card">
                <div className="stars">
                  {Array.from({ length: t.rating }).map((_, si) => (
                    <Star key={si} size={15} className="star-filled" />
                  ))}
                </div>
                <p className="quote">&ldquo;{t.text}&rdquo;</p>
                <div className="author">
                  <div
                    className="author-avatar"
                    style={{ background: t.avatarColor }}
                  >
                    {generateInitials(t.name)}
                  </div>
                  <div>
                    <div className="author-name">{t.name}</div>
                    <div className="author-role">{t.role}</div>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ============ CTA ============ */}
      <section className="cta-section" id="about">
        <motion.div
          className="cta-card"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          variants={fadeUp}
        >
          <div className="cta-glow" />
          <h2>Ready to <span className="gradient-text">Grow</span> Every Day?</h2>
          <p>Join a workspace built for the way modern engineering students learn and thrive.</p>
          <Link to="/workspace">
            <button className="hero-btn hero-btn-primary">
              Get Started for Free <ArrowRight size={18} className="btn-arrow" />
            </button>
          </Link>
        </motion.div>
      </section>

      {/* ============ Footer ============ */}
      <footer className="landing-footer">
        <div className="footer-top">
          <div className="footer-brand">
            <div className="footer-logo">
              <div className="logo-icon">🌸</div>
              <span>Study Buddy</span>
            </div>
            <p className="footer-tagline">Your personal academic learning platform.</p>
          </div>
          <div className="footer-links-group">
            <div className="footer-col">
              <h4>Product</h4>
              <a href="#features">Features</a>
              <Link to="/courses">Courses</Link>
              <a href="#stats">Progress</a>
              <Link to="/workspace">Workspace</Link>
            </div>
            <div className="footer-col">
              <h4>Company</h4>
              <a href="#about">About</a>
              <a href="#">Contact</a>
              <a href="#">Privacy</a>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} Study Buddy. Built for students, by students.</p>
        </div>
      </footer>
    </div>
  );
}
