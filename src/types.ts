export type PowerType = 'dc_fast' | 'level2';
export type ConnectorType = 'NACS' | 'CCS' | 'CHAdeMO' | 'J1772';
export type NetworkType = 'Tesla' | 'Electrify America' | 'EVgo' | 'ChargePoint' | 'Simulated' | string;

export interface Station {
  id: string;
  name: string;
  network: NetworkType;
  coordinates: [number, number]; // [lng, lat]
  address: string;
  city: string;
  state: string;
  power_type: PowerType;
  kw_output: number;
  ports_count: number;
  connectors: ConnectorType[];
  pricing: string;
  amenities: string[];
  status: 'Operational' | 'Simulated';
  is_simulated?: boolean;
}

export interface FilterState {
  powerType: 'all' | 'dc_fast' | 'level2';
  minKw: number;
  connectors: ConnectorType[];
  networks: string[];
  bufferRadiusMiles: number;
  showBuffers: boolean;
  showDesertsOnly: boolean;
  clusterMarkers: boolean;
}

export interface CorridorPreset {
  id: string;
  name: string;
  interstate: string;
  origin: { name: string; coordinates: [number, number] };
  destination: { name: string; coordinates: [number, number] };
  description: string;
  distanceMiles: number;
  waypoints: [number, number][];
}

export interface GapSegment {
  id: string;
  startPoint: [number, number];
  endPoint: [number, number];
  lengthMiles: number;
  nearestStationDistanceMiles: number;
  severity: 'critical' | 'warning' | 'moderate';
  warningMessage: string;
}

export interface CorridorAnalysisResult {
  corridorName: string;
  totalDistanceMiles: number;
  stationsAlongRoute: number;
  dcFastCount: number;
  criticalGapsCount: number;
  longestGapMiles: number;
  gapSegments: GapSegment[];
  routeGeoJSON: any;
}
