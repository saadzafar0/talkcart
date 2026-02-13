import { cn } from '@/core/utils/cn';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-16 text-center', className)}>
      {icon && (
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-neutral-100 text-neutral-500">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-semibold text-primary-900">{title}</h3>
      {description && (
        <p className="mt-2 max-w-sm text-sm text-primary-600">{description}</p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
