import { motion } from 'framer-motion'

import { cn } from '../lib/utils'

const MotionDiv = motion.div

const tones = {
  accent: 'from-accent/18 to-accent-soft/50 text-accent-strong',
  warning: 'from-warning/18 to-warning/6 text-warning',
  success: 'from-success/18 to-success/6 text-success',
  ink: 'from-ink/10 to-white/40 text-ink dark:to-white/5',
}

export function MetricCard({ icon: Icon, label, value, detail, tone = 'accent' }) {
  return (
    <MotionDiv
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className={cn(
        'rounded-[1.6rem] border border-line/70 bg-gradient-to-br p-5 shadow-panel',
        tones[tone] || tones.accent,
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-muted">{label}</p>
          <p className="mt-3 font-display text-4xl font-semibold text-ink">{value}</p>
          {detail ? <p className="mt-2 text-sm text-muted">{detail}</p> : null}
        </div>
        {Icon ? (
          <div className="rounded-2xl bg-white/70 p-3 text-current shadow dark:bg-white/10">
            <Icon size={20} />
          </div>
        ) : null}
      </div>
    </MotionDiv>
  )
}
