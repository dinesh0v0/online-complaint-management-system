import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function Badge({ children, variant = 'default', className }) {
  const variants = {
    default: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
    primary: "bg-primary/10 text-primary dark:bg-primary/20",
    success: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
    warning: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
    danger:  "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  };

  return (
    <span className={cn("px-2.5 py-0.5 rounded-full text-xs font-semibold border border-border/50", variants[variant], className)}>
      {children}
    </span>
  );
}
