import { useState, useCallback, useRef } from 'react'
import { startExport, pollExport } from '@/lib/api'

type ExportStatus = 'idle' | 'submitting' | 'SUBMITTED' | 'RUNNING' | 'COMPLETED' | 'FAILED'

export function useExport() {
  const [status,  setStatus]  = useState<ExportStatus>('idle')
  const [taskId,  setTaskId]  = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const trigger = useCallback(async (aoiKey: string, year: number) => {
    setStatus('submitting')
    setMessage(null)
    try {
      const res = await startExport(aoiKey, year)
      setTaskId(res.taskId)
      setStatus('SUBMITTED')
      setMessage(res.message)

      // Poll every 12s
      pollRef.current = setInterval(async () => {
        try {
          const task = await pollExport(res.taskId)
          setStatus(task.status)
          if (task.status === 'COMPLETED') {
            setMessage('Export complete — check Google Drive → LULC_Nigeria_Exports')
            clearInterval(pollRef.current!)
          }
          if (task.status === 'FAILED') {
            setMessage(`Export failed: ${task.error || 'unknown error'}`)
            clearInterval(pollRef.current!)
          }
        } catch (_) {}
      }, 12000)
    } catch (e: unknown) {
      setStatus('FAILED')
      setMessage(e instanceof Error ? e.message : 'Export failed')
    }
  }, [])

  const reset = useCallback(() => {
    if (pollRef.current) clearInterval(pollRef.current)
    setStatus('idle'); setTaskId(null); setMessage(null)
  }, [])

  return { status, taskId, message, trigger, reset }
}