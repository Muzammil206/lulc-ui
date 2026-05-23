import type { ClassifyResponse, AOIListResponse } from '@/types'

const BASE = import.meta.env.VITE_API_URL || 'https://lulc-backend-n0dw.onrender.com'

export async function fetchAOIList(): Promise<AOIListResponse> {
  const res = await fetch(`${BASE}/api/aoi`)
  if (!res.ok) throw new Error(`AOI list failed: ${res.status}`)
  return res.json()
}

export async function fetchClassification(
  aoiKey: string, year1: number, year2: number, bust = false
): Promise<ClassifyResponse> {
  const p = new URLSearchParams({ aoiKey, year1: String(year1), year2: String(year2), ...(bust ? { bust:'1' } : {}) })
  const res = await fetch(`${BASE}/api/classify?${p}`)
  if (!res.ok) {
    const b = await res.json().catch(() => ({}))
    throw new Error((b as any).error || `Failed: ${res.status}`)
  }
  return res.json()
}

export async function fetchTimeseries(aoiKey: string, startYear = 2000, endYear = 2024) {
  const p = new URLSearchParams({ aoiKey, startYear: String(startYear), endYear: String(endYear) })
  const res = await fetch(`${BASE}/api/timeseries?${p}`)
  if (!res.ok) throw new Error(`Timeseries failed: ${res.status}`)
  return res.json()
}

export async function startExport(aoiKey: string, year: number) {
  const res = await fetch(`${BASE}/api/export`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ aoiKey, year }),
  })
  if (!res.ok) throw new Error(`Export failed: ${res.status}`)
  return res.json()
}

export async function pollExport(taskId: string) {
  const res = await fetch(`${BASE}/api/export/${taskId}`)
  return res.json()
}

export async function fetchNationalStats(year1 = 2015, year2 = 2024) {
  const p = new URLSearchParams({ year1: String(year1), year2: String(year2) })
  const res = await fetch(`${BASE}/api/stats/national?${p}`)
  if (!res.ok) throw new Error(`National stats failed: ${res.status}`)
  return res.json()
}

export function buildProxyTileUrl(urlFormat: string): string {
  const encoded = encodeURIComponent(urlFormat)
  return `${BASE}/api/tiles/{z}/{x}/{y}?url=${encoded}`
}