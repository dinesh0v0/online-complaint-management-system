import { cn } from '../lib/utils'

export function Panel({ className, children }) {
  return (
    <div
      className={cn(
        'rounded-[1.75rem] border border-line/70 bg-surface/80 p-6 shadow-panel backdrop-blur-xl',
        className,
      )}
    >
      {children}
    </div>
  )
}
