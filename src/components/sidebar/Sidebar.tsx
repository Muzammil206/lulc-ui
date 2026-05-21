import { Label, Select, Spinner } from '@/components/ui'
import { yearRange, cn } from '@/lib/utils'
import type { AOIListResponse, AppStatus, ClassifyResponse } from '@/types'

const CLASSES = [
  { name: 'Forest',   sub: 'Trees & woodland',  color: '#16A34A', ring: '#BBF7D0' },
  { name: 'Cropland', sub: 'Farms & savanna',   color: '#CA8A04', ring: '#FEF08A' },
  { name: 'Urban',    sub: 'Built-up & roads',  color: '#DC2626', ring: '#FECACA' },
  { name: 'Water',    sub: 'Rivers & lakes',    color: '#2563EB', ring: '#BFDBFE' },
  { name: 'Bare',     sub: 'Exposed soil',      color: '#78716C', ring: '#E7E5E4' },
]

interface Props {
  aoiList:       AOIListResponse | null
  aoiKey:        string
  year1:         number
  year2:         number
  status:        AppStatus
  error:         string | null
  result:        ClassifyResponse | null
  onAoiChange:   (k: string) => void
  onYear1Change: (y: number) => void
  onYear2Change: (y: number) => void
  onGenerate:    () => void
  onRefresh:     () => void
}

export default function Sidebar({
  aoiList, aoiKey, year1, year2, status, error, result,
  onAoiChange, onYear1Change, onYear2Change, onGenerate, onRefresh,
}: Props) {
  const loading = status === 'loading'
  const yr      = aoiList?.yearRange ?? { min: 2000, max: 2024 }
  const years   = yearRange(yr.min, yr.max)
  const invalid = year1 === year2

  return (
    <aside className="w-[232px] flex-shrink-0 flex flex-col h-full
                      bg-white border-r border-border overflow-y-auto">

      {/* ── 1. Location ─────────────────────────────────── */}
      <div className="px-5 pt-5 pb-4 border-b border-line">
        <Label className="mb-2 block">Study area</Label>
        <Select value={aoiKey} onChange={onAoiChange} disabled={loading}>
          {aoiList?.locations.map(l => (
            <option key={l.key} value={l.key}>{l.label}</option>
          )) ?? (
            <option value="ogidi-ilorin-west">Ogidi, Ilorin West LGA</option>
          )}
        </Select>
        <div className="mt-2 flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-teal" />
          <span className="font-mono text-[9px] text-muted">
            {aoiList?.locations.find(l => l.key === aoiKey)?.state ?? 'Kwara'} State · Nigeria
          </span>
        </div>
      </div>

      {/* ── 2. Year comparison ──────────────────────────── */}
      <div className="px-5 py-4 border-b border-line">
        <Label className="mb-3 block">Comparison period</Label>

        {/* Year cards */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <p className="font-mono text-[9px] text-muted mb-1.5">Baseline</p>
            <Select value={year1} onChange={v => onYear1Change(Number(v))} disabled={loading}>
              {years.filter(y => y !== year2).map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </Select>
          </div>
          <div>
            <p className="font-mono text-[9px] text-muted mb-1.5">Comparison</p>
            <Select value={year2} onChange={v => onYear2Change(Number(v))} disabled={loading}>
              {years.filter(y => y !== year1).map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </Select>
          </div>
        </div>

        {/* Span indicator */}
        <div className="mt-2.5 flex items-center gap-2">
          <div className="flex-1 h-px bg-border relative">
            <div className="absolute inset-y-0 left-0 right-0 flex items-center justify-center">
              <div className="bg-white px-2 font-mono text-[9px] text-teal font-medium">
                {Math.abs(year2 - year1)} yr span
              </div>
            </div>
          </div>
          <button
            onClick={() => { onYear1Change(year2); onYear2Change(year1) }}
            disabled={loading}
            className="w-6 h-6 rounded-full border border-border text-ghost text-[11px]
                       flex items-center justify-center hover:border-teal hover:text-teal
                       transition-all disabled:opacity-40 flex-shrink-0"
            title="Swap years"
          >⇄</button>
        </div>

        {invalid && (
          <p className="font-mono text-[9px] text-urban mt-2">
            Please select two different years
          </p>
        )}
      </div>

      {/* ── 3. Actions ──────────────────────────────────── */}
      <div className="px-5 py-4 border-b border-line space-y-2">
        <button
          onClick={onGenerate}
          disabled={loading || invalid}
          className={cn(
            'w-full flex items-center justify-center gap-2 py-2.5 rounded-lg',
            'font-display font-semibold text-[13px] tracking-tight',
            'transition-all duration-150',
            loading || invalid
              ? 'bg-sunken text-muted cursor-not-allowed'
              : 'bg-teal text-white hover:bg-teal-2 shadow-sm active:scale-[0.98]'
          )}
        >
          {loading ? (
            <><Spinner size={13} /><span>Computing…</span></>
          ) : (
            'Analyse changes'
          )}
        </button>

        <button
          onClick={onRefresh}
          disabled={loading}
          className="w-full py-2 rounded-lg font-mono text-[10px] text-ghost
                     border border-border hover:border-border2 hover:text-sub
                     transition-all disabled:opacity-30 bg-white"
        >
          Force recompute
        </button>

        {error && status === 'error' && (
          <div className="px-3 py-2.5 rounded-lg bg-urban-bg border border-red-200">
            <p className="font-mono text-[9px] text-urban leading-relaxed">{error}</p>
          </div>
        )}
      </div>

      {/* ── 4. Legend ───────────────────────────────────── */}
      <div className="px-5 py-4 border-b border-line">
        <Label className="mb-3 block">Classification legend</Label>
        <div className="space-y-1.5">
          {CLASSES.map(c => (
            <div key={c.name}
              className="flex items-center gap-3 px-2.5 py-2 rounded-lg
                         bg-raised border border-transparent
                         hover:border-border transition-colors">
              {/* Colour swatch */}
              <div className="relative flex-shrink-0">
                <div className="w-4 h-4 rounded"
                  style={{ background: c.color }} />
              </div>
              <div className="min-w-0">
                <p className="font-display text-[11px] font-semibold text-ink leading-none">
                  {c.name}
                </p>
                <p className="font-mono text-[9px] text-muted mt-0.5 leading-none">
                  {c.sub}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── 5. Model info ───────────────────────────────── */}
      <div className="px-5 py-4 border-b border-line">
        <Label className="mb-3 block">Model details</Label>
        <div className="space-y-2">
          {[
            { k: 'Algorithm',  v: 'Random Forest' },
            { k: 'Trees',      v: '50' },
            { k: 'Training',   v: 'ESA WorldCover v2' },
            { k: 'Imagery',    v: 'Landsat 8/9 SR' },
            { k: 'Resolution', v: '30 m' },
          ].map(({ k, v }) => (
            <div key={k} className="flex items-center justify-between">
              <span className="font-mono text-[9px] text-muted">{k}</span>
              <span className="font-mono text-[9px] text-ink font-medium">{v}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── 6. Accuracy badge — only when result ────────── */}
      {result && (
        <div className="px-5 py-4 border-b border-line">
          <Label className="mb-3 block">Classification quality</Label>
          <div className="space-y-2">
            {/* OA bar */}
            <div>
              <div className="flex justify-between mb-1">
                <span className="font-mono text-[9px] text-muted">Overall accuracy</span>
                <span className="font-mono text-[9px] text-ink font-medium">71%</span>
              </div>
              <div className="h-1.5 rounded-full bg-sunken overflow-hidden">
                <div className="h-full rounded-full bg-teal transition-all duration-700"
                  style={{ width: '71%' }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className="font-mono text-[9px] text-muted">Kappa coefficient</span>
                <span className="font-mono text-[9px] text-ink font-medium">0.64</span>
              </div>
              <div className="h-1.5 rounded-full bg-sunken overflow-hidden">
                <div className="h-full rounded-full bg-forest/70 transition-all duration-700"
                  style={{ width: '64%' }} />
              </div>
            </div>
          </div>
          <p className="font-mono text-[8px] text-ghost mt-2.5 leading-relaxed">
            Trained on ESA WorldCover 10m. Forest/Cropland confusion common in savanna landscapes.
          </p>
        </div>
      )}

      {/* ── 7. Data note ────────────────────────────────── */}
      <div className="px-5 py-4 mt-auto">
        <p className="font-mono text-[8px] text-ghost leading-relaxed">
          Years 2000–2012 use Landsat 7. Post-2003 data may show scan-line artefacts due to the ETM+ SLC failure.
        </p>
      </div>
    </aside>
  )
}