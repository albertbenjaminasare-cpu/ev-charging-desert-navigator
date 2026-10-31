import React, { useState } from 'react';
import {
  Route,
  Filter,
  Radio,
  Info,
  AlertTriangle,
  ChevronRight,
  ShieldCheck,
  Zap,
  Layers,
  MapPin,
  Trash2,
  ExternalLink
} from 'lucide-react';
import {
  CorridorPreset,
  CorridorAnalysisResult,
  FilterState,
  Station,
  ConnectorType
} from '../types';
import { CORRIDOR_PRESETS } from '../services/awsLocation';

interface ControlSidebarProps {
  selectedCorridor: CorridorPreset;
  onSelectCorridor: (corridor: CorridorPreset) => void;
  analysis: CorridorAnalysisResult;
  filters: FilterState;
  onUpdateFilters: (filters: FilterState) => void;
  simulatedStations: Station[];
  onRemoveSimulatedStation: (id: string) => void;
  onClearAllSimulated: () => void;
  isSimulateMode: boolean;
  onToggleSimulateMode: () => void;
  onFocusCoordinates: (coords: [number, number], zoom?: number) => void;
}

export const ControlSidebar: React.FC<ControlSidebarProps> = ({
  selectedCorridor,
  onSelectCorridor,
  analysis,
  filters,
  onUpdateFilters,
  simulatedStations,
  onRemoveSimulatedStation,
  onClearAllSimulated,
  isSimulateMode,
  onToggleSimulateMode,
  onFocusCoordinates
}) => {
  const [activeTab, setActiveTab] = useState<'corridor' | 'filters' | 'simulate' | 'aws'>('corridor');

  const connectorOptions: ConnectorType[] = ['NACS', 'CCS', 'CHAdeMO', 'J1772'];
  const networkOptions = ['Tesla', 'Electrify America', 'EVgo', 'ChargePoint'];

  const toggleConnector = (conn: ConnectorType) => {
    const next = filters.connectors.includes(conn)
      ? filters.connectors.filter(c => c !== conn)
      : [...filters.connectors, conn];
    onUpdateFilters({ ...filters, connectors: next });
  };

  const toggleNetwork = (net: string) => {
    const next = filters.networks.includes(net)
      ? filters.networks.filter(n => n !== net)
      : [...filters.networks, net];
    onUpdateFilters({ ...filters, networks: next });
  };

  return (
    <aside className="w-full md:w-96 bg-[#0F172A]/95 border-r border-slate-800 flex flex-col h-[calc(100vh-4rem)] z-10 shrink-0 backdrop-blur-md">
      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-800 bg-slate-900/60 p-1 gap-1 shrink-0">
        <button
          onClick={() => setActiveTab('corridor')}
          className={`flex-1 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
            activeTab === 'corridor'
              ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Route className="w-3.5 h-3.5" />
          <span>Corridors</span>
        </button>

        <button
          onClick={() => setActiveTab('filters')}
          className={`flex-1 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
            activeTab === 'filters'
              ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Filter className="w-3.5 h-3.5" />
          <span>Filters</span>
        </button>

        <button
          onClick={() => setActiveTab('simulate')}
          className={`flex-1 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors relative ${
            activeTab === 'simulate'
              ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Radio className="w-3.5 h-3.5" />
          <span>Sandbox</span>
          {simulatedStations.length > 0 && (
            <span className="w-2 h-2 rounded-full bg-emerald-400 absolute top-1.5 right-1.5" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('aws')}
          className={`flex-1 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
            activeTab === 'aws'
              ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Info className="w-3.5 h-3.5" />
          <span>AWS Tech</span>
        </button>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* ================= CORRIDOR TAB ================= */}
        {activeTab === 'corridor' && (
          <div className="space-y-4">
            <div>
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                Select US Interstate Corridor
              </label>
              <div className="space-y-2">
                {CORRIDOR_PRESETS.map(corridor => {
                  const isSelected = corridor.id === selectedCorridor.id;
                  return (
                    <button
                      key={corridor.id}
                      onClick={() => onSelectCorridor(corridor)}
                      className={`w-full text-left p-3 rounded-xl border transition-all ${
                        isSelected
                          ? 'bg-gradient-to-r from-cyan-950/40 to-slate-900 border-cyan-500/50 shadow-md shadow-cyan-950/50'
                          : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-xs text-white">{corridor.name}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                          {corridor.distanceMiles} mi
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                        {corridor.description}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Analysis Stats Card */}
            <div className="p-4 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-cyan-400" />
                  Corridor Gap Diagnostic
                </span>
                <span className={`text-[11px] px-2 py-0.5 rounded-full font-semibold border ${
                  analysis.criticalGapsCount > 0
                    ? 'bg-rose-500/15 border-rose-500/30 text-rose-300'
                    : 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
                }`}>
                  {analysis.criticalGapsCount > 0 ? `${analysis.criticalGapsCount} Gap Alert` : 'Continuous Coverage'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-xl bg-slate-800/50 border border-slate-800">
                  <div className="text-[10px] text-slate-400">Stations in Corridor</div>
                  <div className="text-base font-bold text-white mt-0.5">
                    {analysis.stationsAlongRoute} <span className="text-xs font-normal text-slate-400">({analysis.dcFastCount} Fast)</span>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-800/50 border border-slate-800">
                  <div className="text-[10px] text-slate-400">Longest Charging Gap</div>
                  <div className={`text-base font-bold mt-0.5 ${analysis.longestGapMiles > 50 ? 'text-rose-400' : 'text-emerald-400'}`}>
                    {analysis.longestGapMiles} <span className="text-xs font-normal text-slate-400">miles</span>
                  </div>
                </div>
              </div>

              {/* Detected Gaps List */}
              {analysis.gapSegments.length > 0 ? (
                <div className="space-y-2 pt-1">
                  <div className="text-[11px] font-bold text-rose-400 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    Detected Desert Segments (&gt;38 mi from Fast Charger)
                  </div>
                  {analysis.gapSegments.map(gap => (
                    <div
                      key={gap.id}
                      className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/25 text-xs space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-rose-300">
                          {gap.lengthMiles} Mile Dead Zone
                        </span>
                        <button
                          onClick={() => onFocusCoordinates(gap.startPoint, 9)}
                          className="text-[10px] px-2 py-0.5 rounded bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 flex items-center gap-1 transition-colors"
                        >
                          <span>Zoom to Gap</span>
                          <ChevronRight className="w-3 h-3" />
                        </button>
                      </div>
                      <p className="text-[11px] text-slate-300 leading-snug">
                        {gap.warningMessage}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-xs text-emerald-300 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 shrink-0" />
                  <span>No critical gaps detected! Full charging continuity maintained.</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ================= FILTERS TAB ================= */}
        {activeTab === 'filters' && (
          <div className="space-y-5">
            {/* Reachability Buffer / Desert View */}
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-cyan-400" />
                  <span className="text-xs font-bold text-white">Coverage Footprint Buffers</span>
                </div>
                <input
                  type="checkbox"
                  checked={filters.showBuffers}
                  onChange={(e) => onUpdateFilters({ ...filters, showBuffers: e.target.checked })}
                  className="rounded bg-slate-800 border-slate-700 text-cyan-500 focus:ring-0"
                />
              </div>

              {filters.showBuffers && (
                <div className="space-y-2 pt-1">
                  <div className="flex justify-between text-xs text-slate-300">
                    <span>Reachability Radius:</span>
                    <span className="font-bold text-cyan-400">{filters.bufferRadiusMiles} miles</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="50"
                    step="5"
                    value={filters.bufferRadiusMiles}
                    onChange={(e) => onUpdateFilters({ ...filters, bufferRadiusMiles: Number(e.target.value) })}
                    className="w-full accent-cyan-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                    <span>10 mi (Urban)</span>
                    <span>25 mi (Suburban)</span>
                    <span>50 mi (Max Reach)</span>
                  </div>
                  <p className="text-[11px] text-slate-400 italic">
                    Unshaded space outside these circular buffers highlights literal "Charging Deserts".
                  </p>
                </div>
              )}
            </div>

            {/* Power Type */}
            <div>
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                Charging Speed
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {(['all', 'dc_fast', 'level2'] as const).map(type => (
                  <button
                    key={type}
                    onClick={() => onUpdateFilters({ ...filters, powerType: type })}
                    className={`py-2 rounded-lg text-xs font-semibold capitalize transition-colors ${
                      filters.powerType === type
                        ? 'bg-cyan-500 text-slate-950 font-bold'
                        : 'bg-slate-900 border border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    {type === 'all' ? 'All Speeds' : type === 'dc_fast' ? '⚡ DC Fast' : 'Level 2'}
                  </button>
                ))}
              </div>
            </div>

            {/* Connector Types */}
            <div>
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                Connector Standard
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {connectorOptions.map(conn => {
                  const active = filters.connectors.includes(conn);
                  return (
                    <button
                      key={conn}
                      onClick={() => toggleConnector(conn)}
                      className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-between transition-colors ${
                        active
                          ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-300'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <span>{conn}</span>
                      <span className="text-[10px] font-mono">{active ? '✓' : '+'}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Networks */}
            <div>
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                Charging Network
              </label>
              <div className="space-y-1.5">
                {networkOptions.map(net => {
                  const active = filters.networks.includes(net);
                  return (
                    <button
                      key={net}
                      onClick={() => toggleNetwork(net)}
                      className={`w-full p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-between transition-colors ${
                        active
                          ? 'bg-slate-800 border-slate-600 text-white'
                          : 'bg-slate-900/60 border-slate-800 text-slate-500'
                      }`}
                    >
                      <span>{net}</span>
                      <span className="text-[10px] font-mono">{active ? 'Active' : 'Muted'}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ================= SIMULATE TAB ================= */}
        {activeTab === 'simulate' && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-950/40 to-slate-900 border border-emerald-500/30 space-y-3">
              <div className="flex items-center gap-2">
                <Radio className="w-5 h-5 text-emerald-400 animate-pulse" />
                <h3 className="font-bold text-white text-xs">Simulate Station Placement</h3>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Test infrastructure planning: Click anywhere on the map to place a hypothetical 350kW Ultra-Fast station and see the dead zone gap close in real time.
              </p>

              <button
                onClick={onToggleSimulateMode}
                className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all shadow-lg flex items-center justify-center gap-2 ${
                  isSimulateMode
                    ? 'bg-emerald-500 text-slate-950 shadow-emerald-500/30 ring-2 ring-emerald-300'
                    : 'bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-emerald-500/30'
                }`}
              >
                <span>{isSimulateMode ? '⚡ Click Map to Drop Charger' : 'Activate Placement Tool'}</span>
              </button>
            </div>

            {/* List of Simulated Stations */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Simulated Hubs ({simulatedStations.length})
                </span>
                {simulatedStations.length > 0 && (
                  <button
                    onClick={onClearAllSimulated}
                    className="text-[11px] text-rose-400 hover:text-rose-300 flex items-center gap-1"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Clear All</span>
                  </button>
                )}
              </div>

              {simulatedStations.length === 0 ? (
                <div className="p-6 text-center rounded-2xl bg-slate-900 border border-dashed border-slate-800 text-slate-500 text-xs">
                  No simulated stations yet. Click "+ Place Charger" above to drop your first hub.
                </div>
              ) : (
                simulatedStations.map(station => (
                  <div
                    key={station.id}
                    className="p-3 rounded-xl bg-slate-900 border border-emerald-500/30 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-semibold text-emerald-300 flex items-center gap-1.5">
                        <Zap className="w-3.5 h-3.5 text-emerald-400" />
                        {station.name}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                        [{station.coordinates[0].toFixed(3)}, {station.coordinates[1].toFixed(3)}] • 350kW
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => onFocusCoordinates(station.coordinates, 10)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                        title="Zoom to station"
                      >
                        <MapPin className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onRemoveSimulatedStation(station.id)}
                        className="p-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300"
                        title="Delete simulated station"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ================= AWS TECH TAB ================= */}
        {activeTab === 'aws' && (
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
                AWS Architecture & Services
              </h3>
              <p className="text-slate-300 leading-relaxed text-[11px]">
                This application fulfills the AWS Builder Center "Map it" weekend challenge criteria by combining AWS Location & Data services with spatial algorithms:
              </p>

              <div className="space-y-2 pt-1">
                <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-800 space-y-1">
                  <div className="font-semibold text-cyan-400">1. Amazon Location Service (Maps)</div>
                  <div className="text-[11px] text-slate-300">
                    Provides global vector basemap rendering through MapLibre GL JS with custom dark theme contrast.
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-800 space-y-1">
                  <div className="font-semibold text-cyan-400">2. Amazon Location Service (Routes)</div>
                  <div className="text-[11px] text-slate-300">
                    Calculates highway route geometry across interstates to identify unserved gap corridors.
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-800 space-y-1">
                  <div className="font-semibold text-cyan-400">3. Amazon S3 & CloudFront</div>
                  <div className="text-[11px] text-slate-300">
                    Hosts the static client app bundle and high-density station GeoJSON cache.
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-800 space-y-1">
                  <div className="font-semibold text-cyan-400">4. Open Data on AWS (NREL AFDC)</div>
                  <div className="text-[11px] text-slate-300">
                    Open dataset of electric vehicle charging infrastructure from the US Department of Energy.
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
              <h4 className="font-bold text-white text-xs">Judging Criteria Alignment</h4>
              <ul className="space-y-1.5 text-[11px] text-slate-300">
                <li><b className="text-cyan-400">Technical Innovation (25%):</b> Dynamic buffer calculus and corridor gap detection using Turf.js.</li>
                <li><b className="text-cyan-400">Craft & Execution (25%):</b> Interactive MapLibre GL viewer with zero latency and clean UI.</li>
                <li><b className="text-cyan-400">Usefulness & Impact (25%):</b> Solves real range anxiety and infrastructure desert planning.</li>
                <li><b className="text-cyan-400">Creativity & Story (25%):</b> Compelling visual journey through America's remote highway passes.</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
