import { useState, useCallback } from 'react'
import { useClassification } from '@/hooks/useClassification'
import TopBar         from '@/components/ui/TopBar'
import Sidebar        from '@/components/sidebar/Sidebar'
import MapView        from '@/components/map/MapView'
import StatsPanel     from '@/components/stats/StatsPanel'
import TimeseriesPanel from '@/components/timeseries/TimeseriesPanel'
import ExportPanel    from '@/components/export/ExportPanel'
import { cn }         from '@/lib/utils'

type BottomTab = 'stats' | 'timeseries' | 'export'

const TABS: { id: BottomTab; label: string; icon: string }[] = [
  { id: 'stats',      label: 'Statistics',  icon: '▦' },
  { id: 'timeseries', label: '24-yr Trend',  icon: '↗' },
  { id: 'export',     label: 'Export',       icon: '↓' },
]

export default function App() {
  const {
    aoiList, aoiKey, year1, year2,
    result, status, error, elapsed,
    setAoiKey, setYear1, setYear2,
    classify, getShareUrl,
  } = useClassification()

  const [tab,      setTab]      = useState<BottomTab>('stats')
  const [copied,   setCopied]   = useState(false)

  const handleShare = useCallback(async () => {
    const url = getShareUrl()
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      prompt('Copy this link:', url)
    }
  }, [getShareUrl])

  return (
    <div className="flex flex-col h-full overflow-hidden bg-canvas">

      {/* ── Top bar ── */}
      <TopBar
        status={status}
        result={result}
        elapsed={elapsed}
        onShare={handleShare}
        copied={copied}
      />

      {/* ── Main body ── */}
      <div className="flex flex-1 overflow-hidden">

        {/* ── Sidebar ── */}
        <Sidebar
          aoiList={aoiList}
          aoiKey={aoiKey}
          year1={year1}
          year2={year2}
          status={status}
          error={error}
          result={result}
          onAoiChange={setAoiKey}
          onYear1Change={setYear1}
          onYear2Change={setYear2}
          onGenerate={() => classify(false)}
          onRefresh={() => classify(true)}
        />

        {/* ── Right column: map + bottom panels ── */}
        <div className="flex flex-col flex-1 overflow-hidden">

          {/* Map — fills remaining height */}
          <div className="flex-1 relative overflow-hidden">
            <MapView result={result} status={status} year1={year1} year2={year2} />
          </div>

          {/* ── Tab bar ── */}
          <div className="flex-shrink-0 flex items-center gap-0
                          border-t border-border bg-white px-4">
            {TABS.map(t => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                disabled={t.id !== 'stats' && !result}
                className={cn(
                  'flex items-center gap-1.5 px-4 py-2.5',
                  'font-mono text-[10px] font-medium border-b-2 transition-all',
                  'disabled:opacity-30 disabled:cursor-not-allowed',
                  tab === t.id
                    ? 'border-teal text-teal'
                    : 'border-transparent text-ghost hover:text-sub hover:border-border'
                )}
              >
                <span className="text-[11px]">{t.icon}</span>
                {t.label}
                {t.id === 'timeseries' && result && (
                  <span className="ml-1 px-1.5 py-0.5 rounded-full bg-teal-bg
                                   text-teal text-[8px] font-semibold">NEW</span>
                )}
              </button>
            ))}

            {/* Spacer + result summary */}
            <div className="flex-1" />
            {result && (
              <div className="flex items-center gap-3 pr-1">
                <span className="font-mono text-[9px] text-ghost">
                  {result.aoi.label} · {result.year1.year} vs {result.year2.year}
                </span>
                {result.cached && (
                  <span className="font-mono text-[8px] px-2 py-0.5 rounded-full
                                   bg-raised border border-border text-ghost">cached</span>
                )}
              </div>
            )}
          </div>

          {/* ── Bottom panel content ── */}
          <div className="flex-shrink-0">
            {tab === 'stats' && (
              <StatsPanel result={result} status={status} />
            )}
            {tab === 'timeseries' && (
              <TimeseriesPanel
                aoiKey={aoiKey}
                year1={year1}
                year2={year2}
                visible={tab === 'timeseries'}
              />
            )}
            {tab === 'export' && (
              <ExportPanel result={result} visible={tab === 'export'} />
            )}
          </div>

        </div>
      </div>
    </div>
  )
}