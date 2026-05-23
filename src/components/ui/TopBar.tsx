import { cn } from '@/lib/utils'
import type { AppStatus, ClassifyResponse } from '@/types'

interface Props {
  status:   AppStatus
  result:   ClassifyResponse | null
  elapsed:  number | null
  onShare:  () => void
  copied:   boolean
}

export default function TopBar({ status, result, elapsed, onShare, copied }: Props) {
  return (
    <header className="h-14 px-5 flex-shrink-0 flex items-center justify-between
                       bg-white border-b border-border z-50 gap-4">

      {/* Brand */}
      <div className="flex items-center gap-3 flex-shrink-0">
        <div className="w-8 h-8 rounded-lg bg-teal-bg border border-teal-bd
                        flex items-center justify-center">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <rect x="1" y="1" width="6" height="6" rx="1.5" fill="#0F7B6C"/>
            <rect x="9" y="1" width="6" height="6" rx="1.5" fill="#16A34A" opacity="0.7"/>
            <rect x="1" y="9" width="6" height="6" rx="1.5" fill="#16A34A" opacity="0.5"/>
            <rect x="9" y="9" width="6" height="6" rx="1.5" fill="#0F7B6C" opacity="0.9"/>
          </svg>
        </div>
        <div>
          <p className="font-display font-bold text-[14px] text-ink leading-none tracking-tight">
            LULC<span className="text-teal">Watch</span>
          </p>
          <p className="font-mono text-[9px] text-ghost leading-none mt-0.5">
            Nigeria · Land Cover Change Detection
          </p>
        </div>
      </div>

      {/* Centre context — only when result */}
      {result && (
        <div className="hidden md:flex items-center gap-2 flex-1 justify-center">
          <div className="flex items-center gap-2 px-4 py-1.5 rounded-full
                          bg-raised border border-border">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-teal flex-shrink-0" />
              <span className="font-mono text-[10px] text-teal font-semibold">{result.year1.year}</span>
            </div>
            <span className="font-mono text-[9px] text-ghost">vs</span>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-forest flex-shrink-0" />
              <span className="font-mono text-[10px] text-ink font-semibold">{result.year2.year}</span>
            </div>
            <span className="text-ghost mx-1">·</span>
            <span className="font-mono text-[9px] text-sub truncate max-w-[200px]">
              {result.aoi.label}
            </span>
          </div>
        </div>
      )}

      {/* Right controls */}
      <div className="flex items-center gap-2 flex-shrink-0">

        {/* Share / bookmark */}
        <button
          onClick={onShare}
          className={cn(
            'flex items-center gap-1.5 px-3 py-1.5 rounded-full border',
            'font-mono text-[10px] transition-all duration-150',
            copied
              ? 'bg-[#F0FDF4] border-green-200 text-forest'
              : 'bg-raised border-border text-ghost hover:border-border2 hover:text-sub'
          )}
          title="Copy shareable link"
        >
          <span>{copied ? '✓' : '⎘'}</span>
          <span>{copied ? 'Copied!' : 'Share'}</span>
        </button>

        {/* Duration */}
        {elapsed && status === 'success' && (
          <span className="font-mono text-[9px] text-ghost hidden sm:block">
            {(elapsed / 1000).toFixed(1)}s
          </span>
        )}

        {/* Status pill */}
        <div className={cn(
          'flex items-center gap-1.5 px-3 py-1.5 rounded-full border',
          'font-mono text-[10px] transition-all',
          status === 'idle'    && 'bg-raised border-border text-ghost',
          status === 'loading' && 'bg-teal-bg border-teal-bd text-teal',
          status === 'success' && 'bg-[#F0FDF4] border-green-200 text-forest',
          status === 'error'   && 'bg-urban-bg border-red-200 text-urban',
        )}>
          {status === 'loading' && (
            <div className="w-2.5 h-2.5 rounded-full border-[1.5px] border-teal/30
                            border-t-teal animate-spin" />
          )}
          {status === 'success' && <div className="w-1.5 h-1.5 rounded-full bg-forest" />}
          {status === 'error'   && <div className="w-1.5 h-1.5 rounded-full bg-urban" />}
          {status === 'idle'    && <div className="w-1.5 h-1.5 rounded-full bg-ghost/40" />}
          <span>
            {status === 'idle'    ? 'Ready'      :
             status === 'loading' ? 'Computing…' :
             status === 'success' ? 'Complete'   : 'Error'}
          </span>
        </div>
      </div>
    </header>
  )
}