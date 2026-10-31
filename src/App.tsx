import React, { useState, useMemo } from 'react';
import { Navbar } from './components/Navbar';
import { ControlSidebar } from './components/ControlSidebar';
import { MapViewer } from './components/MapViewer';
import { StationModal } from './components/StationModal';
import {
  Station,
  FilterState,
  CorridorPreset
} from './types';
import rawStations from './data/stations.json';
import {
  CORRIDOR_PRESETS,
  DEFAULT_AWS_CONFIG,
  AwsLocationConfig
} from './services/awsLocation';
import { analyzeCorridor } from './utils/geoAnalysis';

export const App: React.FC = () => {
  const [initialStations] = useState<Station[]>(rawStations as Station[]);
  const [simulatedStations, setSimulatedStations] = useState<Station[]>([]);
  const [selectedCorridor, setSelectedCorridor] = useState<CorridorPreset>(CORRIDOR_PRESETS[0]);
  const [selectedStation, setSelectedStation] = useState<Station | null>(null);
  const [isSimulateMode, setIsSimulateMode] = useState<boolean>(false);
  const [awsConfig, setAwsConfig] = useState<AwsLocationConfig>(DEFAULT_AWS_CONFIG);
  const [focusTarget, setFocusTarget] = useState<{ coords: [number, number]; zoom?: number } | null>(null);

  const [filters, setFilters] = useState<FilterState>({
    powerType: 'all',
    minKw: 50,
    connectors: [],
    networks: [],
    bufferRadiusMiles: 25,
    showBuffers: true,
    showDesertsOnly: false,
    clusterMarkers: true
  });

  // Combine initial dataset with user simulated stations
  const allStations = useMemo(() => {
    return [...initialStations, ...simulatedStations];
  }, [initialStations, simulatedStations]);

  // Run dynamic corridor gap analysis
  const analysisResult = useMemo(() => {
    return analyzeCorridor(selectedCorridor, allStations, 38);
  }, [selectedCorridor, allStations]);

  // Handle Placing Simulated Station on Map
  const handlePlaceStation = (coords: [number, number]) => {
    const newStation: Station = {
      id: `sim-${Date.now()}`,
      name: `Simulated 350kW Hub #${simulatedStations.length + 1}`,
      network: 'Simulated',
      coordinates: coords,
      address: 'Simulated Highway Location',
      city: 'Desert Corridor',
      state: selectedCorridor.interstate,
      power_type: 'dc_fast',
      kw_output: 350,
      ports_count: 8,
      connectors: ['NACS', 'CCS'],
      pricing: '$0.39/kWh',
      amenities: ['Solar Canopy', 'Restrooms', 'Convenience Store'],
      status: 'Simulated',
      is_simulated: true
    };

    setSimulatedStations(prev => [...prev, newStation]);
    setIsSimulateMode(false);
    setSelectedStation(newStation);
  };

  const handleRemoveSimulated = (id: string) => {
    setSimulatedStations(prev => prev.filter(s => s.id !== id));
    if (selectedStation?.id === id) {
      setSelectedStation(null);
    }
  };

  const handleClearAllSimulated = () => {
    setSimulatedStations([]);
    if (selectedStation?.is_simulated) {
      setSelectedStation(null);
    }
  };

  const handleSelectCorridor = (corridor: CorridorPreset) => {
    setSelectedCorridor(corridor);
    // Center map on corridor midpoint
    const midIdx = Math.floor(corridor.waypoints.length / 2);
    setFocusTarget({ coords: corridor.waypoints[midIdx], zoom: 7 });
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-[#0B0F19] overflow-hidden select-none">
      {/* Top Header */}
      <Navbar
        totalStations={allStations.length}
        dcFastCount={allStations.filter(s => s.power_type === 'dc_fast').length}
        criticalGapsCount={analysisResult.criticalGapsCount}
        simulatedCount={simulatedStations.length}
        isSimulateMode={isSimulateMode}
        onToggleSimulateMode={() => setIsSimulateMode(!isSimulateMode)}
        awsConfig={awsConfig}
        onUpdateAwsConfig={setAwsConfig}
      />

      {/* Main Workspace */}
      <div className="flex flex-1 overflow-hidden relative">
        <ControlSidebar
          selectedCorridor={selectedCorridor}
          onSelectCorridor={handleSelectCorridor}
          analysis={analysisResult}
          filters={filters}
          onUpdateFilters={setFilters}
          simulatedStations={simulatedStations}
          onRemoveSimulatedStation={handleRemoveSimulated}
          onClearAllSimulated={handleClearAllSimulated}
          isSimulateMode={isSimulateMode}
          onToggleSimulateMode={() => setIsSimulateMode(!isSimulateMode)}
          onFocusCoordinates={(coords, zoom) => setFocusTarget({ coords, zoom })}
        />

        <MapViewer
          stations={allStations}
          corridor={selectedCorridor}
          analysis={analysisResult}
          filters={filters}
          awsConfig={awsConfig}
          isSimulateMode={isSimulateMode}
          onMapClickPlaceStation={handlePlaceStation}
          onSelectStation={setSelectedStation}
          focusTarget={focusTarget}
        />
      </div>

      {/* Station Details Modal */}
      <StationModal
        station={selectedStation}
        onClose={() => setSelectedStation(null)}
        onDeleteSimulated={handleRemoveSimulated}
      />
    </div>
  );
};

export default App;
