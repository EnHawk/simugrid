// Top Navbar SimuGrid (SDG 7 & SDG 11)
// Pengatur Garis Waktu 24 Jam, Pemilih Cuaca, Mode Simulasi, dan Meter Anggaran

import React from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Sun,
  CloudSun,
  CloudLightning,
  Moon,
  Coins,
  BookOpen,
  Volume2,
  VolumeX,
  Sparkles,
  Layers,
  Award,
  CheckCircle2
} from 'lucide-react';
import { WEATHER_PROFILES, SCENARIOS } from '../data/scenarios';
import { playSound, toggleMute, getMuteState } from '../utils/audio';
import SimuGridLogo from './SimuGridLogo';

export default function TopNavbar({
  mode,
  setMode,
  activeScenario,
  setActiveScenario,
  isMissionCompleted,
  weatherConfig,
  setWeatherConfig,
  onOpenWeatherModal,
  ambientTheme,
  simulationHour,
  setSimulationHour,
  isPlaying,
  setIsPlaying,
  simSpeed,
  setSimSpeed,
  budget,
  remainingBudget,
  onResetGrid,
  onOpenEducation,
  onOpenChallenges
}) {
  const [muted, setMuted] = React.useState(getMuteState());

  const handleToggleAudio = () => {
    const nextState = toggleMute();
    setMuted(nextState);
  };

  const isDynamic = Boolean(weatherConfig?.isDynamic);
  const weatherLabel = isDynamic
    ? 'Cuaca Alami'
    : (weatherConfig?.name || WEATHER_PROFILES[weatherConfig?.presetKey]?.name || 'Cerah Tropis');

  // Format jam: 14.5 -> "14:30"
  const hoursInt = Math.floor(simulationHour) % 24;
  const minutesInt = Math.floor((simulationHour % 1) * 60);
  const timeFormatted = `${String(hoursInt).padStart(2, '0')}:${String(minutesInt).padStart(2, '0')}`;

  // Keterangan waktu (Pagi, Siang, Sore, Malam)
  let timePeriodLabel = 'Malam';
  if (simulationHour >= 5 && simulationHour < 10) timePeriodLabel = 'Pagi';
  else if (simulationHour >= 10 && simulationHour < 15) timePeriodLabel = 'Siang';
  else if (simulationHour >= 15 && simulationHour < 18.5) timePeriodLabel = 'Sore';

  return (
    <>
      <header
      className={`h-16 border-b transition-colors duration-500 ${
        ambientTheme?.navbarBg || 'bg-slate-950/90 border-slate-800 text-slate-200'
      } backdrop-blur-md px-4 flex items-center justify-between gap-4 z-30 select-none`}
    >
      {/* Brand & Logo */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        <div className="flex items-center gap-2 group cursor-default">
          <SimuGridLogo
            size={34}
            isLight={ambientTheme?.isLight}
            animated={true}
          />
          <div>
            <div className="flex items-center gap-1.5">
              <span
                className={`font-black text-sm sm:text-base tracking-tight transition-colors duration-200 ${
                  ambientTheme?.isLight
                    ? 'text-slate-900 group-hover:text-emerald-700'
                    : 'text-white group-hover:text-emerald-400'
                }`}
              >
                Simu<span className="text-emerald-500 font-black">Grid</span>
              </span>
            </div>
            <div
              className={`text-[10px] tracking-wide hidden lg:block ${
                ambientTheme?.isLight ? 'text-slate-500 font-medium' : 'text-slate-400 font-normal'
              }`}
            >
              Renewable Microgrid Playground
            </div>
          </div>
        </div>

        <div
          className={`w-[1px] h-6 mx-0.5 hidden sm:block ${
            ambientTheme?.isLight ? 'bg-slate-200' : 'bg-slate-800'
          }`}
        />

        {/* Pemilihan Mode: Tantangan vs Sandbox dengan Animasi Sliding Pill & Color Morph */}
        <div
          className={`relative flex items-center p-0.5 sm:p-1 rounded-xl border select-none ${
            ambientTheme?.isLight
              ? 'bg-slate-100 border-slate-200 shadow-xs'
              : 'bg-slate-900 border-slate-800'
          }`}
        >
          {/* Animated sliding highlight pill */}
          <div
            className={`absolute top-0.5 sm:top-1 bottom-0.5 sm:bottom-1 w-[calc(50%-2px)] sm:w-[calc(50%-4px)] rounded-lg transition-all duration-300 ease-out shadow-sm pointer-events-none ${
              mode === 'challenge'
                ? 'left-0.5 sm:left-1 bg-emerald-600 shadow-emerald-950/20'
                : 'left-[calc(50%+1px)] sm:left-[calc(50%+2px)] bg-cyan-600 shadow-cyan-950/20'
            }`}
          />

          <button
            onClick={() => {
              setMode('challenge');
              playSound('click');
            }}
            className={`relative z-10 px-2 sm:px-3 sm:w-24 flex items-center justify-center gap-1.5 py-1 rounded-lg text-xs font-medium transition-colors duration-200 ${
              mode === 'challenge'
                ? 'text-white font-semibold'
                : ambientTheme?.isLight
                ? 'text-slate-600 hover:text-slate-900'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Mode Misi Tantangan"
          >
            <Award className={`w-3.5 h-3.5 transition-transform duration-300 ${mode === 'challenge' ? 'scale-110' : 'scale-100'}`} />
            <span className="hidden sm:inline">Tantangan</span>
          </button>

          <button
            onClick={() => {
              setMode('sandbox');
              playSound('click');
            }}
            className={`relative z-10 px-2 sm:px-3 sm:w-24 flex items-center justify-center gap-1.5 py-1 rounded-lg text-xs font-medium transition-colors duration-200 ${
              mode === 'sandbox'
                ? 'text-white font-semibold'
                : ambientTheme?.isLight
                ? 'text-slate-600 hover:text-slate-900'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Mode Bebas Sandbox"
          >
            <Layers className={`w-3.5 h-3.5 transition-transform duration-300 ${mode === 'sandbox' ? 'scale-110' : 'scale-100'}`} />
            <span className="hidden sm:inline">Sandbox</span>
          </button>
        </div>

        {/* Jika mode Tantangan, tombol pilih misi dengan animasi transisi masuk/keluar */}
        <div
          className={`transition-all duration-300 overflow-hidden ${
            mode === 'challenge'
              ? 'max-w-[240px] opacity-100 scale-100'
              : 'max-w-0 opacity-0 scale-95 pointer-events-none'
          }`}
        >
          <button
            onClick={onOpenChallenges}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all duration-150 hover:scale-[1.02] active:scale-95 shadow-sm whitespace-nowrap ${
              isMissionCompleted
                ? ambientTheme?.isLight
                  ? 'bg-emerald-100 hover:bg-emerald-200/80 border-emerald-300 text-emerald-900 shadow-xs'
                  : 'bg-emerald-950/80 hover:bg-emerald-900/80 border-emerald-700/80 text-emerald-300'
                : ambientTheme?.isLight
                ? 'bg-amber-50 hover:bg-amber-100/80 border-amber-300 text-amber-900 shadow-xs'
                : 'bg-slate-900 hover:bg-slate-800 border-slate-700/80 text-amber-300'
            }`}
          >
            {isMissionCompleted ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            ) : (
              <Sparkles
                className={`w-3.5 h-3.5 animate-pulse ${
                  ambientTheme?.isLight ? 'text-amber-600' : 'text-amber-400'
                }`}
              />
            )}
            <span className="truncate max-w-[120px] md:max-w-[150px]">
              {activeScenario?.title || 'Pilih Misi'}
            </span>
            {isMissionCompleted && (
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                Selesai
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Kontrol Waktu 24 Jam & Pemutar Simulasi (Tengah di Desktop/Tablet) */}
      <div
        className={`hidden md:flex items-center gap-3 px-3 py-1.5 rounded-2xl border transition-all ${
          ambientTheme?.isLight
            ? 'bg-white border-slate-200 shadow-sm'
            : 'bg-slate-900/90 border-slate-800/90 shadow-inner'
        }`}
      >
        {/* Tombol Play/Pause */}
        <button
          onClick={() => {
            setIsPlaying(!isPlaying);
            playSound('click');
          }}
          className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-150 hover:scale-105 active:scale-95 shadow-xs ${
            isPlaying
              ? ambientTheme?.isLight
                ? 'bg-amber-100 text-amber-800 border border-amber-300 hover:bg-amber-200'
                : 'bg-amber-500/20 text-amber-400 border border-amber-500/40 hover:bg-amber-500/30'
              : 'bg-emerald-600 text-white hover:bg-emerald-500 shadow-md shadow-emerald-950/20'
          }`}
          title={isPlaying ? 'Jeda Simulasi' : 'Jalankan Simulasi'}
        >
          {isPlaying ? <Pause className="w-4 h-4 fill-current transition-transform duration-200" /> : <Play className="w-4 h-4 fill-current ml-0.5 transition-transform duration-200" />}
        </button>

        {/* Jam & Fase Waktu */}
        <div className="flex flex-col items-center min-w-[70px]">
          <div
            className={`font-mono font-bold text-sm tracking-wider ${
              ambientTheme?.isLight ? 'text-slate-900' : 'text-slate-100'
            }`}
          >
            {timeFormatted}
          </div>
          <div
            className={`text-[10px] font-semibold uppercase tracking-wider ${
              ambientTheme?.isLight ? 'text-emerald-700' : 'text-emerald-400'
            }`}
          >
            {timePeriodLabel}
          </div>
        </div>

        {/* Scrubber Garis Waktu (00:00 - 24:00) */}
        <div className="w-28 sm:w-36 md:w-48 flex items-center">
          <input
            type="range"
            min="0"
            max="24"
            step="0.25"
            value={simulationHour}
            onChange={(e) => setSimulationHour(parseFloat(e.target.value))}
            className={`w-full h-1.5 rounded-lg appearance-none cursor-pointer accent-emerald-500 ${
              ambientTheme?.isLight ? 'bg-slate-200' : 'bg-slate-700'
            }`}
            title="Tarik untuk mengubah jam simulasi"
          />
        </div>

        {/* Kecepatan Putar (1x, 2x, 5x) */}
        <div
          className={`flex items-center gap-1 p-1 rounded-lg border text-[11px] font-mono ${
            ambientTheme?.isLight
              ? 'bg-slate-100 border-slate-200'
              : 'bg-slate-950 border-slate-800'
          }`}
        >
          {[1, 2, 5].map((speed) => (
            <button
              key={speed}
              onClick={() => {
                setSimSpeed(speed);
                playSound('click');
              }}
              className={`px-1.5 py-0.5 rounded transition-all duration-150 active:scale-90 ${
                simSpeed === speed
                  ? 'bg-emerald-600 text-white font-bold shadow-xs'
                  : ambientTheme?.isLight
                  ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              {speed}x
            </button>
          ))}
        </div>
      </div>

      {/* Bagian Kanan: Cuaca, Anggaran & Aksi */}
      <div className="flex items-center gap-2.5">
        {/* Tombol Pengatur Cuaca (Alami vs Manual) */}
        <button
          onClick={() => {
            onOpenWeatherModal();
            playSound('click');
          }}
          className={`flex items-center gap-2 px-2.5 py-1.5 rounded-xl border transition-all group ${
            ambientTheme?.isLight
              ? 'bg-white border-slate-200 hover:border-sky-400 shadow-xs'
              : 'bg-slate-900/90 border-slate-800 hover:border-sky-500/60 shadow-sm'
          }`}
          title={
            mode === 'challenge'
              ? 'Cuaca Terkunci oleh Skenario Misi (Manual hanya di Mode Sandbox)'
              : 'Klik untuk mengatur cuaca alami dinamis atau preset/slider manual'
          }
        >
          {isDynamic ? (
            <Sparkles className="w-4 h-4 text-emerald-500 animate-pulse" />
          ) : weatherConfig?.presetKey === 'sunny' || weatherConfig?.icon === 'Sun' ? (
            <Sun className="w-4 h-4 text-amber-500" />
          ) : weatherConfig?.presetKey === 'partly_cloudy' || weatherConfig?.icon === 'CloudSun' ? (
            <CloudSun className="w-4 h-4 text-sky-500" />
          ) : weatherConfig?.presetKey === 'rainy_storm' || weatherConfig?.icon === 'CloudLightning' ? (
            <CloudLightning className="w-4 h-4 text-indigo-500" />
          ) : (
            <Moon className="w-4 h-4 text-purple-500" />
          )}

          <div className="text-left hidden md:block">
            <div
              className={`text-[9px] uppercase font-semibold tracking-wider flex items-center gap-1 ${
                ambientTheme?.isLight ? 'text-slate-500' : 'text-slate-400'
              }`}
            >
              <span>Cuaca</span>
              {mode === 'challenge' ? (
                <span
                  className={`text-[8px] px-1 rounded font-medium border ${
                    ambientTheme?.isLight
                      ? 'bg-amber-100 text-amber-800 border-amber-200'
                      : 'bg-amber-950/80 text-amber-400 border-amber-800/60'
                  }`}
                >
                  Misi
                </span>
              ) : isDynamic ? (
                <span
                  className={`text-[8px] px-1 rounded border ${
                    ambientTheme?.isLight
                      ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                      : 'bg-emerald-950 text-emerald-400 border-emerald-800'
                  }`}
                >
                  Alami
                </span>
              ) : (
                <span
                  className={`text-[8px] px-1 rounded border ${
                    ambientTheme?.isLight
                      ? 'bg-sky-100 text-sky-800 border-sky-200'
                      : 'bg-sky-950 text-sky-400 border-sky-800'
                  }`}
                >
                  Manual
                </span>
              )}
            </div>
            <div
              className={`text-xs font-semibold transition-colors ${
                ambientTheme?.isLight
                  ? 'text-slate-800 group-hover:text-sky-600'
                  : 'text-slate-200 group-hover:text-sky-300'
              }`}
            >
              {weatherLabel}
            </div>
          </div>
        </button>

        {/* Anggaran / Budget Meter */}
        <div
          className={`flex items-center gap-1.5 px-2 sm:px-3 py-1.5 border rounded-xl ${
            ambientTheme?.isLight
              ? 'bg-white border-slate-200 shadow-xs'
              : 'bg-slate-900 border-slate-800'
          }`}
        >
          <Coins className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-500 shrink-0" />
          <div className="text-right">
            <div
              className={`text-[9px] sm:text-[10px] font-medium hidden sm:block ${
                ambientTheme?.isLight ? 'text-slate-600' : 'text-slate-400'
              }`}
            >
              {mode === 'challenge' ? 'Sisa Anggaran' : 'Pengeluaran'}
            </div>
            <div
              className={`text-[11px] sm:text-xs font-mono font-bold whitespace-nowrap ${
                mode === 'challenge' && remainingBudget < 0
                  ? ambientTheme?.isLight
                    ? 'text-red-600'
                    : 'text-red-400'
                  : ambientTheme?.isLight
                  ? 'text-emerald-700'
                  : 'text-emerald-400'
              }`}
            >
              Rp {(Math.abs(mode === 'challenge' ? remainingBudget : budget - remainingBudget) / 1000000).toFixed(0)} Jt
            </div>
          </div>
        </div>

        {/* Tombol Edukasi SDG 7 & 11 */}
        <button
          onClick={onOpenEducation}
          className={`p-2 rounded-xl border transition-all duration-150 hover:scale-105 active:scale-95 ${
            ambientTheme?.isLight
              ? 'bg-white hover:bg-slate-100 border-slate-200 text-emerald-700 shadow-xs'
              : 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-emerald-400'
          }`}
          title="Panduan Edukasi SDG 7 & SDG 11"
        >
          <BookOpen className="w-4 h-4" />
        </button>

        {/* Tombol Mute / Suara */}
        <button
          onClick={handleToggleAudio}
          className={`p-2 rounded-xl border transition-all duration-150 hover:scale-105 active:scale-95 ${
            ambientTheme?.isLight
              ? 'bg-white hover:bg-slate-100 border-slate-200 text-slate-700 shadow-xs'
              : 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-300 hover:text-slate-100'
          }`}
          title={muted ? 'Nyalakan Efek Suara' : 'Bisukan Suara'}
        >
          {muted ? (
            <VolumeX className={`w-4 h-4 ${ambientTheme?.isLight ? 'text-red-600' : 'text-red-400'}`} />
          ) : (
            <Volume2 className={`w-4 h-4 ${ambientTheme?.isLight ? 'text-cyan-700' : 'text-cyan-400'}`} />
          )}
        </button>

        {/* Tombol Reset */}
        <button
          onClick={() => {
            if (window.confirm('Bersihkan seluruh kanvas kawasan?')) {
              onResetGrid();
              playSound('delete');
            }
          }}
          className={`p-2 rounded-xl border transition-all duration-150 hover:scale-105 active:scale-95 ${
            ambientTheme?.isLight
              ? 'bg-white hover:bg-red-50 hover:text-red-700 border-slate-200 text-slate-500 shadow-xs'
              : 'bg-slate-900 hover:bg-red-950/80 hover:text-red-300 border border-slate-800 text-slate-400'
          }`}
          title="Reset Tata Letak Kanvas"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>
    </header>

    {/* Mobile Time Scrubber Sub-bar (Khusus layar HP/smartphone agar kontrol waktu 24 jam mudah digeser) */}
    <div
      className={`md:hidden px-3 py-1.5 border-b flex items-center justify-between gap-2 text-xs transition-colors duration-500 ${
        ambientTheme?.navbarBg || 'bg-slate-950 border-slate-800 text-slate-200'
      } backdrop-blur-md z-20`}
    >
      <button
        onClick={() => {
          setIsPlaying(!isPlaying);
          playSound('click');
        }}
        className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 shadow-xs transition-all active:scale-95 ${
          isPlaying
            ? ambientTheme?.isLight
              ? 'bg-amber-100 text-amber-800 border border-amber-300'
              : 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
            : 'bg-emerald-600 text-white shadow-emerald-950/20'
        }`}
        title={isPlaying ? 'Jeda Simulasi' : 'Jalankan Simulasi'}
      >
        {isPlaying ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current ml-0.5" />}
      </button>

      <div className="flex items-center gap-1 font-mono text-xs font-bold shrink-0">
        <span>{timeFormatted}</span>
        <span className="text-[10px] text-emerald-500 font-semibold uppercase">{timePeriodLabel}</span>
      </div>

      <div className="flex-1 max-w-[200px] flex items-center px-1">
        <input
          type="range"
          min="0"
          max="24"
          step="0.25"
          value={simulationHour}
          onChange={(e) => setSimulationHour(parseFloat(e.target.value))}
          className={`w-full h-1.5 rounded-lg appearance-none cursor-pointer accent-emerald-500 ${
            ambientTheme?.isLight ? 'bg-slate-200' : 'bg-slate-700'
          }`}
          title="Geser untuk mengubah jam simulasi"
        />
      </div>

      <div className="flex items-center gap-0.5 font-mono text-[10px] shrink-0">
        {[1, 2, 5].map((speed) => (
          <button
            key={speed}
            onClick={() => {
              setSimSpeed(speed);
              playSound('click');
            }}
            className={`px-1.5 py-0.5 rounded transition-all active:scale-90 ${
              simSpeed === speed
                ? 'bg-emerald-600 text-white font-bold'
                : ambientTheme?.isLight
                ? 'text-slate-600 hover:bg-slate-200/60'
                : 'text-slate-400 hover:bg-slate-800/60'
            }`}
          >
            {speed}x
          </button>
        ))}
      </div>
    </div>
  </>
  );
}
