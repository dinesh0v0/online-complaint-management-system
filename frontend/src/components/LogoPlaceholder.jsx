import { cn } from '../lib/utils'

export function LogoPlaceholder({ className }) {
  return (
    <div
      className={cn(
        'overflow-hidden rounded-[1.6rem] border border-white/60 bg-white/70 p-2 shadow-float dark:border-white/10 dark:bg-white/5',
        className,
      )}
    >
      <img src="/logo-placeholder.svg" alt="Brand Logo" className="h-full w-full object-cover" />
    </div>
  )
}
