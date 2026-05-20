export interface LULCClass {
  classId: number; name: string; color: string; areaKm2: number; year: number;
}
export interface YearResult {
  year:      number
  urlFormat: string    // full GEE tile URL template (modern SDK)
  mapId:     string    // legacy field, may be empty
  token:     string    // legacy field, may be empty
  stats:     LULCClass[]
}
export interface AOIMeta {
  key: string; label: string; state: string;
  center: { lat: number; lng: number }; bufferM: number;
}
export interface ClassifyResponse {
  aoi: AOIMeta; year1: YearResult; year2: YearResult;
  classes: { id: number; name: string; color: string }[];
  classifier: { type: string; numberOfTrees: number; trainingSource: string; bandsUsed: string[] };
  cached: boolean; durationMs: number; computedAt: string;
}
export interface AOILocation {
  key: string; label: string; state: string;
  center: { lat: number; lng: number }; bufferM: number;
}
export interface AOIListResponse {
  locations: AOILocation[]; yearRange: { min: number; max: number }; totalLocations: number;
}
export interface DeltaStat {
  name: string; color: string; bgColor: string;
  areaKm2_y1: number; areaKm2_y2: number;
  deltaKm2: number; deltaPct: number;
}
export type AppStatus = 'idle' | 'loading' | 'success' | 'error'