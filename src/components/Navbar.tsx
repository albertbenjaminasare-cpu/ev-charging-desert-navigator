import React from 'react';
import { Zap, AlertTriangle, Radio, Settings, MapPin, Compass } from 'lucide-react';
import { AwsLocationConfig } from '../services/awsLocation';

interface NavbarProps {
  totalStations: number;
  dcFastCount: number;
  criticalGapsCount: number;
  simulatedCount: number;
  isSimulateMode: boolean;
  onToggleSimulateMode: () => void;
  awsConfig: AwsLocationConfig;
  onUpdateAwsConfig: (config: AwsLocationConfig) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  totalStations,
  dcFastCount,
  criticalGapsCount,
  simulatedCount,
  isSimulateMode,
  onToggleSimulateMode,
  awsConfig,
  onUpdateAwsConfig
}) => {
  const [showConfigModal, setShowConfigModal] = React.useState(false);
  const [localConfig, setLocalConfig] = React.useState(awsConfig);

  const handleSaveConfig = () => {
    onUpdateAwsConfig(localConfig);
    setShowConfigModal(false);
  };

  return (
    <>
      <header className="h-16 bg-[#0F172A]/90 backdrop-blur-md border-b border-slate-800/80 px-4 md:px-6 flex items-center justify-between z-20 shrink-0">
        {/* Brand / Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-500 flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <Zap className="w-6 h-6 text-white fill-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-extrabold text-lg text-white tracking-tight flex items-center gap-1.5">
                EV Pulse
                <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 font-semibold border border-cyan-500/30">
                  Desert & Corridor Navigator
                </span>
              </h1>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              Built with Amazon Location Service & NREL Open Data for AWS Challenge: Map it
            </p>
          </div>
        </div>

        {/* Live Metrics */}
        <div className="hidden lg:flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/60 border border-slate-700/60 text-xs">
            <MapPin className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-slate-400">Stations:</span>
            <span className="font-bold text-white">{totalStations}</span>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/60 border border-slate-700/60 text-xs">
            <Zap className="w-3.5 h-3.5 text-blue-400" />
            <span className="text-slate-400">DC Fast:</span>
            <span className="font-bold text-white">{dcFastCount}</span>
          </div>

          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs ${
            criticalGapsCount > 0
              ? 'bg-rose-500/10 border-rose-500/30 text-rose-300'
              : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
          }`}>
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Desert Gaps:</span>
            <span className="font-bold">{criticalGapsCount}</span>
          </div>

          {simulatedCount > 0 && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-400">
              <Radio className="w-3.5 h-3.5 animate-pulse" />
              <span>Simulated:</span>
              <span className="font-bold">{simulatedCount}</span>
            </div>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={onToggleSimulateMode}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm ${
              isSimulateMode
                ? 'bg-emerald-500 text-slate-950 font-bold shadow-emerald-500/25 ring-2 ring-emerald-400'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
            }`}
          >
            <Radio className={`w-3.5 h-3.5 ${isSimulateMode ? 'animate-spin' : ''}`} />
            <span>{isSimulateMode ? '⚡ Placing Charger...' : '+ Place Charger'}</span>
          </button>

          <button
            onClick={() => setShowConfigModal(true)}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors"
            title="Amazon Location Service Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* AWS Settings Modal */}
      {showConfigModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md p-6 shadow-2xl text-slate-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Compass className="w-5 h-5 text-cyan-400" />
                <h3 className="font-bold text-white text-base">Amazon Location Service Config</h3>
              </div>
              <button
                onClick={() => setShowConfigModal(false)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-400 mb-4">
              EV Pulse uses high-resolution vector maps compatible with Amazon Location Service. Enter your AWS API Key to render directly through your AWS account:
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Amazon Location API Key (Optional)
                </label>
                <input
                  type="text"
                  placeholder="v1.public.ey..."
                  value={localConfig.apiKey}
                  onChange={(e) => setLocalConfig({ ...localConfig, apiKey: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">AWS Region</label>
                  <input
                    type="text"
                    value={localConfig.region}
                    onChange={(e) => setLocalConfig({ ...localConfig, region: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Map Name</label>
                  <input
                    type="text"
                    value={localConfig.mapName}
                    onChange={(e) => setLocalConfig({ ...localConfig, mapName: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="useCustomAws"
                  checked={localConfig.useCustomAws}
                  onChange={(e) => setLocalConfig({ ...localConfig, useCustomAws: e.target.checked })}
                  className="rounded bg-slate-800 border-slate-700 text-cyan-500 focus:ring-0"
                />
                <label htmlFor="useCustomAws" className="text-xs text-slate-300">
                  Use custom AWS Amazon Location Service endpoint
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => setShowConfigModal(false)}
                className="px-3 py-1.5 rounded-lg text-xs bg-slate-800 hover:bg-slate-700 text-slate-300"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveConfig}
                className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-cyan-600 hover:bg-cyan-500 text-white shadow-lg shadow-cyan-600/30"
              >
                Save Settings
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
