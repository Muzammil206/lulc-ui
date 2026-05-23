import { clsx, type ClassValue } from 'clsx'
import type { YearResult, DeltaStat } from '@/types'

export const cn = (...i: ClassValue[]) => clsx(i)

const BG_MAP: Record<string, string> = {
  Forest:   'bg-forest-bg text-forest',
  Cropland: 'bg-crop-bg text-crop',
  Urban:    'bg-urban-bg text-urban',
  Water:    'bg-water-bg text-water',
  Bare:     'bg-bare-bg text-bare',
}
export const classBg = (name: string) => BG_MAP[name] ?? 'bg-raised text-sub'

export function computeDeltas(y1: YearResult, y2: YearResult): DeltaStat[] {
  return y1.stats.map(s1 => {
    const s2 = y2.stats.find(s => s.classId === s1.classId)
    const a2 = s2?.areaKm2 ?? 0
    const d  = a2 - s1.areaKm2
    const p  = s1.areaKm2 > 0 ? (d / s1.areaKm2) * 100 : 0
    return {
      name:       s1.name,
      color:      s1.color,
      bgColor:    classBg(s1.name),
      areaKm2_y1: s1.areaKm2,
      areaKm2_y2: a2,
      deltaKm2:   Number(d.toFixed(2)),
      deltaPct:   Number(p.toFixed(1)),
    }
  })
}

export function fmt(n: number): string {
  if (Math.abs(n) >= 1000) return `${(n / 1000).toFixed(1)}k km²`
  return `${n.toFixed(1)} km²`
}

export function fmtShort(n: number): string {
  if (Math.abs(n) >= 1000) return `${(n / 1000).toFixed(1)}k`
  return n.toFixed(1)
}

export function fmtDelta(n: number): string {
  return `${n >= 0 ? '+' : ''}${fmt(n)}`
}

export function yearRange(min: number, max: number): number[] {
  const a: number[] = []
  for (let y = max; y >= min; y--) a.push(y)
  return a
}