import { useEffect } from 'react'
import {
  LineChart, Line, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, Legend,
} from 'recharts'
import { useTimeseries } from '@/hooks/useTimeseries'
import { Spinner } from '@/components/ui'

interface Props { aoiKey: string; year1: number; year2: number; visible: boolean }

const COLORS = { Forest:'#16A34A', Cropland:'#CA8A04', Urban:'#DC2626', Water:'#2563EB', Bare:'#78716C' }

function Tip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-border rounded-lg shadow-panel px-3 py-2.5 text-[10px] min-w-[150px]">
      <p className="font-display font-bold text-ink mb-2">{label}</p>
      {payload.map((p: any) => (
        <div key={p.dataKey} className="flex items-center justify-between gap-4 mb-0.5">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-sm" style={{ background: p.color }} />
            <span className="font-mono text-ghost">{p.dataKey}</span>
          </div>
          <span className="font-mono text-ink font-semibold">
            {p.value >= 1000 ? `${(p.value/1000).toFixed(1)}k` : p.value?.toFixed(1)} km²
          </span>
        </div>
      ))}
    </div>
  )
}

export default function TimeseriesPanel({ aoiKey, year1, year2, visible }: Props) {
  const { data, loading, error, load } = useTimeseries()

  useEffect(() => {
    if (visible && aoiKey) load(aoiKey, 2000, 2024)
  }, [visible, aoiKey])

  if (!visible) return null

  return (
    <div className="border-t border-border bg-white">
      <div className="flex items-center justify-between px-5 py-3 border-b border-line">
        <div>
          <p className="font-display font-bold text-[13px] text-ink">24-year land cover trend</p>
          <p className="font-mono text-[9px] text-muted mt-0.5">Area (km²) per class · 2000–2024</p>
        </div>
        <div className="flex items-center gap-2">
          {loading && <Spinner size={14} />}
          <span className="font-mono text-[9px] text-ghost">
            ● <span className="text-teal">{year1}</span> &nbsp;● <span className="text-ink">{year2}</span> highlighted
          </span>
        </div>
      </div>

      <div style={{ height: 220 }} className="px-4 py-3">
        {loading && (
          <div className="h-full flex flex-col items-center justify-center gap-3">
            <Spinner size={28} />
            <p className="font-mono text-[10px] text-muted">Computing 24-year dataset…</p>
            <p className="font-mono text-[9px] text-ghost">First load 30–60 seconds</p>
          </div>
        )}
        {error && (
          <div className="h-full flex items-center justify-center">
            <p className="font-mono text-[10px] text-urban">{error}</p>
          </div>
        )}
        {data && !loading && (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 4, right: 16, bottom: 0, left: -16 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#EDE9E3" vertical={false} />
              <XAxis dataKey="year"
                tick={{ fontSize: 9, fontFamily: 'JetBrains Mono', fill: '#BCB8B0' }}
                axisLine={{ stroke: '#EDE9E3' }} tickLine={false} />
              <YAxis
                tick={{ fontSize: 8, fontFamily: 'JetBrains Mono', fill: '#BCB8B0' }}
                axisLine={false} tickLine={false}
                tickFormatter={v => v >= 1000 ? `${(v/1000).toFixed(0)}k` : String(Math.round(v))} />
              <Tooltip content={<Tip />} />
              <Legend iconType="circle" iconSize={7}
                wrapperStyle={{ fontSize: 9, fontFamily: 'JetBrains Mono', paddingTop: 6 }} />
              {Object.entries(COLORS).map(([cls, color]) => (
                <Line key={cls} type="monotone" dataKey={cls} stroke={color}
                  strokeWidth={1.5}
                  dot={(props: any) => {
                    const { cx, cy, payload } = props
                    if (payload.year === year1 || payload.year === year2) {
                      return <circle key={`${cls}-${payload.year}`} cx={cx} cy={cy} r={4} fill={color} stroke="white" strokeWidth={1.5} />
                    }
                    return <circle key={`${cls}-${payload.year}`} r={0} cx={cx} cy={cy} />
                  }}
                  activeDot={{ r: 4, stroke: 'white', strokeWidth: 1.5 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}