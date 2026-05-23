import { useState, useMemo } from 'react'
import { Label, Select, Spinner } from '@/components/ui'
import { yearRange, cn } from '@/lib/utils'
import type { AOIListResponse, AppStatus, ClassifyResponse } from '@/types'

const CLASSES = [
  { name:'Forest',   sub:'Trees & woodland', color:'#16A34A' },
  { name:'Cropland', sub:'Farms & savanna',  color:'#CA8A04' },
  { name:'Urban',    sub:'Built-up & roads', color:'#DC2626' },
  { name:'Water',    sub:'Rivers & lakes',   color:'#2563EB' },
  { name:'Bare',     sub:'Exposed soil',     color:'#78716C' },
]

const ZONE_ORDER = [
  'Featured', 'North West', 'North East',
  'North Central', 'South West', 'South East', 'South South',
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
  const [search, setSearch] = useState('')

  // Filter locations by search term
  const filteredZones = useMemo(() => {
    if (!aoiList?.zones) return {}
    if (!search.trim()) return aoiList.zones
    const q = search.toLowerCase()
    const out: Record<string, typeof aoiList.locations> = {}
    for (const [zone, locs] of Object.entries(aoiList.zones)) {
      const matched = locs.filter(l =>
        l.label.toLowerCase().includes(q) ||
        l.state.toLowerCase().includes(q)
      )
      if (matched.length) out[zone] = matched
    }
    return out
  }, [aoiList, search])

  const currentLocation = aoiList?.locations.find(l => l.key === aoiKey)
  const spanYears = Math.abs(year2 - year1)

  return (
    <aside className="w-[240px] flex-shrink-0 flex flex-col h-full
                      bg-white border-r border-border overflow-hidden">
      <div className="flex-1 overflow-y-auto">

        {/* ── 1. Location selector ──────────────────────── */}
        <div className="px-4 pt-4 pb-3 border-b border-line">
          <Label className="mb-2 block">Study area</Label>

          {/* Search box */}
          <div className="relative mb-2">
            <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 text-ghost"
              width="12" height="12" viewBox="0 0 12 12" fill="none">
              <circle cx="5" cy="5" r="3.5" stroke="currentColor" strokeWidth="1.2"/>
              <path d="M8 8L10.5 10.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
            </svg>
            <input
              type="text"
              placeholder="Search states…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-7 pr-3 py-1.5 text-[11px] font-mono
                         bg-raised border border-border rounded-md text-ink
                         placeholder:text-ghost focus:outline-none focus:border-teal
                         focus:ring-1 focus:ring-teal/20 transition-all"
            />
          </div>

          {/* Grouped dropdown */}
          <div className="relative">
            <select
              value={aoiKey}
              onChange={e => { onAoiChange(e.target.value); setSearch('') }}
              disabled={loading}
              className="w-full appearance-none bg-white border border-border rounded-md
                         px-3 py-2 pr-8 font-body text-[12px] font-medium text-ink
                         focus:outline-none focus:border-teal focus:ring-1 focus:ring-teal/20
                         hover:border-border2 disabled:opacity-50 transition-all cursor-pointer"
            >
              {ZONE_ORDER.map(zone => {
                const locs = filteredZones[zone]
                if (!locs?.length) return null
                return (
                  <optgroup key={zone} label={`── ${zone} ──`}>
                    {locs.map(l => (
                      <option key={l.key} value={l.key}>{l.label}</option>
                    ))}
                  </optgroup>
                )
              })}
            </select>
            <div className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-muted">
              <svg width="10" height="6" viewBox="0 0 10 6" fill="none">
                <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5"
                  strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>

          {/* Location meta */}
          {currentLocation && (
            <div className="mt-2 space-y-1">
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-teal flex-shrink-0" />
                <span className="font-mono text-[9px] text-sub">
                  {currentLocation.zone} · {currentLocation.state} State
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-ghost flex-shrink-0" />
                <span className="font-mono text-[9px] text-ghost">
                  {currentLocation.center.lat.toFixed(3)}°N,&nbsp;
                  {currentLocation.center.lng.toFixed(3)}°E &nbsp;·&nbsp;
                  r = {(currentLocation.bufferM / 1000).toFixed(0)} km
                </span>
              </div>
            </div>
          )}
        </div>

        {/* ── 2. Year selection ─────────────────────────── */}
        <div className="px-4 py-3 border-b border-line">
          <Label className="mb-2.5 block">Comparison period</Label>

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

          {/* Span + swap row */}
          <div className="mt-2.5 flex items-center gap-2">
            <div className="flex-1 flex items-center gap-1.5">
              <div className="flex-1 h-px bg-border" />
              <span className={cn(
                'font-mono text-[9px] px-2 py-0.5 rounded-full border',
                spanYears >= 10
                  ? 'bg-teal-bg border-teal-bd text-teal'
                  : spanYears >= 5
                  ? 'bg-[#F0FDF4] border-green-200 text-forest'
                  : 'bg-raised border-border text-muted'
              )}>
                {spanYears}yr
              </span>
              <div className="flex-1 h-px bg-border" />
            </div>
            <button
              onClick={() => { onYear1Change(year2); onYear2Change(year1) }}
              disabled={loading}
              title="Swap years"
              className="w-6 h-6 rounded-full border border-border text-ghost text-xs
                         flex items-center justify-center flex-shrink-0
                         hover:border-teal hover:text-teal transition-all disabled:opacity-40"
            >⇄</button>
          </div>

          {invalid && (
            <p className="font-mono text-[9px] text-urban mt-1.5">
              Please select two different years
            </p>
          )}
        </div>

        {/* ── 3. Actions ────────────────────────────────── */}
        <div className="px-4 py-3 border-b border-line space-y-2">
          <button
            onClick={onGenerate}
            disabled={loading || invalid}
            className={cn(
              'w-full flex items-center justify-center gap-2',
              'py-2.5 rounded-lg font-display font-bold text-[13px]',
              'transition-all duration-150',
              loading || invalid
                ? 'bg-sunken text-muted cursor-not-allowed'
                : 'bg-teal text-white hover:bg-teal-2 shadow-sm active:scale-[0.98]'
            )}
          >
            {loading
              ? <><Spinner size={13} /><span>Computing…</span></>
              : 'Analyse changes'
            }
          </button>

          <button
            onClick={onRefresh}
            disabled={loading}
            className="w-full py-2 rounded-lg font-mono text-[10px] text-ghost
                       border border-border hover:border-border2 hover:text-sub
                       bg-white transition-all disabled:opacity-30"
          >
            Force recompute
          </button>

          {error && status === 'error' && (
            <div className="px-3 py-2 rounded-lg bg-urban-bg border border-red-200">
              <p className="font-mono text-[9px] text-urban leading-relaxed">{error}</p>
            </div>
          )}
        </div>

        {/* ── 4. Legend ─────────────────────────────────── */}
        <div className="px-4 py-3 border-b border-line">
          <Label className="mb-2.5 block">Classification legend</Label>
          <div className="space-y-1">
            {CLASSES.map(c => (
              <div key={c.name}
                className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg
                           bg-raised hover:bg-sunken transition-colors">
                <div className="w-3 h-3 rounded-sm flex-shrink-0"
                  style={{ background: c.color }} />
                <div className="min-w-0">
                  <p className="font-display text-[11px] font-semibold text-ink leading-none">
                    {c.name}
                  </p>
                  <p className="font-mono text-[9px] text-muted mt-0.5">{c.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── 5. Accuracy — only after result ───────────── */}
        {result && (
          <div className="px-4 py-3 border-b border-line">
            <Label className="mb-2.5 block">Classification quality</Label>
            <div className="space-y-2.5">
              {[
                { label: 'Overall accuracy', value: 71, color: 'bg-teal' },
                { label: 'Kappa coefficient', value: 64, color: 'bg-forest/80' },
              ].map(({ label, value, color }) => (
                <div key={label}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-mono text-[9px] text-muted">{label}</span>
                    <span className="font-mono text-[9px] text-ink font-semibold">
                      {value}%
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full bg-sunken overflow-hidden">
                    <div
                      className={`h-full rounded-full ${color} transition-all duration-700`}
                      style={{ width: `${value}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <p className="font-mono text-[8px] text-ghost mt-2.5 leading-relaxed">
              Forest/Cropland confusion is expected in savanna landscapes at 30m resolution.
            </p>
          </div>
        )}

        {/* ── 6. Model info ─────────────────────────────── */}
        <div className="px-4 py-3 border-b border-line">
          <Label className="mb-2.5 block">Model details</Label>
          <div className="space-y-1.5">
            {[
              ['Algorithm',  'Random Forest'],
              ['Trees',      '50'],
              ['Training',   'ESA WorldCover v2'],
              ['Sensor',     'Landsat 8/9 SR'],
              ['Resolution', '30 m'],
              ['Years',      '2000 – 2024'],
            ].map(([k, v]) => (
              <div key={k} className="flex items-center justify-between">
                <span className="font-mono text-[9px] text-muted">{k}</span>
                <span className="font-mono text-[9px] text-ink font-medium">{v}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── 7. Footer note ────────────────────────────── */}
        <div className="px-4 py-3">
          <p className="font-mono text-[8px] text-ghost leading-relaxed">
            2000–2012 uses Landsat 7. Post-2003 imagery may show scan-line artefacts (ETM+ SLC failure).
            All classification runs on Google Earth Engine infrastructure.
          </p>
        </div>

      </div>
    </aside>
  )
}