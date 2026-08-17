import { useMemo } from 'react';

const PETAL_COLORS = ['#F8C8DC', '#F4B3CE', '#E75480', '#F6E7F7'];

function Petal({ color }) {
  return (
    <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M16 2C19 7 24 9 30 10C24 12 20 16 16 22C12 16 8 12 2 10C8 9 13 7 16 2Z"
        fill={color}
        opacity="0.85"
      />
    </svg>
  );
}

export default function SakuraPetals({ count = 14 }) {
  const petals = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        size: 10 + Math.random() * 14,
        duration: 10 + Math.random() * 10,
        delay: Math.random() * 14,
        drift: -80 + Math.random() * 160,
        color: PETAL_COLORS[i % PETAL_COLORS.length],
      })),
    [count]
  );

  return (
    <div className="petal-field" aria-hidden="true">
      {petals.map((p) => (
        <span
          key={p.id}
          className="petal"
          style={{
            '--x': `${p.x}%`,
            '--size': `${p.size}px`,
            '--duration': `${p.duration}s`,
            '--delay': `${p.delay}s`,
            '--drift': `${p.drift}px`,
          }}
        >
          <Petal color={p.color} />
        </span>
      ))}
    </div>
  );
}
