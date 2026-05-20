import { useState, useCallback, useEffect } from 'react'
import { fetchClassification, fetchAOIList } from '@/lib/api'
import type { ClassifyResponse, AOIListResponse, AppStatus } from '@/types'

export function useClassification() {
  const [aoiList, setAoiList] = useState<AOIListResponse | null>(null)
  const [aoiKey,  setAoiKey]  = useState('ogidi-ilorin-west')
  const [year1,   setYear1]   = useState(2015)
  const [year2,   setYear2]   = useState(2024)
  const [result,  setResult]  = useState<ClassifyResponse | null>(null)
  const [status,  setStatus]  = useState<AppStatus>('idle')
  const [error,   setError]   = useState<string | null>(null)
  const [elapsed, setElapsed] = useState<number | null>(null)

  useEffect(() => { fetchAOIList().then(setAoiList).catch(() => {}) }, [])

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

  return { aoiList, aoiKey, year1, year2, result, status, error, elapsed,
           setAoiKey, setYear1, setYear2, classify }
}
