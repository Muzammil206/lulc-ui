import { useClassification } from '@/hooks/useClassification'
import TopBar    from '@/components/ui/TopBar'
import Sidebar   from '@/components/sidebar/Sidebar'
import MapView   from '@/components/map/MapView'
import StatsPanel from '@/components/stats/StatsPanel'

export default function App() {
  const {
    aoiList, aoiKey, year1, year2,
    result, status, error, elapsed,
    setAoiKey, setYear1, setYear2, classify,
  } = useClassification()

  return (
    <div className="flex flex-col h-full overflow-hidden bg-canvas">
      <TopBar status={status} result={result} elapsed={elapsed} />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          aoiList={aoiList} aoiKey={aoiKey} year1={year1} year2={year2}
          status={status} error={error}
          onAoiChange={setAoiKey}
          onYear1Change={setYear1}
          onYear2Change={setYear2}
          onGenerate={() => classify(false)}
          onRefresh={() => classify(true)}
        />

        <div className="flex flex-col flex-1 overflow-hidden">
          <div className="flex-1 relative overflow-hidden">
            <MapView result={result} status={status} year1={year1} year2={year2} />
          </div>
          <StatsPanel result={result} status={status} />
        </div>
      </div>
    </div>
  )
}
