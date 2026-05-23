import { useMemo } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, Cell, ReferenceLine,
} from 'recharts'
import { computeDeltas, fmt, fmtDelta, fmtShort, cn } from '@/lib/utils'
import type { ClassifyResponse, AppStatus } from '@/types'

interface Props { result: ClassifyResponse | null; status: AppStatus }

const CLASS_COLORS: Record<string, string> = {
  Forest: '#16A34A', Cropland: '#CA8A04',
  Urban: '#DC2626',  Water: '#2563EB', Bare: '#78716C',
}

function ChartTip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-border rounded-lg shadow-panel
                    px-3 py-2.5 text-[10px] min-w-[140px]">
      <p className="font-display font-semibold text-ink mb-1.5">
        {payload[0]?.payload?.full ?? label}
      </p>
      {payload.map((p: any) => (
        <div key={p.dataKey} className="flex items-center justify-between gap-4 mb-0.5">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-sm" style={{ background: p.fill }} />
            <span className="font-mono text-ghost">{p.name}</span>
          </div>
          <span className="font-mono text-ink font-medium">
            {fmtShort(p.value)} km²
          </span>
        </div>
      ))}
    </div>
  )
}

function DeltaTip({ active, payload }: any) {
  if (!active || !payload?.length) return null
  const v = payload[0]?.value ?? 0
  return (
    <div className="bg-white border border-border rounded-lg shadow-panel px-3 py-2 text-[10px]">
      <p className="font-mono text-ink font-semibold">{fmtDelta(v)}</p>
      <p className="font-mono text-ghost">{v > 0 ? 'increased' : v < 0 ? 'decreased' : 'no change'}</p>
    </div>
  )
}

function Skeleton() {
  return (
    <div className="h-[200px] flex-shrink-0 border-t border-border bg-white flex">
      <div className="flex-1 p-4">
        <div className="skeleton h-2.5 w-28 mb-4 rounded" />
        <div className="flex gap-3 items-end h-28">
          {[55,38,72,28,44].map((h, i) => (
            <div key={i} className="flex gap-1 items-end flex-1">
              <div className="skeleton flex-1 rounded-t" style={{ height: h * 0.55 }} />
              <div className="skeleton flex-1 rounded-t" style={{ height: h }} />
            </div>
          ))}
        </div>
      </div>
      <div className="w-px bg-line" />
      <div className="w-[210px] p-4 space-y-2">
        <div className="skeleton h-2.5 w-24 rounded mb-1" />
        {[1,2,3,4,5].map(i => <div key={i} className="skeleton h-7 rounded-lg" />)}
      </div>
      <div className="w-px bg-line" />
      <div className="w-[240px] p-4 space-y-2">
        <div className="skeleton h-2.5 w-20 rounded mb-1" />
        {[1,2,3,4,5].map(i => <div key={i} className="skeleton h-7 rounded-lg" />)}
      </div>
    </div>
  )
}

function Empty() {
  return (
    <div className="h-[200px] flex-shrink-0 border-t border-border bg-raised
                    flex items-center justify-center">
      <div className="text-center">
        <div className="grid grid-cols-3 gap-1 opacity-20 mb-3 mx-auto w-fit">
          {['#16A34A','#CA8A04','#DC2626','#2563EB','#78716C',
            '#16A34A','#CA8A04','#DC2626','#78716C'].map((c,i) => (
            <div key={i} className="w-4 h-4 rounded-sm" style={{ background: c }} />
          ))}
        </div>
        <p className="font-display font-semibold text-[13px] text-ink">No analysis yet</p>
        <p className="font-mono text-[10px] text-muted mt-1">
          Select a location and years, then click Analyse changes
        </p>
      </div>
    </div>
  )
}

export default function StatsPanel({ result, status }: Props) {
  const deltas  = useMemo(() => result ? computeDeltas(result.year1, result.year2) : [], [result])
  const y1      = result?.year1.year
  const y2      = result?.year2.year

  const barData = useMemo(() => {
    if (!result) return []
    return result.year1.stats.map(s1 => {
      const s2 = result.year2.stats.find(s => s.classId === s1.classId)
      return {
        name:  s1.name.slice(0,4),
        full:  s1.name,
        color: s1.color,
        [y1!]: s1.areaKm2,
        [y2!]: s2?.areaKm2 ?? 0,
      }
    })
  }, [result, y1, y2])

  const deltaBarData = useMemo(() =>
    deltas.map(d => ({
      name:  d.name.slice(0,4),
      full:  d.name,
      value: d.deltaKm2,
      color: d.color,
    })),
  [deltas])

  // Summary totals
  const totalUrbanGrowth = useMemo(() => {
    const d = deltas.find(d => d.name === 'Urban')
    return d ? d.deltaKm2 : 0
  }, [deltas])

  const totalForestLoss = useMemo(() => {
    const d = deltas.find(d => d.name === 'Forest')
    return d && d.deltaKm2 < 0 ? Math.abs(d.deltaKm2) : 0
  }, [deltas])

  if (status === 'loading') return <Skeleton />
  if (!result)              return <Empty />

  return (
    <div className="flex-shrink-0 border-t border-border bg-white overflow-hidden"
      style={{ height: 200 }}>
      <div className="flex h-full">

        {/* ── Summary KPI cards ── */}
        <div className="w-[180px] flex-shrink-0 flex flex-col border-r border-line p-3 gap-2">
          <p className="font-display font-bold text-[11px] text-ink flex-shrink-0">Key findings</p>

          <div className="flex-1 flex flex-col gap-1.5">
            {/* Urban growth card */}
            <div className={cn(
              'flex-1 rounded-lg px-2.5 py-2 border',
              totalUrbanGrowth > 0
                ? 'bg-urban-bg border-red-200'
                : 'bg-raised border-border'
            )}>
              <p className="font-mono text-[8px] text-muted uppercase tracking-wide">Urban growth</p>
              <p className={cn(
                'font-display font-bold text-[15px] mt-0.5',
                totalUrbanGrowth > 0 ? 'text-urban' : 'text-ghost'
              )}>
                {totalUrbanGrowth > 0 ? `+${fmtShort(totalUrbanGrowth)}` : '—'}
              </p>
              {totalUrbanGrowth > 0 && (
                <p className="font-mono text-[8px] text-muted mt-0.5">km² built-up area</p>
              )}
            </div>

            {/* Forest loss card */}
            <div className={cn(
              'flex-1 rounded-lg px-2.5 py-2 border',
              totalForestLoss > 0
                ? 'bg-[#F0FDF4] border-green-200'
                : 'bg-raised border-border'
            )}>
              <p className="font-mono text-[8px] text-muted uppercase tracking-wide">Forest loss</p>
              <p className={cn(
                'font-display font-bold text-[15px] mt-0.5',
                totalForestLoss > 0 ? 'text-forest' : 'text-ghost'
              )}>
                {totalForestLoss > 0 ? `−${fmtShort(totalForestLoss)}` : '—'}
              </p>
              {totalForestLoss > 0 && (
                <p className="font-mono text-[8px] text-muted mt-0.5">km² woodland lost</p>
              )}
            </div>

            {/* Span */}
            <div className="flex-shrink-0 flex items-center justify-between
                            px-2.5 py-1.5 rounded-lg bg-raised border border-border">
              <span className="font-mono text-[8px] text-muted">Span</span>
              <span className="font-mono text-[9px] text-ink font-semibold">
                {Math.abs(y2! - y1!)} years
              </span>
            </div>
          </div>
        </div>

        {/* ── Bar chart: area by class ── */}
        <div className="flex-1 flex flex-col min-w-0 px-3 pt-3 pb-1 border-r border-line">
          <div className="flex items-center justify-between mb-1.5 flex-shrink-0">
            <p className="font-display font-bold text-[11px] text-ink">Area (km²)</p>
            <div className="flex items-center gap-2.5">
              <div className="flex items-center gap-1">
                <div className="w-3 h-2 rounded-sm bg-ink/20" />
                <span className="font-mono text-[8px] text-ghost">{y1}</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-2 rounded-sm bg-teal/60" />
                <span className="font-mono text-[8px] text-ghost">{y2}</span>
              </div>
            </div>
          </div>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} barGap={2} barSize={10}
                margin={{ top: 2, right: 2, bottom: 0, left: -22 }}>
                <XAxis dataKey="name"
                  tick={{ fontSize: 9, fontFamily: 'JetBrains Mono', fill: '#BCB8B0' }}
                  axisLine={{ stroke: '#EDE9E3' }} tickLine={false} />
                <YAxis
                  tick={{ fontSize: 8, fontFamily: 'JetBrains Mono', fill: '#BCB8B0' }}
                  axisLine={false} tickLine={false}
                  tickFormatter={v => v >= 1000 ? `${(v/1000).toFixed(0)}k` : String(Math.round(v))} />
                <Tooltip content={<ChartTip />} cursor={{ fill: 'rgba(26,23,20,0.025)' }} />
                <Bar dataKey={y1!} name={String(y1)} radius={[2,2,0,0]}>
                  {barData.map((d,i) => <Cell key={i} fill={d.color} fillOpacity={0.22} />)}
                </Bar>
                <Bar dataKey={y2!} name={String(y2)} radius={[2,2,0,0]}>
                  {barData.map((d,i) => <Cell key={i} fill={d.color} fillOpacity={0.9} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ── Horizontal delta bar ── */}
        <div className="w-[190px] flex-shrink-0 flex flex-col px-3 pt-3 pb-1 border-r border-line">
          <p className="font-display font-bold text-[11px] text-ink mb-1.5 flex-shrink-0">
            Net change
          </p>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={deltaBarData} layout="vertical" barSize={9}
                margin={{ top: 0, right: 8, bottom: 0, left: 2 }}>
                <XAxis type="number" hide />
                <YAxis type="category" dataKey="name" width={30}
                  tick={{ fontSize: 9, fontFamily: 'JetBrains Mono', fill: '#BCB8B0' }}
                  axisLine={false} tickLine={false} />
                <Tooltip content={<DeltaTip />} cursor={{ fill: 'rgba(26,23,20,0.025)' }} />
                <ReferenceLine x={0} stroke="#DDD9D1" strokeWidth={1} />
                <Bar dataKey="value" radius={2}>
                  {deltaBarData.map((d,i) => (
                    <Cell key={i}
                      fill={d.value > 0 ? '#DC2626' : d.value < 0 ? '#16A34A' : '#BCB8B0'}
                      fillOpacity={0.75}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ── Delta cards ── */}
        <div className="w-[230px] flex-shrink-0 flex flex-col px-3 pt-3 pb-2">
          <p className="font-display font-bold text-[11px] text-ink mb-1.5 flex-shrink-0">
            {y1} → {y2}
          </p>
          <div className="flex-1 overflow-y-auto space-y-1 pr-0.5">
            {deltas.map((d) => (
              <div key={d.name}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg
                           bg-raised border border-line hover:border-border transition-colors">
                <div className="w-2.5 h-2.5 rounded-sm flex-shrink-0"
                  style={{ background: d.color }} />
                <span className="font-display text-[11px] font-medium text-sub flex-1 truncate">
                  {d.name}
                </span>
                <span className="font-mono text-[9px] text-ghost">
                  {fmtShort(d.areaKm2_y2)}
                </span>
                <span className={cn(
                  'font-mono text-[10px] font-bold min-w-[44px] text-right',
                  d.deltaKm2 > 0 ? 'text-urban' :
                  d.deltaKm2 < 0 ? 'text-forest' : 'text-ghost'
                )}>
                  {d.deltaKm2 > 0 ? '+' : ''}{fmtShort(d.deltaKm2)}
                </span>
                <span className={cn(
                  'font-mono text-[8px] font-semibold px-1.5 py-0.5 rounded',
                  'min-w-[38px] text-center flex-shrink-0',
                  d.deltaKm2 > 0 ? 'bg-urban-bg text-urban' :
                  d.deltaKm2 < 0 ? 'bg-[#F0FDF4] text-forest' :
                  'bg-raised text-ghost'
                )}>
                  {d.deltaPct > 0 ? '+' : ''}{d.deltaPct}%
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}