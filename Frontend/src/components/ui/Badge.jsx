import { cn } from '../../utils/helpers';

export default function Badge({ children, variant = 'primary', dot, className }) {
  return (
    <span className={cn('badge', `badge-${variant}`, dot && 'badge-dot', className)}>
      {children}
    </span>
  );
}
