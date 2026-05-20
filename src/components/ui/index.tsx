import { cn } from '@/lib/utils'

export function Label({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={cn('font-mono text-[9px] text-muted uppercase tracking-[0.1em]', className)}>
      {children}
    </span>
  )
}

export function Select({ value, onChange, disabled, children }: {
  value: string | number; onChange: (v: string) => void
  disabled?: boolean; children: React.ReactNode
}) {
  return (
    <div className="relative">
      <select
        value={value} onChange={e => onChange(e.target.value)}
        disabled={disabled}
        className={cn(`
          w-full appearance-none
          bg-surface border border-border rounded-md
          px-3 py-2 pr-8
          font-body text-[12px] font-medium text-ink
          shadow-input
          transition-all duration-150 cursor-pointer
          hover:border-border2
          focus:outline-none focus:border-teal focus:shadow-teal
          disabled:opacity-50 disabled:cursor-not-allowed
        `)}
      >
        {children}
      </select>
      <div className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-muted">
        <svg width="10" height="6" viewBox="0 0 10 6" fill="none">
          <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
    </div>
  )
}

export function Spinner({ size = 18 }: { size?: number }) {
  return (
    <div className="animate-spin rounded-full border-2 border-border flex-shrink-0"
      style={{ width: size, height: size, borderTopColor: '#0F7B6C' }} />
  )
}

export function Tag({ children, color }: { children: React.ReactNode; color?: string }) {
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium font-mono"
      style={color ? { background: `${color}18`, color } : undefined}
    >
      {children}
    </span>
  )
}

export function Divider({ vertical }: { vertical?: boolean }) {
  return vertical
    ? <div className="w-px self-stretch bg-line flex-shrink-0" />
    : <div className="h-px w-full bg-line flex-shrink-0" />
}

export function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('bg-surface border border-border rounded-lg shadow-card', className)}>
      {children}
    </div>
  )
}
