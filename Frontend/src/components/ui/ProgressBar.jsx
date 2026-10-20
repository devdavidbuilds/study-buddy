export default function ProgressBar({ value = 0, size = 'md', color, className }) {
  return (
    <div className={`progress-bar-wrapper ${size} ${className || ''}`}>
      <div
        className="progress-bar-fill"
        style={{
          width: `${Math.min(value, 100)}%`,
          background: color || undefined,
        }}
      />
    </div>
  );
}
