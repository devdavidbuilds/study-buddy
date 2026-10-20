import { cn } from '../../utils/helpers';

export default function GlassCard({ children, className, hoverable, glow, compact, noPadding, onClick, style }) {
  return (
    <div
      className={cn(
        'glass-card-component',
        hoverable && 'hoverable',
        glow && 'glow',
        compact && 'compact',
        noPadding && 'no-padding',
        className
      )}
      onClick={onClick}
      style={style}
    >
      {children}
    </div>
  );
}
