import { Link } from 'react-router-dom';
import { ArrowLeft, Flame, Target } from 'lucide-react';

export default function CodeLabHeader() {
  return (
    <header className="codelab-header">
      <Link to="/workspace" className="codelab-header-back">
        <ArrowLeft size={16} /> Study Buddy
      </Link>

      <div className="codelab-header-title">
        <span className="codelab-header-logo">💻</span>
        <div>
          <h1>Code Lab</h1>
          <span>Practice. Compile. Learn. Improve.</span>
        </div>
      </div>

      <div className="codelab-header-stats">
        <span><Flame size={14} /> 12 day streak</span>
        <span><Target size={14} /> 3/5 today</span>
      </div>
    </header>
  );
}
