import { useState, useCallback } from 'react'
import { fetchTimeseries } from '@/lib/api'

export interface TimeseriesPoint {
  year: number
  Forest: number
  Cropland: number
  Urban: number
  Water: number
  Bare: number
}

export function useTimeseries() {
  const [data,    setData]    = useState<TimeseriesPoint[] | null>(null)
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState<string | null>(null)

  const load = useCallback(async (aoiKey: string, startYear = 2000, endYear = 2024) => {
    setLoading(true); setError(null)
    try {
      const res = await fetchTimeseries(aoiKey, startYear, endYear)
      setData(res.series)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed')
    } finally {
      setLoading(false)
    }
  }, [])

  return { data, loading, error, load }
}