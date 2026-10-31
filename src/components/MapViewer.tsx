import React, { useEffect, useRef } from 'react';
import maplibregl, { Map, NavigationControl, FullscreenControl, Marker } from 'maplibre-gl';
import { Station, CorridorPreset, FilterState, CorridorAnalysisResult } from '../types';
import { AwsLocationConfig, getMapStyleUrl } from '../services/awsLocation';
import { calculateCoverageGeoJSON, buildGapLinesGeoJSON } from '../utils/geoAnalysis';

interface MapViewerProps {
  stations: Station[];
  corridor: CorridorPreset;
  analysis: CorridorAnalysisResult;
  filters: FilterState;
  awsConfig: AwsLocationConfig;
  isSimulateMode: boolean;
  onMapClickPlaceStation: (coords: [number, number]) => void;
  onSelectStation: (station: Station) => void;
  focusTarget: { coords: [number, number]; zoom?: number } | null;
}

export const MapViewer: React.FC<MapViewerProps> = ({
  stations,
  corridor,
  analysis,
  filters,
  awsConfig,
  isSimulateMode,
  onMapClickPlaceStation,
  onSelectStation,
  focusTarget
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<Map | null>(null);
  const markersRef = useRef<Marker[]>([]);

  // Initialize Map
  useEffect(() => {
    if (!mapContainer.current) return;

    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: getMapStyleUrl(awsConfig),
      center: [-116.5, 35.5], // Centered between California / Nevada Desert Corridors
      zoom: 6.5,
      pitch: 35,
      bearing: -10
    });

    map.addControl(new NavigationControl({ visualizePitch: true }), 'top-right');
    map.addControl(new FullscreenControl(), 'top-right');

    map.on('load', () => {
      // 1. Coverage Buffers Source & Layers
      map.addSource('coverage-buffers', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] }
      });

      map.addLayer({
        id: 'coverage-buffers-fill',
        type: 'fill',
        source: 'coverage-buffers',
        paint: {
          'fill-color': [
            'case',
            ['boolean', ['get', 'isSimulated'], false],
            '#10B981', // Neon green for simulated
            ['==', ['get', 'powerType'], 'dc_fast'],
            '#06B6D4', // Cyan for DC Fast
            '#F59E0B'  // Amber for Level 2
          ],
          'fill-opacity': 0.16
        }
      });

      map.addLayer({
        id: 'coverage-buffers-stroke',
        type: 'line',
        source: 'coverage-buffers',
        paint: {
          'line-color': [
            'case',
            ['boolean', ['get', 'isSimulated'], false],
            '#10B981',
            ['==', ['get', 'powerType'], 'dc_fast'],
            '#06B6D4',
            '#F59E0B'
          ],
          'line-width': 1.5,
          'line-opacity': 0.5
        }
      });

      // 2. Corridor Route Source & Layers
      map.addSource('corridor-route', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] }
      });

      map.addLayer({
        id: 'corridor-route-glow',
        type: 'line',
        source: 'corridor-route',
        paint: {
          'line-color': '#3B82F6',
          'line-width': 8,
          'line-opacity': 0.3
        }
      });

      map.addLayer({
        id: 'corridor-route-main',
        type: 'line',
        source: 'corridor-route',
        paint: {
          'line-color': '#60A5FA',
          'line-width': 4,
          'line-opacity': 0.9
        }
      });

      // 3. Flagged Corridor Desert Gaps Source & Layer
      map.addSource('corridor-gaps', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] }
      });

      map.addLayer({
        id: 'corridor-gaps-pulse',
        type: 'line',
        source: 'corridor-gaps',
        paint: {
          'line-color': '#EF4444',
          'line-width': 9,
          'line-opacity': 0.95,
          'line-dasharray': [2, 2]
        }
      });
    });

    // Map click handler for simulation
    map.on('click', (e) => {
      if (isSimulateMode) {
        onMapClickPlaceStation([e.lngLat.lng, e.lngLat.lat]);
      }
    });

    mapRef.current = map;

    return () => {
      map.remove();
    };
  }, []);

  // Update Map Style if AWS Config changed
  useEffect(() => {
    if (mapRef.current && mapRef.current.isStyleLoaded()) {
      mapRef.current.setStyle(getMapStyleUrl(awsConfig));
    }
  }, [awsConfig]);

  // Update Corridor Route and Gaps GeoJSON
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;

    // Update Route
    const routeSource = map.getSource('corridor-route') as maplibregl.GeoJSONSource;
    if (routeSource && analysis.routeGeoJSON) {
      routeSource.setData({
        type: 'FeatureCollection',
        features: [analysis.routeGeoJSON]
      });
    }

    // Update Flagged Gaps
    const gapsSource = map.getSource('corridor-gaps') as maplibregl.GeoJSONSource;
    if (gapsSource) {
      const gapsGeoJSON = buildGapLinesGeoJSON(analysis.gapSegments, corridor);
      gapsSource.setData(gapsGeoJSON);
    }

    // Update Buffers
    const bufferSource = map.getSource('coverage-buffers') as maplibregl.GeoJSONSource;
    if (bufferSource) {
      if (filters.showBuffers) {
        const buffersGeoJSON = calculateCoverageGeoJSON(stations, filters.bufferRadiusMiles);
        bufferSource.setData(buffersGeoJSON);
      } else {
        bufferSource.setData({ type: 'FeatureCollection', features: [] });
      }
    }
  }, [stations, corridor, analysis, filters.showBuffers, filters.bufferRadiusMiles]);

  // Update Markers
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Clear existing markers
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    // Filter stations based on user filters
    const filteredStations = stations.filter(st => {
      if (filters.powerType !== 'all' && st.power_type !== filters.powerType && !st.is_simulated) {
        return false;
      }
      if (filters.networks.length > 0 && !filters.networks.includes(st.network) && !st.is_simulated) {
        return false;
      }
      if (filters.connectors.length > 0) {
        const matchesConnector = st.connectors.some(c => filters.connectors.includes(c));
        if (!matchesConnector && !st.is_simulated) return false;
      }
      return true;
    });

    // Render Markers
    filteredStations.forEach(st => {
      const el = document.createElement('div');
      el.className = 'cursor-pointer group';

      let bgClass = 'bg-cyan-500 shadow-cyan-500/50';
      let iconSvg = `<svg class="w-3.5 h-3.5 text-white fill-white" viewBox="0 0 24 24"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>`;

      if (st.is_simulated) {
        bgClass = 'bg-emerald-500 shadow-emerald-500/60 ring-4 ring-emerald-400/40 animate-pulse';
        iconSvg = `<svg class="w-3.5 h-3.5 text-slate-950 fill-current font-bold" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>`;
      } else if (st.power_type === 'level2') {
        bgClass = 'bg-amber-500 shadow-amber-500/50';
        iconSvg = `<svg class="w-3.5 h-3.5 text-white fill-white" viewBox="0 0 24 24"><path d="M16 7V3h-2v4h-4V3H8v4a6 6 0 0 0 5 5.91V19h-2v2h6v-2h-2v-6.09A6 6 0 0 0 16 7z"/></svg>`;
      }

      el.innerHTML = `
        <div class="relative flex items-center justify-center">
          <div class="w-7 h-7 rounded-full ${bgClass} flex items-center justify-center shadow-lg transition-transform group-hover:scale-125 border-2 border-slate-900">
            ${iconSvg}
          </div>
          <div class="absolute -bottom-1 w-2 h-2 rotate-45 bg-slate-900"></div>
        </div>
      `;

      el.addEventListener('click', (e) => {
        e.stopPropagation();
        onSelectStation(st);
      });

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat(st.coordinates)
        .addTo(map);

      markersRef.current.push(marker);
    });
  }, [stations, filters]);

  // Handle programmatic focus (zoom to corridor or gap)
  useEffect(() => {
    if (focusTarget && mapRef.current) {
      mapRef.current.flyTo({
        center: focusTarget.coords,
        zoom: focusTarget.zoom || 9,
        duration: 1500,
        essential: true
      });
    }
  }, [focusTarget]);

  return (
    <div className="relative flex-1 h-[calc(100vh-4rem)] bg-slate-950">
      <div ref={mapContainer} className="w-full h-full" />

      {/* Placement Mode Banner */}
      {isSimulateMode && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 px-4 py-2 rounded-full bg-emerald-500 text-slate-950 text-xs font-bold shadow-xl shadow-emerald-500/25 flex items-center gap-2 animate-bounce">
          <span>⚡ Click anywhere on the map to place a 350kW Fast Charger!</span>
        </div>
      )}

      {/* Map Legend */}
      <div className="absolute bottom-6 right-6 z-10 p-3 rounded-2xl bg-slate-900/90 backdrop-blur-md border border-slate-800 text-[11px] space-y-2 shadow-2xl">
        <div className="font-bold text-white text-xs mb-1">Map Layer Legend</div>
        <div className="flex items-center gap-2 text-slate-300">
          <span className="w-3 h-3 rounded-full bg-cyan-400 border border-slate-900 shadow-sm" />
          <span>DC Fast Charger (150-350kW)</span>
        </div>
        <div className="flex items-center gap-2 text-slate-300">
          <span className="w-3 h-3 rounded-full bg-amber-400 border border-slate-900 shadow-sm" />
          <span>Level 2 AC Station (19kW)</span>
        </div>
        <div className="flex items-center gap-2 text-slate-300">
          <span className="w-3 h-3 rounded-full bg-emerald-400 border border-slate-900 shadow-sm animate-pulse" />
          <span>Simulated Station</span>
        </div>
        <div className="flex items-center gap-2 text-slate-300">
          <span className="w-4 h-1.5 bg-rose-500 rounded border border-rose-400" />
          <span className="text-rose-400 font-semibold">Critical Desert Gap (&gt;38 mi)</span>
        </div>
        <div className="flex items-center gap-2 text-slate-300">
          <span className="w-3 h-3 rounded-full bg-cyan-500/20 border border-cyan-500/50" />
          <span>Coverage Reachability Buffer</span>
        </div>
      </div>
    </div>
  );
};
