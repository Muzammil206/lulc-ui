import { Spinner } from './index'
import { cn } from '@/lib/utils'
import type { AppStatus, ClassifyResponse } from '@/types'

interface Props { status: AppStatus; result: ClassifyResponse | null; elapsed: number | null }

export default function TopBar({ status, result, elapsed }: Props) {
  return (
    <header className="
      flex items-center justify-between
      h-[54px] px-5 flex-shrink-0
      bg-surface border-b border-border
      shadow-card
    ">
      {/* Logo */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-teal-bg border border-teal-bd
                        flex items-center justify-center flex-shrink-0">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <rect x="2" y="2" width="6" height="6" rx="1" fill="#0F7B6C" opacity="0.7"/>
            <rect x="10" y="2" width="6" height="6" rx="1" fill="#0F7B6C"/>
            <rect x="2" y="10" width="6" height="6" rx="1" fill="#16A34A"/>
            <rect x="10" y="10" width="6" height="6" rx="1" fill="#0F7B6C" opacity="0.5"/>
          </svg>
        </div>
        <div>
          <div className="font-display font-bold text-[14px] text-ink tracking-tight leading-none">
            LULC <span className="text-teal">Watch</span>
          </div>
          <div className="font-mono text-[9px] text-muted mt-0.5 leading-none">
            Nigeria Land Cover Change Detection
          </div>
        </div>
      </div>

      {/* Right side pills */}
      <div className="flex items-center gap-2">

        {result && (
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full
                          bg-raised border border-border text-[10px] font-mono text-sub">
            <div className="w-1.5 h-1.5 rounded-full bg-forest" />
            RF · 50 trees · ESA WorldCover
          </div>
        )}

        {result?.cached && (
          <div className="px-3 py-1.5 rounded-full bg-raised border border-border
                          text-[10px] font-mono text-muted">
            cached
          </div>
        )}

        {elapsed && status === 'success' && (
          <div className="px-3 py-1.5 rounded-full bg-raised border border-border
                          text-[10px] font-mono text-muted">
            {(elapsed / 1000).toFixed(1)}s
          </div>
        )}

        {/* Status pill */}
        <div className={cn(
          'flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[10px] font-mono transition-all',
          status === 'idle'    && 'bg-raised border-border text-muted',
          status === 'loading' && 'bg-teal-bg border-teal-bd text-teal',
          status === 'success' && 'bg-forest-bg border-green-200 text-forest',
          status === 'error'   && 'bg-urban-bg border-red-200 text-urban',
        )}>
          {status === 'loading' && <Spinner size={10} />}
          {status === 'success' && <div className="w-1.5 h-1.5 rounded-full bg-forest" />}
          {status === 'error'   && <div className="w-1.5 h-1.5 rounded-full bg-urban" />}
          {status === 'idle'    && <div className="w-1.5 h-1.5 rounded-full bg-ghost" />}
          {status === 'idle'    ? 'idle' :
           status === 'loading' ? 'computing…' :
           status === 'success' ? 'ready' : 'error'}
        </div>
      </div>
    </header>
  )
}
