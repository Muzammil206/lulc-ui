import { Label, Select, Divider, Spinner } from '@/components/ui'
import { yearRange, cn } from '@/lib/utils'
import type { AOIListResponse, AppStatus } from '@/types'

const LEGEND = [
  { name:'Forest',   sub:'Woody vegetation', color:'#16A34A', bg:'bg-forest-bg' },
  { name:'Cropland', sub:'Farms & grassland', color:'#CA8A04', bg:'bg-crop-bg' },
  { name:'Urban',    sub:'Built-up areas',    color:'#DC2626', bg:'bg-urban-bg' },
  { name:'Water',    sub:'Rivers & lakes',    color:'#2563EB', bg:'bg-water-bg' },
  { name:'Bare',     sub:'Soil & rock',       color:'#78716C', bg:'bg-bare-bg' },
]

interface Props {
  aoiList: AOIListResponse | null
  aoiKey: string; year1: number; year2: number
  status: AppStatus; error: string | null
  onAoiChange: (k: string) => void
  onYear1Change: (y: number) => void
  onYear2Change: (y: number) => void
  onGenerate: () => void
  onRefresh: () => void
}

export default function Sidebar({
  aoiList, aoiKey, year1, year2, status, error,
  onAoiChange, onYear1Change, onYear2Change, onGenerate, onRefresh,
}: Props) {
  const loading = status === 'loading'
  const yr = aoiList?.yearRange ?? { min: 2000, max: 2024 }
  const years = yearRange(yr.min, yr.max)
  const invalid = year1 === year2

  return (
    <aside className="
      w-[216px] flex-shrink-0 flex flex-col
      bg-canvas border-r border-border
      overflow-y-auto
    ">

      {/* ── Location ── */}
      <div className="px-4 py-4 border-b border-line">
        <Label className="mb-2 block">Location</Label>
        <Select value={aoiKey} onChange={onAoiChange} disabled={loading}>
          {aoiList?.locations.map(l => (
            <option key={l.key} value={l.key}>{l.label}</option>
          )) ?? <option value="ogidi-ilorin-west">Ogidi, Ilorin West LGA</option>}
        </Select>
        <div className="mt-1.5 flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-teal flex-shrink-0" />
          <span className="font-mono text-[9px] text-muted">
            {aoiList?.locations.find(l => l.key === aoiKey)?.state ?? 'Kwara'} State, Nigeria
          </span>
        </div>
      </div>

      {/* ── Years ── */}
      <div className="px-4 py-4 border-b border-line">
        <Label className="mb-3 block">Compare years</Label>

        <div className="space-y-2">
          <div>
            <div className="font-mono text-[9px] text-muted mb-1.5">Baseline year</div>
            <Select value={year1} onChange={v => onYear1Change(Number(v))} disabled={loading}>
              {years.filter(y => y !== year2).map(y => <option key={y} value={y}>{y}</option>)}
            </Select>
          </div>

          {/* Swap */}
          <div className="flex justify-center">
            <button
              onClick={() => { onYear1Change(year2); onYear2Change(year1) }}
              disabled={loading}
              className="w-7 h-7 rounded-full bg-surface border border-border shadow-card
                         flex items-center justify-center text-muted text-xs
                         hover:border-teal hover:text-teal hover:shadow-teal
                         transition-all duration-150 disabled:opacity-40"
              title="Swap years"
            >⇅</button>
          </div>

          <div>
            <div className="font-mono text-[9px] text-muted mb-1.5">Comparison year</div>
            <Select value={year2} onChange={v => onYear2Change(Number(v))} disabled={loading}>
              {years.filter(y => y !== year1).map(y => <option key={y} value={y}>{y}</option>)}
            </Select>
          </div>
        </div>

        {invalid && (
          <p className="font-mono text-[9px] text-urban mt-2">Select two different years</p>
        )}
      </div>

      {/* ── Actions ── */}
      <div className="px-4 py-4 border-b border-line space-y-2">
        <button
          onClick={onGenerate}
          disabled={loading || invalid}
          className={cn(`
            w-full flex items-center justify-center gap-2
            py-2.5 rounded-md
            font-display font-semibold text-[13px]
            transition-all duration-150
            focus:outline-none focus:ring-2 focus:ring-teal/25
          `,
            loading || invalid
              ? 'bg-sunken text-muted cursor-not-allowed'
              : 'bg-teal text-white hover:bg-teal-2 active:scale-[0.98] shadow-card cursor-pointer'
          )}
        >
          {loading ? <><Spinner size={13} /><span>Computing…</span></> : 'Generate Map'}
        </button>

        <button
          onClick={onRefresh}
          disabled={loading}
          className="w-full py-2 rounded-md
                     font-mono text-[10px] text-sub border border-border bg-surface
                     hover:border-border2 hover:text-ink
                     transition-all duration-150 disabled:opacity-40"
        >
          Force refresh
        </button>

        {error && status === 'error' && (
          <div className="p-2.5 rounded-md bg-urban-bg border border-red-200">
            <p className="font-mono text-[9px] text-urban leading-relaxed">{error}</p>
          </div>
        )}
      </div>

      {/* ── Legend ── */}
      <div className="px-4 py-4 border-b border-line">
        <Label className="mb-3 block">Map legend</Label>
        <div className="space-y-2 stagger">
          {LEGEND.map(item => (
            <div key={item.name} className="flex items-center gap-2.5">
              <div className={cn('w-8 h-5 rounded flex-shrink-0 flex items-center justify-center', item.bg)}>
                <div className="w-2.5 h-2.5 rounded-sm" style={{ background: item.color }} />
              </div>
              <div>
                <div className="font-display text-[11px] font-semibold text-ink leading-tight">
                  {item.name}
                </div>
                <div className="font-mono text-[9px] text-muted">{item.sub}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Divider />

      {/* ── Classifier meta ── */}
      <div className="px-4 py-4 mt-auto">
        <Label className="mb-2.5 block">Classifier info</Label>
        <div className="space-y-1.5">
          {[
            ['Type', 'Random Forest'],
            ['Trees', '50'],
            ['Training', 'ESA WorldCover v2'],
            ['Resolution', '30 m (Landsat)'],
            ['Year range', '2000 – 2024'],
          ].map(([k, v]) => (
            <div key={k} className="flex justify-between items-baseline">
              <span className="font-mono text-[9px] text-muted">{k}</span>
              <span className="font-mono text-[9px] text-sub font-medium">{v}</span>
            </div>
          ))}
        </div>
        <p className="font-mono text-[8px] text-ghost mt-3 leading-relaxed">
          Pre-2013 years use Landsat 7 — quality may vary after 2003 (SLC failure).
        </p>
      </div>
    </aside>
  )
}
