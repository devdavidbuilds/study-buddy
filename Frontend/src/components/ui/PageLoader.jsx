export default function PageLoader() {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        width: '100%',
        flexDirection: 'column',
        gap: '14px',
        color: 'var(--text-secondary, #6B6560)',
      }}
      aria-label="Loading page"
    >
      <div
        style={{
          width: '38px',
          height: '38px',
          border: '3px solid rgba(231, 84, 128, 0.2)',
          borderTopColor: 'var(--color-accent, #E75480)',
          borderRadius: '50%',
          animation: 'sb-spin 0.75s linear infinite',
        }}
      />
      <span style={{ fontSize: '13px', fontWeight: 500, letterSpacing: '0.02em', opacity: 0.85 }}>
        Loading...
      </span>
      <style>{`
        @keyframes sb-spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
