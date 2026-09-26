// Panel Katalog Komponen SimuGrid (TinkerCAD-style Palette)
// Memilih pembangkit EBT, baterai penyimpan, beban kawasan, dan infrastruktur kabel

import React, { useState } from 'react';
import {
  Sun,
  SunMedium,
  Wind,
  Disc,
  Droplets,
  Flame,
  BatteryCharging,
  Cpu,
  Home,
  Activity,
  GraduationCap,
  Store,
  Zap,
  ShieldCheck,
  Network,
  GitCommit,
  MousePointer,
  ChevronRight,
  Info,
  X
} from 'lucide-react';
import { COMPONENT_CATALOG, COMPONENT_CATEGORIES } from '../data/components';
import { playSound } from '../utils/audio';

const ICON_MAP = {
  Sun,
  SunMedium,
  Wind,
  Disc,
  Droplets,
  Flame,
  BatteryCharging,
  Cpu,
  Home,
  Activity,
  GraduationCap,
  Store,
  Zap,
  ShieldCheck,
  Network,
  GitCommit
};

export default function ComponentPalette({
  selectedTool,
  onSelectTool,
  ambientTheme,
  isOpenMobile = false,
  onCloseMobile
}) {
  const [activeCategory, setActiveCategory] = useState(COMPONENT_CATEGORIES.GENERATOR);
  const [showHint, setShowHint] = useState(true);

  const categories = [
    { id: COMPONENT_CATEGORIES.GENERATOR, label: 'Pembangkit', icon: '☀️' },
    { id: COMPONENT_CATEGORIES.STORAGE, label: 'Baterai', icon: '🔋' },
    { id: COMPONENT_CATEGORIES.LOAD, label: 'Beban Konsumen', icon: '🏘️' },
    { id: COMPONENT_CATEGORIES.INFRASTRUCTURE, label: 'Jaringan & Kabel', icon: '⚡' }
  ];

  const filteredItems = COMPONENT_CATALOG.filter(
    (item) => item.category === activeCategory
  );

  return (
    <>
      {/* Backdrop overlay di mobile/tablet saat drawer terbuka */}
      {isOpenMobile && (
        <div
          onClick={onCloseMobile}
          className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40 animate-fade-in"
        />
      )}

      <aside
        className={`fixed lg:static top-0 bottom-0 left-0 w-80 max-w-[85vw] h-full border-r transition-all duration-300 z-50 lg:z-20 flex flex-col select-none ${
          ambientTheme?.panelBg || 'bg-slate-950/95 border-slate-800'
        } ${
          isOpenMobile ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Header Panel & Mode Kursor */}
        <div
          className={`p-3 border-b flex items-center justify-between ${
            ambientTheme?.isLight ? 'border-slate-200' : 'border-slate-800'
          }`}
        >
          <div className="flex items-center gap-2">
            <span
              className={`text-xs font-bold uppercase tracking-wider ${
                ambientTheme?.isLight ? 'text-slate-500' : 'text-slate-400'
              }`}
            >
              Katalog Komponen
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Tombol Kursor Seleksi Biasa */}
            <button
              onClick={() => {
                onSelectTool(null);
                playSound('click');
                if (typeof window !== 'undefined' && window.innerWidth < 1024 && onCloseMobile) {
                  onCloseMobile();
                }
              }}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all duration-150 active:scale-95 ${
                !selectedTool
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950/20'
                  : ambientTheme?.isLight
                  ? 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 shadow-xs'
                  : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700'
              }`}
              title="Mode kursor seleksi/inspeksi"
            >
              <MousePointer className="w-3.5 h-3.5" />
              <span>Pilih</span>
            </button>

            {/* Tombol Tutup Drawer di Layar Ponsel/Tablet */}
            <button
              onClick={onCloseMobile}
              className={`lg:hidden p-1.5 rounded-lg border transition-colors ${
                ambientTheme?.isLight
                  ? 'hover:bg-slate-200 text-slate-500 border-slate-200'
                  : 'hover:bg-slate-800 text-slate-400 border-slate-800'
              }`}
              title="Tutup Katalog"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tab Kategori */}
        <div
          className={`grid grid-cols-2 gap-1 p-2 border-b ${
            ambientTheme?.isLight
              ? 'bg-slate-100/90 border-slate-200'
              : 'bg-slate-900/90 border-slate-800'
          }`}
        >
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                setActiveCategory(cat.id);
                playSound('click');
              }}
              className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-[11px] font-medium transition-all duration-200 active:scale-95 ${
                activeCategory === cat.id
                  ? ambientTheme?.isLight
                    ? 'bg-white text-emerald-700 font-bold shadow-xs border border-slate-200 scale-[1.02]'
                    : 'bg-slate-800 text-emerald-400 font-semibold shadow-sm border border-slate-700 scale-[1.02]'
                  : ambientTheme?.isLight
                  ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <span className="transition-transform duration-200 group-hover:scale-110">{cat.icon}</span>
              <span className="truncate">{cat.label}</span>
            </button>
          ))}
        </div>

      {/* Petunjuk Penempatan Singkat dengan Animasi Collapse Halus */}
      <div
        className={`transition-all duration-300 overflow-hidden ${
          showHint ? 'max-h-20 opacity-100' : 'max-h-0 opacity-0 pointer-events-none'
        }`}
      >
        <div
          className={`px-3 py-1.5 border-b flex items-center justify-between gap-2 text-[11px] ${
            ambientTheme?.isLight
              ? 'bg-emerald-50/90 border-emerald-200/80 text-emerald-900'
              : 'bg-slate-900/60 border-slate-800/60 text-slate-400'
          }`}
        >
          <div className="flex items-center gap-2 overflow-hidden">
            <Info
              className={`w-3.5 h-3.5 shrink-0 ${
                ambientTheme?.isLight ? 'text-emerald-700' : 'text-cyan-400'
              }`}
            />
            <span className="truncate">Pilih komponen, lalu klik pada ubin kanvas untuk memasangnya.</span>
          </div>
          <button
            onClick={() => {
              setShowHint(false);
              playSound('click');
            }}
            className={`p-1 rounded-md transition-all duration-150 hover:scale-110 active:scale-90 shrink-0 ${
              ambientTheme?.isLight
                ? 'hover:bg-emerald-100 text-emerald-700'
                : 'hover:bg-slate-800 text-slate-500 hover:text-slate-200'
            }`}
            title="Tutup petunjuk ini"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* List Komponen Sesuai Kategori */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {filteredItems.map((item) => {
          const IconComp = ICON_MAP[item.icon] || Zap;
          const isSelected = selectedTool === item.id;

          return (
            <div
              key={item.id}
              onClick={() => {
                const nextTool = isSelected ? null : item.id;
                onSelectTool(nextTool);
                playSound('click');
                if (nextTool && typeof window !== 'undefined' && window.innerWidth < 1024 && onCloseMobile) {
                  onCloseMobile();
                }
              }}
              className={`group p-2.5 rounded-xl border cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md active:scale-[0.98] ${
                isSelected
                  ? ambientTheme?.isLight
                    ? 'bg-emerald-50/90 border-emerald-500 shadow-md ring-2 ring-emerald-500/50'
                    : 'bg-emerald-950/40 border-emerald-500 shadow-lg shadow-emerald-950/50 ring-2 ring-emerald-500/50'
                  : ambientTheme?.isLight
                  ? 'bg-white hover:bg-slate-50/90 border-slate-200 shadow-xs hover:border-slate-300'
                  : 'bg-slate-900/70 hover:bg-slate-900 border-slate-800/80 hover:border-slate-700'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 shadow-2xs"
                    style={{
                      backgroundColor: `${item.color}20`,
                      color: item.color,
                      border: `1px solid ${item.color}40`
                    }}
                  >
                    <IconComp className="w-4 h-4" />
                  </div>
                  <div>
                    <h4
                      className={`text-xs font-bold leading-tight ${
                        ambientTheme?.isLight
                          ? 'text-slate-900 group-hover:text-slate-950'
                          : 'text-slate-200 group-hover:text-white'
                      }`}
                    >
                      {item.name}
                    </h4>
                    <span
                      className={`text-[10px] ${
                        ambientTheme?.isLight ? 'text-slate-600 font-medium' : 'text-slate-400'
                      }`}
                    >
                      {item.ratedPowerKW && `⚡ ${item.ratedPowerKW} kW`}
                      {item.capacityKWh && `🔋 ${item.capacityKWh} kWh`}
                      {item.baseLoadKW && `🔌 Puncak ~${item.baseLoadKW} kW`}
                      {item.type === 'substation' && '🏢 Hub Jaringan Pintar'}
                      {item.type === 'wire' && '〰️ Jalur Transmisi'}
                    </span>
                  </div>
                </div>

                {/* Biaya */}
                <span
                  className={`font-mono text-[11px] font-semibold ${
                    ambientTheme?.isLight ? 'text-slate-700 font-bold' : 'text-slate-300'
                  }`}
                >
                  {item.cost > 0 ? `Rp ${(item.cost / 1000000).toFixed(0)} Jt` : 'Gratis'}
                </span>
              </div>

              <p
                className={`text-[11px] mt-2 line-clamp-2 leading-relaxed ${
                  ambientTheme?.isLight ? 'text-slate-600' : 'text-slate-400'
                }`}
              >
                {item.description}
              </p>

              {/* Tag Dampak SDG */}
              {item.sdgImpact && (
                <div
                  className={`mt-2 pt-1.5 border-t flex items-center justify-between text-[10px] ${
                    ambientTheme?.isLight ? 'border-slate-200' : 'border-slate-800/80'
                  }`}
                >
                  <span
                    className={`font-medium truncate ${
                      ambientTheme?.isLight ? 'text-emerald-700 font-semibold' : 'text-emerald-400'
                    }`}
                  >
                    {item.sdgImpact}
                  </span>
                  <ChevronRight
                    className={`w-3 h-3 transition-colors shrink-0 ${
                      ambientTheme?.isLight
                        ? 'text-slate-400 group-hover:text-emerald-700'
                        : 'text-slate-500 group-hover:text-emerald-400'
                    }`}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer Info SDG 7 & 11 */}
      <div
        className={`p-3 border-t text-[10px] flex items-center justify-between ${
          ambientTheme?.isLight
            ? 'border-slate-200 bg-slate-100/80 text-slate-600'
            : 'border-slate-800 bg-slate-900/40 text-slate-400'
        }`}
      >
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          Konektivitas Otomatis Aktif
        </span>
        <span className={`font-mono ${ambientTheme?.isLight ? 'text-slate-600 font-semibold' : 'text-slate-400'}`}>
          16x16 Grid
        </span>
      </div>
    </aside>
  </>
  );
}
