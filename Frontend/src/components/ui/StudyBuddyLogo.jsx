export default function StudyBuddyLogo({ size = 42, className = '' }) {
  const iconSize = Math.round(size * 0.58);
  const radius = Math.round(size * 0.28);

  return (
    <div
      className={`study-buddy-logo-badge ${className}`}
      style={{
        width: size,
        height: size,
        borderRadius: radius,
        background: 'linear-gradient(135deg, #FF5C93 0%, #B05CFF 100%)',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 8px 20px -4px rgba(255, 92, 147, 0.45)',
        flexShrink: 0,
      }}
      aria-label="Study Buddy Logo"
    >
      <svg
        width={iconSize}
        height={iconSize}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g transform="translate(24,24)">
          <g>
            <path
              d="M0 -15 C4 -9 10 -7 16 -6 C10 -3 6 3 0 10 C-6 3 -10 -3 -16 -6 C-10 -7 -4 -9 0 -15Z"
              fill="#FFFFFF"
              fillOpacity="0.96"
            />
          </g>
          <g transform="rotate(72)">
            <path
              d="M0 -15 C4 -9 10 -7 16 -6 C10 -3 6 3 0 10 C-6 3 -10 -3 -16 -6 C-10 -7 -4 -9 0 -15Z"
              fill="#FFE3ED"
              fillOpacity="0.88"
            />
          </g>
          <g transform="rotate(144)">
            <path
              d="M0 -15 C4 -9 10 -7 16 -6 C10 -3 6 3 0 10 C-6 3 -10 -3 -16 -6 C-10 -7 -4 -9 0 -15Z"
              fill="#FFFFFF"
              fillOpacity="0.94"
            />
          </g>
          <g transform="rotate(216)">
            <path
              d="M0 -15 C4 -9 10 -7 16 -6 C10 -3 6 3 0 10 C-6 3 -10 -3 -16 -6 C-10 -7 -4 -9 0 -15Z"
              fill="#FFE3ED"
              fillOpacity="0.88"
            />
          </g>
          <g transform="rotate(288)">
            <path
              d="M0 -15 C4 -9 10 -7 16 -6 C10 -3 6 3 0 10 C-6 3 -10 -3 -16 -6 C-10 -7 -4 -9 0 -15Z"
              fill="#FFFFFF"
              fillOpacity="0.96"
            />
          </g>
          <circle r="3.5" fill="#F0A94E" />
        </g>
      </svg>
    </div>
  );
}
