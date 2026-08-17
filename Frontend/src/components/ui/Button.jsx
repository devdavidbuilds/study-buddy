import { cn } from '../../utils/helpers';

export default function Button({ children, variant = 'primary', size, icon, className, ...props }) {
  return (
    <button
      className={cn(
        'btn',
        `btn-${variant}`,
        size === 'sm' && 'btn-sm',
        size === 'lg' && 'btn-lg',
        icon && 'btn-icon',
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
