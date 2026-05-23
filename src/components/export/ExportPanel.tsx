import { cn } from '@/lib/utils'
import { useExport } from '@/hooks/useExport'
import type { ClassifyResponse } from '@/types'

interface Props { result: ClassifyResponse | null; visible: boolean }

const STATUS_ICON: Record<string, string> = {
  idle:       '↓',
  submitting: '…',
  SUBMITTED:  '⏳',
  RUNNING:    '⚙',
  COMPLETED:  '✓',
  FAILED:     '✗',
}

export default function ExportPanel({ result, visible }: Props) {
  const { status, message, trigger, reset } = useExport()
  if (!visible || !result) return null

  const busy = status === 'submitting' || status === 'RUNNING' || status === 'SUBMITTED'

  return (
    <div className="border-t border-border bg-white px-5 py-4">
      <p className="font-display font-bold text-[13px] text-ink mb-3">Export layers</p>

      <div className="grid grid-cols-2 gap-3">
        {[result.year1.year, result.year2.year].map(year => (
          <div key={year}
            className="border border-border rounded-xl p-3.5 bg-raised hover:bg-sunken transition-colors">
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="font-display font-bold text-[13px] text-ink">{year}</p>
                <p className="font-mono text-[9px] text-muted mt-0.5">LULC classification · 30m GeoTIFF</p>
              </div>
              <div className="w-8 h-8 rounded-lg bg-teal-bg border border-teal-bd
                              flex items-center justify-center text-teal font-bold text-sm">
                ↓
              </div>
            </div>

            <div className="flex items-center gap-1.5 mb-3">
              <div className="w-1.5 h-1.5 rounded-full bg-ghost" />
              <span className="font-mono text-[9px] text-ghost">
                Saves to Google Drive → LULC_Nigeria_Exports
              </span>
            </div>

            <button
              onClick={() => trigger(result.aoi.key, year)}
              disabled={busy}
              className={cn(
                'w-full py-2 rounded-lg font-mono text-[10px] font-medium',
                'transition-all duration-150 flex items-center justify-center gap-1.5',
                busy
                  ? 'bg-sunken text-muted cursor-not-allowed'
                  : 'bg-teal text-white hover:bg-teal-2 active:scale-[0.98]'
              )}
            >
              <span>{STATUS_ICON[status] || '↓'}</span>
              <span>
                {status === 'submitting' ? 'Starting…' :
                 status === 'SUBMITTED'  ? 'Queued…' :
                 status === 'RUNNING'    ? 'Exporting…' :
                 status === 'COMPLETED'  ? 'Done!' :
                 status === 'FAILED'     ? 'Retry' :
                 'Export GeoTIFF'}
              </span>
            </button>
          </div>
        ))}
      </div>

      {message && (
        <div className={cn(
          'mt-3 px-3 py-2.5 rounded-lg font-mono text-[9px] leading-relaxed',
          status === 'COMPLETED' ? 'bg-[#F0FDF4] border border-green-200 text-forest' :
          status === 'FAILED'    ? 'bg-urban-bg border border-red-200 text-urban' :
          'bg-teal-bg border border-teal-bd text-teal'
        )}>
          {message}
          {status === 'COMPLETED' && (
            <button onClick={reset} className="ml-3 underline hover:no-underline">
              Export again
            </button>
          )}
        </div>
      )}

      <p className="font-mono text-[8px] text-ghost mt-3 leading-relaxed">
        Exports run asynchronously on Google Earth Engine. You will receive the GeoTIFF in your Google Drive. Large areas may take 5–15 minutes.
      </p>
    </div>
  )
}