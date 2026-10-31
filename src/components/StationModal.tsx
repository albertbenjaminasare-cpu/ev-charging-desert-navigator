import React from 'react';
import { Zap, MapPin, X, Trash2, BatteryCharging, DollarSign } from 'lucide-react';
import { Station } from '../types';

interface StationModalProps {
  station: Station | null;
  onClose: () => void;
  onDeleteSimulated?: (id: string) => void;
}

export const StationModal: React.FC<StationModalProps> = ({
  station,
  onClose,
  onDeleteSimulated
}) => {
  if (!station) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-t-2xl sm:rounded-2xl w-full max-w-md p-6 shadow-2xl text-slate-200 space-y-4 max-h-[85vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                station.is_simulated
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                  : station.power_type === 'dc_fast'
                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40'
                  : 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
              }`}>
                {station.is_simulated ? 'Simulated Hub' : station.network}
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                {station.power_type === 'dc_fast' ? 'Level 3 DC Fast' : 'Level 2 AC'}
              </span>
            </div>
            <h2 className="font-extrabold text-white text-lg tracking-tight">
              {station.name}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Location */}
        <div className="flex items-center gap-2 text-xs text-slate-300">
          <MapPin className="w-4 h-4 text-cyan-400 shrink-0" />
          <span>{station.address}, {station.city}, {station.state}</span>
        </div>

        {/* Power & Ports Cards */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-800 space-y-1">
            <div className="text-[10px] text-slate-400 flex items-center gap-1">
              <Zap className="w-3 h-3 text-cyan-400" />
              Peak Charging Speed
            </div>
            <div className="text-lg font-extrabold text-white">
              {station.kw_output} <span className="text-xs font-normal text-slate-400">kW</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-800 space-y-1">
            <div className="text-[10px] text-slate-400 flex items-center gap-1">
              <BatteryCharging className="w-3 h-3 text-cyan-400" />
              Charging Stalls
            </div>
            <div className="text-lg font-extrabold text-white">
              {station.ports_count} <span className="text-xs font-normal text-slate-400">plugs</span>
            </div>
          </div>
        </div>

        {/* Supported Plugs */}
        <div className="space-y-1.5">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Available Connectors
          </div>
          <div className="flex flex-wrap gap-1.5">
            {station.connectors.map(c => (
              <span
                key={c}
                className="px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-200"
              >
                {c}
              </span>
            ))}
          </div>
        </div>

        {/* Pricing & Amenities */}
        <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-800 space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 flex items-center gap-1">
              <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
              Pricing:
            </span>
            <span className="font-semibold text-white">{station.pricing}</span>
          </div>
          {station.amenities.length > 0 && (
            <div className="flex items-start justify-between">
              <span className="text-slate-400">Amenities:</span>
              <span className="font-semibold text-slate-300 text-right">
                {station.amenities.join(' • ')}
              </span>
            </div>
          )}
        </div>

        {/* Actions */}
        {station.is_simulated && onDeleteSimulated && (
          <button
            onClick={() => {
              onDeleteSimulated(station.id);
              onClose();
            }}
            className="w-full py-2.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 font-semibold text-xs flex items-center justify-center gap-2 border border-rose-500/40 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            <span>Remove Simulated Station</span>
          </button>
        )}
      </div>
    </div>
  );
};
