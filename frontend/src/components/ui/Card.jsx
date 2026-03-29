import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function Card({ children, className, hover = true, ...props }) {
  return (
    <motion.div
      whileHover={hover ? { y: -2, scale: 1.01 } : {}}
      className={cn(
        "bg-surface rounded-xl shadow-sm border border-border overflow-hidden p-6",
        className
      )}
      {...props}
    >
      {children}
    </motion.div>
  );
}
