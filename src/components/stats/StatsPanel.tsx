import { useMemo } from 'react'
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
} from 'recharts'
import { computeDeltas, fmt, fmtDelta, cn } from '@/lib/utils'
import { Label, Divider } from '@/components/ui'
import type { ClassifyResponse, AppStatus } from '@/types'

interface Props { result: ClassifyResponse | null; status: AppStatus }

// Custom tooltip for recharts
function ChartTip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-surface border border-border rounded-lg px-3 py-2.5 shadow-float text-[10px]">
      <p className="font-mono text-muted mb-1.5">{label}</p>
      {payload.map((p: any) => (
        <div key={p.dataKey} className="flex items-center gap-2 mb-0.5">
          <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: p.fill || p.stroke }} />
          <span className="font-mono text-sub">{p.name}: <strong className="text-ink">{fmt(p.value)}</strong></span>
        </div>
      ))}
    </div>
  )
}

// Skeleton loading state
function Skeleton() {
  return (
    <div className="h-[200px] flex-shrink-0 border-t border-border bg-surface flex">
      <div className="flex-1 p-4 space-y-2">
        <div className="skeleton h-3 w-24" />
        <div className="flex gap-2 items-end h-32 pt-4">
          {[60,40,75,30,50].map((h,i) => (
            <div key={i} className="flex-1 flex gap-1 items-end">
              <div className="skeleton flex-1 rounded-t" style={{ height: h * 0.6 }} />
              <div className="skeleton flex-1 rounded-t" style={{ height: h }} />
            </div>
          ))}
        </div>
      </div>
      <div className="w-px bg-line" />
      <div className="w-[280px] p-4 space-y-2">
        <div className="skeleton h-3 w-20 mb-3" />
        {Array(5).fill(0).map((_,i) => (
          <div key={i} className="skeleton h-8 rounded-lg" />
        ))}
      </div>
    </div>
  )
}

export default function StatsPanel({ result, status }: Props) {
  const deltas   = useMemo(() => result ? computeDeltas(result.year1, result.year2) : [], [result])
  const y1 = result?.year1.year
  const y2 = result?.year2.year

  // Build recharts grouped data
  const barData = useMemo(() => {
    if (!result) return []
    return result.year1.stats.map(s1 => {
      const s2 = result.year2.stats.find(s => s.classId === s1.classId)
      return {
        name:  s1.name.slice(0,4),  // short label for axis
        full:  s1.name,
        color: s1.color,
        [y1!]: s1.areaKm2,
        [y2!]: s2?.areaKm2 ?? 0,
      }
    })
  }, [result, y1, y2])

  if (status === 'loading') return <Skeleton />

  if (!result) {
    return (
      <div className="h-[200px] flex-shrink-0 border-t border-border bg-surface
                      flex items-center justify-center">
        <p className="font-mono text-[10px] text-muted">
          Area statistics appear here after classification
        </p>
      </div>
    )
  }

  return (
    <div className="
      h-[200px] flex-shrink-0 border-t border-border
      bg-surface flex overflow-hidden animate-up
    ">

      {/* ── Left: Summary stat cards (total area per class) ── */}
      <div className="w-[220px] flex-shrink-0 flex flex-col border-r border-line">
        <div className="px-4 pt-3 pb-2 flex-shrink-0 flex items-center justify-between">
          <Label>Class areas · {y2}</Label>
          <span className="font-mono text-[9px] text-muted">km²</span>
        </div>
        <div className="flex-1 overflow-y-auto px-3 pb-2 space-y-1">
          {result.year2.stats.map(s => {
            const d = deltas.find(d => d.name === s.name)
            const isUp = (d?.deltaKm2 ?? 0) > 0
            const isDn = (d?.deltaKm2 ?? 0) < 0
            return (
              <div key={s.classId}
                className="flex items-center justify-between px-2.5 py-1.5 rounded-md
                           bg-raised border border-line hover:border-border transition-colors"
              >
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-sm flex-shrink-0"
                    style={{ background: s.color }} />
                  <span className="font-display text-[11px] font-semibold text-ink">
                    {s.name}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[11px] font-medium text-ink">
                    {fmt(s.areaKm2)}
                  </span>
                  {d && d.deltaKm2 !== 0 && (
                    <span className={cn(
                      'font-mono text-[9px] px-1.5 py-0.5 rounded',
                      isUp ? 'bg-urban-bg text-urban' :
                      isDn ? 'bg-forest-bg text-forest' :
                      'bg-raised text-muted'
                    )}>
                      {d.deltaPct > 0 ? '+' : ''}{d.deltaPct}%
                    </span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <Divider vertical />

      {/* ── Centre: Grouped bar chart ── */}
      <div className="flex-1 flex flex-col min-w-0 border-r border-line">
        <div className="px-4 pt-3 pb-1 flex-shrink-0 flex items-center justify-between">
          <Label>Area comparison (km²)</Label>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <div className="w-5 h-2 rounded-sm bg-border" />
              <span className="font-mono text-[9px] text-muted">{y1}</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-5 h-2 rounded-sm bg-teal/60" />
              <span className="font-mono text-[9px] text-muted">{y2}</span>
            </div>
          </div>
        </div>
        <div className="flex-1 min-h-0 px-2 pb-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData} barGap={2} barSize={10}
              margin={{ top: 4, right: 8, bottom: 0, left: -18 }}>
              <XAxis dataKey="name"
                tick={{ fontSize: 9, fontFamily: 'JetBrains Mono', fill: '#9E9890' }}
                axisLine={{ stroke: '#EAE6DF' }} tickLine={false} />
              <YAxis
                tick={{ fontSize: 8, fontFamily: 'JetBrains Mono', fill: '#9E9890' }}
                axisLine={false} tickLine={false}
                tickFormatter={v => v >= 1000 ? `${(v/1000).toFixed(0)}k` : String(Math.round(v))} />
              <Tooltip content={<ChartTip />}
                cursor={{ fill: 'rgba(26,23,20,0.03)' }} />
              {/* Year 1 bars — desaturated */}
              <Bar dataKey={y1} name={String(y1)} radius={[3,3,0,0]}>
                {barData.map((d,i) => (
                  <Cell key={i} fill={d.color} fillOpacity={0.25} />
                ))}
              </Bar>
              {/* Year 2 bars — full colour */}
              <Bar dataKey={y2} name={String(y2)} radius={[3,3,0,0]}>
                {barData.map((d,i) => (
                  <Cell key={i} fill={d.color} fillOpacity={0.85} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <Divider vertical />

      {/* ── Right: Delta change cards ── */}
      <div className="w-[240px] flex-shrink-0 flex flex-col">
        <div className="px-4 pt-3 pb-2 flex-shrink-0">
          <Label>Change {y1} → {y2}</Label>
        </div>
        <div className="flex-1 overflow-y-auto px-3 pb-2 space-y-1.5">
          {deltas.map((d, i) => (
            <div
              key={d.name}
              className="flex items-center justify-between px-3 py-2 rounded-lg
                         border border-line bg-raised
                         hover:border-border transition-colors animate-up"
              style={{ animationDelay: `${i * 45}ms`, opacity: 0 }}
            >
              {/* Class dot + name */}
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-sm flex-shrink-0"
                  style={{ background: d.color }} />
                <span className="font-display text-[11px] font-semibold text-sub">
                  {d.name}
                </span>
              </div>

              {/* Delta value + pct pill */}
              <div className="flex items-center gap-2">
                <span className={cn(
                  'font-mono text-[11px] font-bold',
                  d.deltaKm2 > 0 ? 'text-urban' :
                  d.deltaKm2 < 0 ? 'text-forest' : 'text-muted'
                )}>
                  {fmtDelta(d.deltaKm2)}
                </span>
                <span className={cn(
                  'font-mono text-[9px] font-medium px-1.5 py-0.5 rounded-md min-w-[40px] text-center',
                  d.deltaKm2 > 0 ? 'bg-urban-bg text-urban' :
                  d.deltaKm2 < 0 ? 'bg-forest-bg text-forest' :
                  'bg-sunken text-muted'
                )}>
                  {d.deltaPct > 0 ? '+' : ''}{d.deltaPct}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}
