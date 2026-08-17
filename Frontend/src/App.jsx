import { BrowserRouter, Routes, Route } from 'react-router-dom';

import Landing from './pages/Landing/Landing';
import Login from './pages/Login/Login';
import AppLayout from './components/layout/AppLayout';
import Workspace from './pages/Workspace/Workspace';
import Courses from './pages/Courses/Courses';
import CourseDetail from './pages/Courses/CourseDetail';
import Planner from './pages/Planner/Planner';
import Assignments from './pages/Assignments/Assignments';
import AITutor from './pages/AITutor/AITutor';
import Notes from './pages/Notes/Notes';
import Achievements from './pages/Achievements/Achievements';
import Progress from './pages/Progress/Progress';
import Settings from './pages/Settings/Settings';
import Profile from './pages/Profile/Profile';
import CodeLab from './pages/CodeLab/CodeLab';
import ProtectedRoute from './components/auth/ProtectedRoute';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/workspace" element={<Workspace />} />
            <Route path="/courses" element={<Courses />} />
            <Route path="/courses/:id" element={<CourseDetail />} />
            <Route path="/planner" element={<Planner />} />
            <Route path="/assignments" element={<Assignments />} />
            <Route path="/ai-tutor" element={<AITutor />} />
            <Route path="/notes" element={<Notes />} />
            <Route path="/achievements" element={<Achievements />} />
            <Route path="/progress" element={<Progress />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/code-lab" element={<CodeLab />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
