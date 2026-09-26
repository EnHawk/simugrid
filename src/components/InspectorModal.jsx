// Panel Inspektor & Pengaturan Komponen SimuGrid
// Menampilkan rincian teknis, kontrol saklar on/off, dan opsi penghapusan komponen terpilih

import React from 'react';
import {
  X,
  Trash2,
  Power,
  Zap,
  Info,
  Sliders,
  DollarSign,
  ShieldCheck,
  Battery
} from 'lucide-react';
import { COMPONENT_MAP, COMPONENT_CATEGORIES } from '../data/components';
import { playSound } from '../utils/audio';

export default function InspectorModal({
  selectedItem,
  onClose,
  onToggleItem,
  onRemoveItem,
  simulationState,
  connectedSet,
  ambientTheme
}) {
  if (!selectedItem) return null;

  const comp = COMPONENT_MAP[selectedItem.componentId];
  if (!comp) return null;

  const isConnected = connectedSet?.has(selectedItem.id);
  const isPowered = isConnected && selectedItem.enabled;
  const isLight = Boolean(ambientTheme?.isLight);

  return (
    <div
      className={`fixed sm:absolute inset-x-3 bottom-3 sm:bottom-auto sm:top-20 sm:right-4 sm:left-auto sm:w-80 max-h-[85vh] overflow-y-auto backdrop-blur-xl border rounded-2xl z-40 p-4 select-none animate-inspector-slide shadow-2xl ${
        isLight
          ? 'bg-white/98 border-slate-200 text-slate-900 shadow-xl'
          : 'bg-slate-900/95 border-slate-700/80 text-slate-100 shadow-2xl'
      }`}
    >
      {/* Header Inspektor */}
      <div
        className={`flex items-center justify-between pb-3 border-b ${
          isLight ? 'border-slate-200' : 'border-slate-800'
        }`}
      >
        <div className="flex items-center gap-2">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-sm shadow-2xs"
            style={{
              backgroundColor: `${comp.color}25`,
              color: comp.color,
              border: `1px solid ${comp.color}50`
            }}
          >
            ⚡
          </div>
          <div>
            <h3
              className={`text-xs font-bold leading-tight ${
                isLight ? 'text-slate-900' : 'text-slate-100'
              }`}
            >
              {comp.name}
            </h3>
            <span
              className={`text-[10px] font-mono ${
                isLight ? 'text-slate-500' : 'text-slate-400'
              }`}
            >
              Koordinat ({selectedItem.x}, {selectedItem.y})
            </span>
          </div>
        </div>

        <button
          onClick={onClose}
          className={`p-1 rounded-lg transition-colors ${
            isLight
              ? 'hover:bg-slate-100 text-slate-500 hover:text-slate-800'
              : 'hover:bg-slate-800 text-slate-400 hover:text-slate-200'
          }`}
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Status Jaringan & Daya */}
      <div
        className={`my-3 p-2.5 rounded-xl border flex items-center justify-between text-xs ${
          isLight
            ? 'bg-slate-50 border-slate-200'
            : 'bg-slate-950/80 border-slate-800'
        }`}
      >
        <span className={isLight ? 'text-slate-600' : 'text-slate-400'}>Status Jaringan:</span>
        <span
          className={`font-semibold px-2 py-0.5 rounded text-[11px] ${
            isPowered
              ? isLight
                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                : 'bg-emerald-950 text-emerald-400 border border-emerald-800/80'
              : isLight
              ? 'bg-red-100 text-red-700 border border-red-300'
              : 'bg-red-950 text-red-400 border border-red-800/80'
          }`}
        >
          {isPowered ? '● Beroperasi Aktif' : isConnected ? '○ Nonaktif (Dimatikan)' : '⚠️ Terputus dari Grid'}
        </span>
      </div>

      {/* Detail Spesifikasi Teknis */}
      <div className="space-y-2 text-xs">
        {comp.ratedPowerKW && (
          <div
            className={`flex justify-between p-2 rounded-lg ${
              isLight ? 'bg-slate-100/90 text-slate-700' : 'bg-slate-800/40 text-slate-300'
            }`}
          >
            <span className={isLight ? 'text-slate-500' : 'text-slate-400'}>Daya Terpasang:</span>
            <span
              className={`font-mono font-bold ${
                isLight ? 'text-amber-700' : 'text-amber-300'
              }`}
            >
              {comp.ratedPowerKW} kW
            </span>
          </div>
        )}

        {comp.capacityKWh && (
          <div
            className={`flex justify-between p-2 rounded-lg ${
              isLight ? 'bg-slate-100/90 text-slate-700' : 'bg-slate-800/40 text-slate-300'
            }`}
          >
            <span className={isLight ? 'text-slate-500' : 'text-slate-400'}>Kapasitas Penyimpanan:</span>
            <span
              className={`font-mono font-bold ${
                isLight ? 'text-sky-700' : 'text-sky-400'
              }`}
            >
              {comp.capacityKWh} kWh
            </span>
          </div>
        )}

        {comp.baseLoadKW && (
          <div
            className={`flex justify-between p-2 rounded-lg ${
              isLight ? 'bg-slate-100/90 text-slate-700' : 'bg-slate-800/40 text-slate-300'
            }`}
          >
            <span className={isLight ? 'text-slate-500' : 'text-slate-400'}>Beban Dasar Puncak:</span>
            <span
              className={`font-mono font-bold ${
                isLight ? 'text-rose-700' : 'text-rose-400'
              }`}
            >
              {comp.baseLoadKW} kW
            </span>
          </div>
        )}

        <div
          className={`flex justify-between p-2 rounded-lg ${
            isLight ? 'bg-slate-100/90 text-slate-700' : 'bg-slate-800/40 text-slate-300'
          }`}
        >
          <span className={isLight ? 'text-slate-500' : 'text-slate-400'}>Biaya Investasi:</span>
          <span
            className={`font-mono font-bold ${
              isLight ? 'text-emerald-700' : 'text-emerald-400'
            }`}
          >
            {comp.cost > 0 ? `Rp ${comp.cost.toLocaleString('id-ID')}` : 'Disediakan (Rp 0)'}
          </span>
        </div>
      </div>

      {/* Deskripsi & Dampak SDG */}
      <div
        className={`mt-3 p-2.5 rounded-xl border text-[11px] ${
          isLight
            ? 'bg-slate-50 border-slate-200 text-slate-600'
            : 'bg-slate-950/60 border-slate-800/70 text-slate-300'
        }`}
      >
        <p className="leading-relaxed">{comp.description}</p>
        {comp.sdgImpact && (
          <div
            className={`mt-2 pt-2 border-t font-semibold ${
              isLight
                ? 'border-slate-200 text-emerald-700'
                : 'border-slate-800 text-emerald-400'
            }`}
          >
            🎯 {comp.sdgImpact}
          </div>
        )}
      </div>

      {/* Tombol Kontrol: Toggle Switch & Delete */}
      <div
        className={`mt-4 pt-3 border-t flex items-center gap-2 ${
          isLight ? 'border-slate-200' : 'border-slate-800'
        }`}
      >
        <button
          onClick={() => {
            onToggleItem(selectedItem.id);
            playSound('click');
          }}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-semibold transition-all duration-150 hover:scale-[1.02] active:scale-95 ${
            selectedItem.enabled
              ? isLight
                ? 'bg-amber-100 text-amber-900 hover:bg-amber-200 border border-amber-300'
                : 'bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-500/40'
              : 'bg-emerald-600 text-white hover:bg-emerald-500 shadow-xs'
          }`}
        >
          <Power className="w-3.5 h-3.5" />
          <span>{selectedItem.enabled ? 'Matikan' : 'Nyalakan'}</span>
        </button>

        <button
          onClick={() => {
            onRemoveItem(selectedItem.id);
            playSound('delete');
            onClose();
          }}
          className={`p-2 rounded-xl border transition-all duration-150 hover:scale-105 active:scale-90 ${
            isLight
              ? 'bg-red-50 hover:bg-red-100 text-red-700 border-red-200 shadow-xs'
              : 'bg-red-950/40 hover:bg-red-900/60 text-red-400 border border-red-800/50'
          }`}
          title="Hapus Komponen"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
