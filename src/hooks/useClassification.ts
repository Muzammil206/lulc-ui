import { useState, useCallback, useEffect } from 'react'
import { fetchClassification, fetchAOIList } from '@/lib/api'
import type { ClassifyResponse, AOIListResponse, AppStatus } from '@/types'

// Read initial state from URL query params (bookmark feature)
function getURLParams() {
  const p = new URLSearchParams(window.location.search)
  return {
    aoiKey: p.get('state')  || 'ogidi-ilorin-west',
    year1:  Number(p.get('y1') || 2015),
    year2:  Number(p.get('y2') || 2024),
  }
}

function setURLParams(aoiKey: string, year1: number, year2: number) {
  const p = new URLSearchParams({ state: aoiKey, y1: String(year1), y2: String(year2) })
  window.history.replaceState({}, '', `?${p.toString()}`)
}

export function useClassification() {
  const init = getURLParams()
  const [aoiList, setAoiList] = useState<AOIListResponse | null>(null)
  const [aoiKey,  setAoiKeyState]  = useState(init.aoiKey)
  const [year1,   setYear1State]   = useState(init.year1)
  const [year2,   setYear2State]   = useState(init.year2)
  const [result,  setResult]  = useState<ClassifyResponse | null>(null)
  const [status,  setStatus]  = useState<AppStatus>('idle')
  const [error,   setError]   = useState<string | null>(null)
  const [elapsed, setElapsed] = useState<number | null>(null)

  useEffect(() => { fetchAOIList().then(setAoiList).catch(() => {}) }, [])

  // Setters that also update the URL
  const setAoiKey = useCallback((k: string) => {
    setAoiKeyState(k)
    setURLParams(k, year1, year2)
  }, [year1, year2])

  const setYear1 = useCallback((y: number) => {
    setYear1State(y)
    setURLParams(aoiKey, y, year2)
  }, [aoiKey, year2])

  const setYear2 = useCallback((y: number) => {
    setYear2State(y)
    setURLParams(aoiKey, year1, y)
  }, [aoiKey, year1])

  const classify = useCallback(async (bust = false) => {
    if (year1 === year2) return
    setStatus('loading'); setError(null)
    const t = Date.now()
    try {
      const d = await fetchClassification(aoiKey, year1, year2, bust)
      setResult(d); setElapsed(Date.now() - t); setStatus('success')
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Unknown error')
      setStatus('error')
    }
  }, [aoiKey, year1, year2])

  // Shareable URL for current state
  const getShareUrl = useCallback(() => {
    const p = new URLSearchParams({ state: aoiKey, y1: String(year1), y2: String(year2) })
    return `${window.location.origin}${window.location.pathname}?${p}`
  }, [aoiKey, year1, year2])

  return {
    aoiList, aoiKey, year1, year2,
    result, status, error, elapsed,
    setAoiKey, setYear1, setYear2,
    classify, getShareUrl,
  }
}