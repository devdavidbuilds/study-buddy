import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { NotificationProvider } from './context/NotificationContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import PageLoader from './components/ui/PageLoader';

// Lazy-loaded pages to split bundle size and optimize initial load
const Landing = lazy(() => import('./pages/Landing/Landing'));
const Login = lazy(() => import('./pages/Login/Login'));
const Signup = lazy(() => import('./pages/signup/signup'));

const AppLayout = lazy(() => import('./components/layout/AppLayout'));
const Workspace = lazy(() => import('./pages/Workspace/Workspace'));
const Courses = lazy(() => import('./pages/Courses/Courses'));
const CourseDetail = lazy(() => import('./pages/Courses/CourseDetail'));
const CourseLearn = lazy(() => import('./pages/Courses/CourseLearn'));
const Planner = lazy(() => import('./pages/Planner/Planner'));
const Assignments = lazy(() => import('./pages/Assignments/Assignments'));
const AITutor = lazy(() => import('./pages/AITutor/AITutor'));
const Notes = lazy(() => import('./pages/Notes/Notes'));
const Achievements = lazy(() => import('./pages/Achievements/Achievements'));
const Progress = lazy(() => import('./pages/Progress/Progress'));
const Settings = lazy(() => import('./pages/Settings/Settings'));
const Profile = lazy(() => import('./pages/Profile/Profile'));
const CodeLab = lazy(() => import('./pages/CodeLab/CodeLab'));
const Notifications = lazy(() => import('./pages/Notifications/Notifications'));
const FacultyDashboard = lazy(() => import('./pages/Faculty/FacultyDashboard'));
const AdminDashboard = lazy(() => import('./pages/Admin/AdminDashboard'));

function App() {
  return (
    <ThemeProvider>
      <NotificationProvider>
        <BrowserRouter>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              {/* Public Pages */}
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />

              {/* Protected Pages */}
              <Route element={<ProtectedRoute />}>
                {/* Admin Dashboard */}
                <Route
                  path="/admin"
                  element={<AdminDashboard />}
                />

                {/* Faculty Dashboard (own layout, no sidebar) */}
                <Route
                  path="/faculty"
                  element={<FacultyDashboard />}
                />

                {/* Student Pages (with AppLayout sidebar) */}
                <Route element={<AppLayout />}>
                  <Route
                    path="/workspace"
                    element={<Workspace />}
                  />

                  <Route
                    path="/courses"
                    element={<Courses />}
                  />

                  <Route
                    path="/courses/:id"
                    element={<CourseDetail />}
                  />

                  <Route
                    path="/courses/:id/learn"
                    element={<CourseLearn />}
                  />

                  <Route
                    path="/courses/:id/learn/:moduleId/:lessonId"
                    element={<CourseLearn />}
                  />

                  <Route
                    path="/planner"
                    element={<Planner />}
                  />

                  <Route
                    path="/assignments"
                    element={<Assignments />}
                  />

                  <Route
                    path="/ai-tutor"
                    element={<AITutor />}
                  />

                  <Route
                    path="/notes"
                    element={<Notes />}
                  />

                  <Route
                    path="/achievements"
                    element={<Achievements />}
                  />

                  <Route
                    path="/progress"
                    element={<Progress />}
                  />

                  <Route
                    path="/notifications"
                    element={<Notifications />}
                  />

                  <Route
                    path="/settings"
                    element={<Settings />}
                  />

                  <Route
                    path="/profile"
                    element={<Profile />}
                  />

                  <Route
                    path="/code-lab"
                    element={<CodeLab />}
                  />
                </Route>
              </Route>
            </Routes>
          </Suspense>
        </BrowserRouter>
      </NotificationProvider>
    </ThemeProvider>
  );
}

export default App;
