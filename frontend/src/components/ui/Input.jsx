import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function Input({ className, label, id, error, ...props }) {
  return (
    <div className="flex flex-col gap-1 w-full">
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-text">
          {label}
        </label>
      )}
      <input
        id={id}
        className={cn(
          "w-full rounded-md border border-border bg-surface px-3 py-2 text-text placeholder:text-text-muted",
          "focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all",
          error && "border-red-500 focus:ring-red-500",
          className
        )}
        {...props}
      />
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  );
}
