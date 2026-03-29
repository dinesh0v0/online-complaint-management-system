import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function Select({ className, label, id, options, error, ...props }) {
  return (
    <div className="flex flex-col gap-1 w-full">
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-text">
          {label}
        </label>
      )}
      <select
        id={id}
        className={cn(
          "w-full rounded-md border border-border bg-surface px-3 py-2 text-text",
          "focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all appearance-none",
          error && "border-red-500 focus:ring-red-500",
          className
        )}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  );
}
