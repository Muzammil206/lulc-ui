import { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import { buildProxyTileUrl } from '@/lib/api'
import { Spinner } from '@/components/ui'
import type { ClassifyResponse, AppStatus } from '@/types'

interface Props {
  result: ClassifyResponse | null
  status: AppStatus
  year1?: number
  year2?: number
}

const BASEMAP = 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png'
const BASEMAP_ATT = '© <a href="https://carto.com/">CARTO</a> © OpenStreetMap'

export default function MapView({ result, status, year1, year2 }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const handleRef    = useRef<HTMLDivElement>(null)
  const lineRef      = useRef<HTMLDivElement>(null)
  const mapRef       = useRef<L.Map | null>(null)
  const paneRef      = useRef<HTMLElement | null>(null) // year2 tile pane
  const layer1Ref    = useRef<L.TileLayer | null>(null)
  const layer2Ref    = useRef<L.TileLayer | null>(null)
  const pctRef       = useRef(50)
  const dragging     = useRef(false)
  const [ready, setReady] = useState(false)

  // ── Move slider + clip the year2 tile pane ───────────────
  // ONE map, ONE canvas. We clip a custom Leaflet pane that holds
  // only the year2 tile layer. The clip is applied directly to
  // that pane's DOM element using clipPath rect().
  // Since both layers are in the same map, they are pixel-perfect
  // aligned at all zoom levels and pan positions.
  const applySwipe = (pct: number) => {
    const container = containerRef.current
    const handle    = handleRef.current
    const line      = lineRef.current
    const pane      = paneRef.current
    if (!container || !handle || !line) return

    const w  = container.offsetWidth
    const h  = container.offsetHeight
    const px = Math.round((pct / 100) * w)

    handle.style.left = `${px}px`
    line.style.left   = `${px}px`

    // Clip the year2 pane: only show pixels to the RIGHT of px
    // clip: rect(top, right, bottom, left) — all px values
    if (pane) {
      pane.style.clip = `rect(0px, ${w}px, ${h}px, ${px}px)`
    }
  }

  // ── Init single Leaflet map ───────────────────────────────
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

    const map = L.map(containerRef.current, {
      center:             [8.517, 4.500],
      zoom:               11,
      zoomControl:        false,
      attributionControl: false,
    })

    L.tileLayer(BASEMAP, {
      attribution: BASEMAP_ATT,
      subdomains:  'abcd',
      maxZoom:     19,
    }).addTo(map)

    L.control.zoom({ position: 'bottomright' }).addTo(map)
    L.control.attribution({ position: 'bottomright', prefix: false }).addTo(map)

    // Create a custom pane for year2 — sits above the default tile pane
    // This is the pane we will clip with CSS
    map.createPane('year2pane')
    const y2pane = map.getPane('year2pane')!
    y2pane.style.zIndex = '450'       // above tiles (400) below overlays (600)
    y2pane.style.pointerEvents = 'none'

    paneRef.current  = y2pane
    mapRef.current   = map
    setReady(true)

    requestAnimationFrame(() => applySwipe(pctRef.current))

    return () => {
      map.remove()
      mapRef.current  = null
      paneRef.current = null
      layer1Ref.current = null
      layer2Ref.current = null
      setReady(false)
    }
  }, [])

  // ── Re-apply clip whenever map moves or resizes ───────────
  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    const fn = () => applySwipe(pctRef.current)
    map.on('move zoom resize', fn)
    return () => { map.off('move zoom resize', fn) }
  }, [ready])

  // ── Add LULC layers when result arrives ───────────────────
  useEffect(() => {
    const map = mapRef.current
    if (!ready || !result || !map) return

    // Remove old layers
    if (layer1Ref.current) { map.removeLayer(layer1Ref.current); layer1Ref.current = null }
    if (layer2Ref.current) { map.removeLayer(layer2Ref.current); layer2Ref.current = null }

    // Year 1 — default tile pane — always fully visible
    const l1 = L.tileLayer(buildProxyTileUrl(result.year1.urlFormat), {
      opacity:  0.88,
      tileSize: 256,
    })
    l1.addTo(map)
    layer1Ref.current = l1

    // Year 2 — year2pane — clipped to the right of the slider
    const l2 = L.tileLayer(buildProxyTileUrl(result.year2.urlFormat), {
      opacity:  0.88,
      tileSize: 256,
      pane:     'year2pane',
    } as any)
    l2.addTo(map)
    layer2Ref.current = l2

    // Fly to AOI — both layers move together (same map)
    map.flyTo(
      [result.aoi.center.lat, result.aoi.center.lng],
      12,
      { duration: 1.2 }
    )

    requestAnimationFrame(() => applySwipe(pctRef.current))
  }, [ready, result])

  // ── Drag handle ───────────────────────────────────────────
  useEffect(() => {
    const handle    = handleRef.current
    const container = containerRef.current
    if (!handle || !container) return

    const onStart = (e: MouseEvent | TouchEvent) => {
      dragging.current = true
      e.preventDefault()
    }
    const onMove = (e: MouseEvent | TouchEvent) => {
      if (!dragging.current) return
      const cx  = 'touches' in e
        ? e.touches[0].clientX
        : (e as MouseEvent).clientX
      const r   = container.getBoundingClientRect()
      const pct = Math.min(95, Math.max(5, ((cx - r.left) / r.width) * 100))
      pctRef.current = pct
      applySwipe(pct)
    }
    const onEnd = () => { dragging.current = false }

    handle.addEventListener('mousedown',  onStart)
    handle.addEventListener('touchstart', onStart, { passive: false })
    window.addEventListener('mousemove',  onMove)
    window.addEventListener('touchmove',  onMove, { passive: false })
    window.addEventListener('mouseup',    onEnd)
    window.addEventListener('touchend',   onEnd)

    return () => {
      handle.removeEventListener('mousedown',  onStart)
      handle.removeEventListener('touchstart', onStart)
      window.removeEventListener('mousemove',  onMove)
      window.removeEventListener('touchmove',  onMove)
      window.removeEventListener('mouseup',    onEnd)
      window.removeEventListener('touchend',   onEnd)
    }
  }, [])

  useEffect(() => {
    const fn = () => applySwipe(pctRef.current)
    window.addEventListener('resize', fn)
    return () => window.removeEventListener('resize', fn)
  }, [])

  return (
    <div className="relative w-full h-full overflow-hidden bg-canvas">

      {/* Single Leaflet map — one canvas, one coordinate space */}
      <div ref={containerRef} className="absolute inset-0" />

      {/* Divider line */}
      <div
        ref={lineRef}
        className="absolute top-0 bottom-0 pointer-events-none"
        style={{
          left:       '50%',
          width:      2,
          marginLeft: -1,
          zIndex:     1000,
          background: 'linear-gradient(to bottom, transparent 0%, #0F7B6C 15%, #0F7B6C 85%, transparent 100%)',
        }}
      />

      {/* Drag handle */}
      <div
        ref={handleRef}
        className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 select-none"
        style={{ left: '50%', zIndex: 1001, cursor: 'ew-resize' }}
      >
        <div className="
          w-10 h-10 rounded-full
          bg-white border-2 border-teal
          shadow-float
          flex items-center justify-center
          text-teal font-bold text-sm
        ">⇄</div>
      </div>

      {/* ── Year labels ── */}
      {status === 'success' && result && (
        <>
          <div className="absolute top-3 left-3 z-[1002] flex items-center gap-1.5
                          px-3 py-1.5 rounded-full bg-white/92 border border-border
                          shadow-card font-mono text-[10px] text-ink
                          backdrop-blur-sm pointer-events-none">
            <div className="w-2 h-2 rounded-full bg-teal flex-shrink-0" />
            {result.year1.year}
            <span className="text-muted ml-1">baseline</span>
          </div>

          <div className="absolute top-3 right-3 z-[1002] flex items-center gap-1.5
                          px-3 py-1.5 rounded-full bg-white/92 border border-border
                          shadow-card font-mono text-[10px] text-ink
                          backdrop-blur-sm pointer-events-none">
            <span className="text-muted mr-1">comparison</span>
            {result.year2.year}
            <div className="w-2 h-2 rounded-full bg-forest flex-shrink-0" />
          </div>

          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-[1002]
                          px-4 py-1.5 rounded-full bg-white/92 border border-border
                          shadow-card font-mono text-[9px] text-sub
                          backdrop-blur-sm pointer-events-none">
            ← drag to compare →
          </div>

          <div className="absolute bottom-8 left-3 z-[1002] flex items-center gap-2
                          px-3 py-1.5 rounded-full bg-white/92 border border-border
                          shadow-card font-mono text-[9px] text-sub backdrop-blur-sm">
            <div className="w-1.5 h-1.5 rounded-full bg-forest" />
            RF · 71% accuracy
          </div>

          <div className="absolute bottom-8 right-3 z-[1002]
                          px-3 py-1.5 rounded-full bg-white/92 border border-border
                          shadow-card font-mono text-[9px] text-muted
                          backdrop-blur-sm pointer-events-none">
            {result.aoi.center.lat.toFixed(3)}°N,&nbsp;
            {result.aoi.center.lng.toFixed(3)}°E
          </div>
        </>
      )}

      {/* Loading */}
      {status === 'loading' && (
        <div className="absolute inset-0 z-[2000] flex items-center justify-center
                        bg-canvas/70 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-5 px-8 py-7 rounded-xl
                          bg-surface border border-border shadow-float">
            <div className="relative">
              <Spinner size={40} />
              <div className="absolute inset-[-6px] rounded-full
                              border border-teal/20 animate-ping" />
            </div>
            <div className="text-center">
              <p className="font-display font-bold text-[14px] text-ink">
                Running classification
              </p>
              <p className="font-mono text-[10px] text-sub mt-1.5">
                GEE processing Landsat imagery<br />First run 8–20s
              </p>
            </div>
            <div className="flex gap-1.5">
              {[0, 1, 2].map(i => (
                <div key={i}
                  className="w-1.5 h-1.5 rounded-full bg-teal animate-beat"
                  style={{ animationDelay: `${i * 250}ms` }}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Idle */}
      {status === 'idle' && (
        <div className="absolute inset-0 z-10 flex items-center justify-center
                        pointer-events-none">
          <div className="flex flex-col items-center gap-4">
            <div className="grid grid-cols-3 gap-1 opacity-25">
              {['#16A34A','#CA8A04','#DC2626','#2563EB','#78716C',
                '#16A34A','#CA8A04','#DC2626','#78716C'].map((c, i) => (
                <div key={i} className="w-5 h-5 rounded" style={{ background: c }} />
              ))}
            </div>
            <div className="text-center bg-surface/85 backdrop-blur-sm
                            px-6 py-4 rounded-xl border border-border shadow-card">
              <p className="font-display font-bold text-[15px] text-ink">
                Select a location & years
              </p>
              <p className="font-mono text-[10px] text-sub mt-1">
                Then click Generate Map
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Error */}
      {status === 'error' && (
        <div className="absolute inset-0 z-10 flex items-center justify-center
                        pointer-events-none">
          <div className="flex flex-col items-center gap-3 px-6 py-5 rounded-xl
                          bg-surface border border-red-200 shadow-float">
            <div className="w-10 h-10 rounded-full bg-urban-bg border border-red-200
                            flex items-center justify-center">
              <span className="text-urban font-bold">!</span>
            </div>
            <div className="text-center">
              <p className="font-display font-bold text-[13px] text-urban">
                Classification failed
              </p>
              <p className="font-mono text-[9px] text-sub mt-1">
                Check sidebar · Try force refresh
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}