import type { ClassifyResponse, AOIListResponse } from '@/types'

const BASE = import.meta.env.VITE_API_URL || ''

export async function fetchAOIList(): Promise<AOIListResponse> {
  const res = await fetch(`${BASE}/api/aoi`)
  if (!res.ok) throw new Error(`AOI list failed: ${res.status}`)
  return res.json()
}

export async function fetchClassification(
  aoiKey: string, year1: number, year2: number, bust = false
): Promise<ClassifyResponse> {
  const p = new URLSearchParams({
    aoiKey, year1: String(year1), year2: String(year2),
    ...(bust ? { bust: '1' } : {}),
  })
  const res = await fetch(`${BASE}/api/classify?${p}`)
  if (!res.ok) {
    const b = await res.json().catch(() => ({}))
    throw new Error(b.error || `Failed: ${res.status}`)
  }
  return res.json()
}

/**
 * Build a proxied tile URL for MapLibre.
 *
 * The GEE SDK now returns `urlFormat` — a full tile URL template like:
 *   https://earthengine.googleapis.com/v1/projects/.../maps/.../tiles/{z}/{x}/{y}
 *
 * MapLibre will substitute {z}/{x}/{y} before making the request.
 * We wrap that resolved URL as an encoded query param so our backend
 * can proxy it without the GEE URL ever reaching the browser directly.
 *
 * Final URL MapLibre calls:
 *   /api/tiles/{z}/{x}/{y}?url=https%3A%2F%2Fearthengine...%2F{z}%2F{x}%2F{y}
 *
 * Note: MapLibre substitutes {z}/{x}/{y} in the ENTIRE template string,
 * including inside the encoded url param — which is exactly what we want.
 */
export function buildProxyTileUrl(urlFormat: string): string {
  // Encode the full GEE urlFormat so it survives as a query param value
  const encoded = encodeURIComponent(urlFormat)
  // Our proxy endpoint — MapLibre fills in {z}/{x}/{y} in both places
  return `${BASE}/api/tiles/{z}/{x}/{y}?url=${encoded}`
}