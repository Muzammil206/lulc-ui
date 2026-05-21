import { useMemo } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, Cell, ReferenceLine,
} from 'recharts'
import { computeDeltas, fmt, fmtDelta, cn } from '@/lib/utils'
import type { ClassifyResponse, AppStatus } from '@/types'

interface Props {
  result: ClassifyResponse | null
  status: AppStatus
  year1?: number
  year2?: number
}

// ── Recharts custom tooltip ───────────────────────────────
function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-border rounded-lg shadow-panel
                    px-3 py-2.5 text-[10px] min-w-[140px]">
      <p className="font-display font-semibold text-ink mb-1.5">{payload[0]?.payload?.full ?? label}</p>
      {payload.map((p: any) => (
        <div key={p.dataKey} className="flex items-center justify-between gap-4 mb-0.5">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-sm" style={{ background: p.fill }} />
            <span className="font-mono text-ghost">{p.name}</span>
          </div>
          <span className="font-mono text-ink font-medium">{fmt(p.value)}</span>
        </div>
      ))}
    </div>
  )
}

// ── Skeleton ──────────────────────────────────────────────
function Skeleton() {
  return (
    <div className="h-[210px] flex-shrink-0 border-t border-border bg-white flex">
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
      <div className="w-px bg-line flex-shrink-0" />
      <div className="w-[260px] p-4 flex flex-col gap-2">
        <div className="skeleton h-2.5 w-24 rounded mb-1" />
        {Array(5).fill(0).map((_, i) => (
          <div key={i} className="skeleton h-7 rounded-lg" />
        ))}
      </div>
      <div className="w-px bg-line flex-shrink-0" />
      <div className="w-[200px] p-4 flex flex-col gap-2">
        <div className="skeleton h-2.5 w-24 rounded mb-1" />
        {Array(5).fill(0).map((_, i) => (
          <div key={i} className="skeleton h-7 rounded-lg" />
        ))}
      </div>
    </div>
  )
}

// ── Empty state ───────────────────────────────────────────
function Empty() {
  return (
    <div className="h-[210px] flex-shrink-0 border-t border-border bg-raised
                    flex items-center justify-center">
      <div className="text-center">
        <p className="font-display font-semibold text-[13px] text-ink">
          No data yet
        </p>
        <p className="font-mono text-[10px] text-muted mt-1">
          Generate a map to see land cover statistics
        </p>
      </div>
    </div>
  )
}

// ── Main panel ────────────────────────────────────────────
export default function StatsPanel({ result, status, year1: year1Prop, year2: year2Prop }: Props) {
  const deltas = useMemo(() =>
    result ? computeDeltas(result.year1, result.year2) : [],
  [result])

  const y1 = result?.year1.year
  const y2 = result?.year2.year

  const barData = useMemo(() => {
    if (!result) return []
    return result.year1.stats.map(s1 => {
      const s2 = result.year2.stats.find(s => s.classId === s1.classId)
      return {
        name:    s1.name.slice(0, 4),
        full:    s1.name,
        color:   s1.color,
        [y1!]:   s1.areaKm2,
        [y2!]:   s2?.areaKm2 ?? 0,
      }
    })
  }, [result, y1, y2])

  // Net change data for a horizontal delta chart
  const deltaBarData = useMemo(() =>
    deltas.map(d => ({ name: d.name.slice(0,4), full: d.name, value: d.deltaKm2, color: d.color })),
  [deltas])

  if (status === 'loading') return <Skeleton />
  if (!result)              return <Empty />

  return (
    <div className="h-[210px] flex-shrink-0 border-t border-border bg-white
                    flex overflow-hidden">

      {/* ── Column 1: Area bar chart ── */}
      <div className="flex-1 flex flex-col min-w-0 px-4 pt-3 pb-2">
        <div className="flex items-center justify-between mb-2 flex-shrink-0">
          <p className="font-display font-semibold text-[11px] text-ink">
            Area by class (km²)
          </p>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-2 rounded-sm opacity-30 bg-ink" />
              <span className="font-mono text-[9px] text-ghost">{y1}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-2 rounded-sm bg-teal/60" />
              <span className="font-mono text-[9px] text-ghost">{y2}</span>
            </div>
          </div>
        </div>
        <div className="flex-1 min-h-0">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData} barGap={2} barSize={11}
              margin={{ top: 2, right: 4, bottom: 0, left: -22 }}>
              <XAxis dataKey="name"
                tick={{ fontSize: 9, fontFamily: 'JetBrains Mono', fill: '#BCB8B0' }}
                axisLine={{ stroke: '#E8E4DC' }} tickLine={false} />
              <YAxis
                tick={{ fontSize: 8, fontFamily: 'JetBrains Mono', fill: '#BCB8B0' }}
                axisLine={false} tickLine={false}
                tickFormatter={v => v >= 1000 ? `${(v/1000).toFixed(0)}k` : String(Math.round(v))} />
              <Tooltip content={<ChartTooltip />}
                cursor={{ fill: 'rgba(26,23,20,0.025)' }} />
              <Bar dataKey={y1!} name={String(y1)} radius={[2,2,0,0]}>
                {barData.map((d, i) => <Cell key={i} fill={d.color} fillOpacity={0.22} />)}
              </Bar>
              <Bar dataKey={y2!} name={String(y2)} radius={[2,2,0,0]}>
                {barData.map((d, i) => <Cell key={i} fill={d.color} fillOpacity={0.9} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* divider */}
      <div className="w-px bg-line flex-shrink-0" />

      {/* ── Column 2: Net change bar chart ── */}
      <div className="w-[220px] flex-shrink-0 flex flex-col px-4 pt-3 pb-2">
        <p className="font-display font-semibold text-[11px] text-ink mb-2 flex-shrink-0">
          Net change (km²)
        </p>
        <div className="flex-1 min-h-0">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={deltaBarData} layout="vertical" barSize={10}
              margin={{ top: 0, right: 8, bottom: 0, left: 2 }}>
              <XAxis type="number" hide />
              <YAxis type="category" dataKey="name" width={32}
                tick={{ fontSize: 9, fontFamily: 'JetBrains Mono', fill: '#BCB8B0' }}
                axisLine={false} tickLine={false} />
              <Tooltip
                formatter={(v: number) => [fmtDelta(v), 'Change']}
                contentStyle={{ fontFamily: 'JetBrains Mono', fontSize: 10,
                  border: '1px solid #DDD9D1', borderRadius: 8, padding: '6px 10px' }}
                cursor={{ fill: 'rgba(26,23,20,0.025)' }}
              />
              <ReferenceLine x={0} stroke="#DDD9D1" strokeWidth={1} />
              <Bar dataKey="value" radius={2}>
                {deltaBarData.map((d, i) => (
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

      {/* divider */}
      <div className="w-px bg-line flex-shrink-0" />

      {/* ── Column 3: Delta cards ── */}
      <div className="w-[260px] flex-shrink-0 flex flex-col px-4 pt-3 pb-2">
        <p className="font-display font-semibold text-[11px] text-ink mb-2 flex-shrink-0">
          {y1} → {y2} change
        </p>
        <div className="flex-1 overflow-y-auto space-y-1.5 pr-0.5">
          {deltas.map((d, i) => (
            <div key={d.name}
              className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg
                         bg-raised border border-line hover:border-border
                         transition-colors">
              {/* colour dot */}
              <div className="w-2.5 h-2.5 rounded-sm flex-shrink-0"
                style={{ background: d.color }} />

              {/* name */}
              <span className="font-display text-[11px] font-medium text-sub flex-1 min-w-0">
                {d.name}
              </span>

              {/* area y2 */}
              <span className="font-mono text-[9px] text-ghost">
                {fmt(d.areaKm2_y2)}
              </span>

              {/* delta value */}
              <span className={cn(
                'font-mono text-[11px] font-bold min-w-[56px] text-right',
                d.deltaKm2 > 0 ? 'text-urban' :
                d.deltaKm2 < 0 ? 'text-forest' : 'text-ghost'
              )}>
                {d.deltaKm2 > 0 ? '+' : ''}{fmt(d.deltaKm2)}
              </span>

              {/* pct pill */}
              <span className={cn(
                'font-mono text-[9px] font-medium px-1.5 py-0.5 rounded',
                'min-w-[42px] text-center flex-shrink-0',
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
  )
}