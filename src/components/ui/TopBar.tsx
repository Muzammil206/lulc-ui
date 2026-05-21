import { cn } from '@/lib/utils'
import type { AppStatus, ClassifyResponse } from '@/types'

interface Props {
  status:  AppStatus
  result:  ClassifyResponse | null
  elapsed: number | null
}

export default function TopBar({ status, result, elapsed }: Props) {
  return (
    <header className="h-14 px-6 flex-shrink-0 flex items-center justify-between
                       bg-white border-b border-border z-50">

      {/* ── Brand ── */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-teal-bg border border-teal-bd
                        flex items-center justify-center flex-shrink-0">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <rect x="1" y="1" width="6" height="6" rx="1.5" fill="#0F7B6C"/>
            <rect x="9" y="1" width="6" height="6" rx="1.5" fill="#16A34A" opacity="0.7"/>
            <rect x="1" y="9" width="6" height="6" rx="1.5" fill="#16A34A" opacity="0.5"/>
            <rect x="9" y="9" width="6" height="6" rx="1.5" fill="#0F7B6C" opacity="0.9"/>
          </svg>
        </div>
        <div>
          <p className="font-display font-bold text-[13px] text-ink leading-none tracking-tight">
            LULC<span className="text-teal">Watch</span>
            <span className="ml-2 text-[10px] font-mono font-normal text-muted tracking-normal">
              Nigeria
            </span>
          </p>
          <p className="font-mono text-[9px] text-ghost leading-none mt-0.5">
            Land Use / Land Cover Change Detection
          </p>
        </div>
      </div>

      {/* ── Centre: context when result exists ── */}
      {result && (
        <div className="hidden md:flex items-center gap-1.5
                        px-4 py-1.5 rounded-full bg-raised border border-border">
          <span className="font-mono text-[10px] text-teal font-medium">
            {result.year1.year}
          </span>
          <span className="font-mono text-[9px] text-ghost">vs</span>
          <span className="font-mono text-[10px] text-ink font-medium">
            {result.year2.year}
          </span>
          <span className="mx-1 text-ghost">·</span>
          <span className="font-mono text-[9px] text-sub">
            {result.aoi.label}
          </span>
        </div>
      )}

      {/* ── Right: status ── */}
      <div className="flex items-center gap-2">

        {elapsed && status === 'success' && (
          <span className="font-mono text-[9px] text-ghost">
            {(elapsed / 1000).toFixed(1)}s
          </span>
        )}

        {result?.cached && (
          <span className="font-mono text-[9px] px-2 py-1 rounded-md
                           bg-raised border border-border text-ghost">
            cached
          </span>
        )}

        <div className={cn(
          'flex items-center gap-1.5 px-3 py-1.5 rounded-full border',
          'font-mono text-[10px] transition-all',
          status === 'idle'    && 'bg-raised border-border text-ghost',
          status === 'loading' && 'bg-teal-bg border-teal-bd text-teal',
          status === 'success' && 'bg-[#F0FDF4] border-green-200 text-forest',
          status === 'error'   && 'bg-urban-bg border-red-200 text-urban',
        )}>
          {status === 'loading' && (
            <div className="w-2.5 h-2.5 rounded-full border-2 border-teal/30
                            border-t-teal animate-spin" />
          )}
          {status === 'success' && (
            <div className="w-1.5 h-1.5 rounded-full bg-forest" />
          )}
          {status === 'error' && (
            <div className="w-1.5 h-1.5 rounded-full bg-urban" />
          )}
          {status === 'idle' && (
            <div className="w-1.5 h-1.5 rounded-full bg-ghost/50" />
          )}
          <span>
            {status === 'idle'    ? 'Ready'       :
             status === 'loading' ? 'Computing…'  :
             status === 'success' ? 'Complete'    : 'Error'}
          </span>
        </div>
      </div>
    </header>
  )
}