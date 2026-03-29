import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function Button({ 
  children, 
  variant = 'primary', 
  className, 
  type = 'button',
  onClick,
  disabled
}) {
  const baseStyle = "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none px-4 py-2";
  
  const variants = {
    primary: "bg-primary text-white hover:bg-primary-hover shadow-sm",
    secondary: "bg-surface text-text border border-border hover:bg-gray-100 dark:hover:bg-gray-800",
    ghost: "text-text hover:bg-border",
    danger: "bg-red-600 text-white hover:bg-red-700"
  };

  return (
    <motion.button
      type={type}
      whileHover={disabled ? {} : { scale: 1.02 }}
      whileTap={disabled ? {} : { scale: 0.98 }}
      className={cn(baseStyle, variants[variant], className)}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </motion.button>
  );
}
