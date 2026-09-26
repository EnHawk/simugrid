// Modal / Panel Pengatur Cuaca SimuGrid
// Mendukung mode Cuaca Alami Dinamis (berubah otomatis seiring waktu) dan Mode Atur Manual (Slider & Preset)

import React from 'react';
import {
  X,
  Sun,
  CloudSun,
  CloudLightning,
  Moon,
  Wind,
  Sparkles,
  Sliders,
  Check,
  Compass,
  Thermometer,
  CloudRain,
  Lock
} from 'lucide-react';
import { WEATHER_PROFILES } from '../data/scenarios';
import { getEffectiveWeatherAtHour } from '../utils/simulationEngine';
import { playSound } from '../utils/audio';

export default function WeatherModal({
  isOpen,
  onClose,
  weatherConfig,
  setWeatherConfig,
  simulationHour,
  mode,
  onSwitchToSandbox,
  ambientTheme
}) {
  if (!isOpen) return null;

  const isDynamic = Boolean(weatherConfig.isDynamic);
  const currentEffective = getEffectiveWeatherAtHour(simulationHour, weatherConfig);
  const isLight = Boolean(ambientTheme?.isLight);

  // Helper untuk memilih preset
  const handleSelectPreset = (presetKey) => {
    const preset = WEATHER_PROFILES[presetKey];
    if (!preset) return;
    setWeatherConfig({
      isDynamic: false,
      presetKey,
      name: preset.name,
      solarFactor: preset.solarFactor,
      windSpeedMS: preset.windSpeedMS,
      icon: preset.icon,
      cloudPassing: true,
      windGusts: true
    });
    playSound('click');
  };

  // Helper untuk aktifkan Cuaca Alami Dinamis
  const handleEnableDynamic = () => {
    setWeatherConfig((prev) => ({
      ...prev,
      isDynamic: true,
      name: 'Cuaca Alami Dinamis',
      cloudPassing: true,
      windGusts: true
    }));
    playSound('click');
  };

  // Helper untuk atur slider manual
  const handleSliderChange = (field, value) => {
    setWeatherConfig((prev) => ({
      ...prev,
      isDynamic: false,
      presetKey: 'custom',
      name: 'Kustom Manual',
      [field]: value
    }));
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-2 sm:p-4 select-none animate-backdrop-in">
      <div
        className={`border rounded-2xl max-w-xl w-full overflow-hidden shadow-2xl flex flex-col max-h-[94vh] sm:max-h-[90vh] animate-modal-pop ${
          isLight
            ? 'bg-white border-slate-200 text-slate-800'
            : 'bg-slate-900 border-slate-700 text-slate-100'
        }`}
      >
        {/* Header Modal */}
        <div
          className={`px-4 py-3 sm:px-6 sm:py-4 border-b flex items-center justify-between ${
            isLight ? 'border-slate-200 bg-slate-50' : 'border-slate-800 bg-slate-950/80'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold border ${
                isLight
                  ? 'bg-sky-100 text-sky-700 border-sky-200'
                  : 'bg-sky-500/20 text-sky-400 border-sky-500/30'
              }`}
            >
              <CloudSun className="w-5 h-5" />
            </div>
            <div>
              <h2 className={`text-sm sm:text-base font-bold ${isLight ? 'text-slate-900' : 'text-slate-100'}`}>
                Pusat Pengatur Cuaca & Iklim
              </h2>
              <p className={`text-[11px] sm:text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                Pilih apakah cuaca berjalan alami otomatis atau diatur manual sesuai keinginan
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className={`p-1.5 rounded-lg transition-colors ${
              isLight
                ? 'hover:bg-slate-200 text-slate-500 hover:text-slate-900'
                : 'hover:bg-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Weather Status Card Saat Ini */}
        <div
          className={`p-3.5 sm:p-4 mx-3 sm:mx-6 mt-3 sm:mt-4 rounded-xl border flex items-center justify-between ${
            isLight
              ? 'bg-slate-50 border-slate-200 text-slate-800 shadow-2xs'
              : 'bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border-slate-800'
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl shadow-inner border ${
                isLight ? 'bg-white border-slate-200' : 'bg-slate-800 border-slate-700'
              }`}
            >
              {currentEffective.icon === 'Sun' && '☀️'}
              {currentEffective.icon === 'CloudSun' && '⛅'}
              {currentEffective.icon === 'Moon' && '🌙'}
              {currentEffective.icon === 'Wind' && '💨'}
            </div>
            <div>
              <div className={`text-[10px] uppercase tracking-wider font-semibold ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                Kondisi Cuaca Jam {String(Math.floor(simulationHour)).padStart(2, '0')}:00
              </div>
              <div className={`text-sm font-bold ${isLight ? 'text-slate-900' : 'text-slate-100'}`}>
                {currentEffective.weatherName}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 font-mono text-xs text-right">
            <div>
              <div className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Radiasi Surya</div>
              <div className={`font-bold ${isLight ? 'text-amber-700' : 'text-amber-400'}`}>
                {Math.round(currentEffective.solarMultiplier * 1000)} W/m²
              </div>
            </div>
            <div>
              <div className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Kecepatan Angin</div>
              <div className={`font-bold ${isLight ? 'text-cyan-700' : 'text-cyan-400'}`}>
                {currentEffective.windSpeedMS} m/s
              </div>
            </div>
          </div>
        </div>

        {/* Tab Pemilihan Mode: Cuaca Alami vs Atur Manual */}
        <div className="grid grid-cols-1 sm:grid-cols-2 p-3 sm:p-4 gap-2">
          <button
            onClick={handleEnableDynamic}
            className={`p-3 rounded-xl text-left border transition-all ${
              isDynamic
                ? isLight
                  ? 'bg-emerald-50 border-emerald-500 text-slate-900 shadow-sm ring-1 ring-emerald-500'
                  : 'bg-emerald-950/60 border-emerald-500 text-white shadow-md shadow-emerald-950'
                : isLight
                ? 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:bg-slate-800/40'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="font-bold text-xs flex items-center gap-1.5">
                <Sparkles className={`w-3.5 h-3.5 ${isLight ? 'text-emerald-600' : 'text-emerald-400'}`} />
                Cuaca Alami Dinamis
              </span>
              {isDynamic && <Check className={`w-4 h-4 ${isLight ? 'text-emerald-600' : 'text-emerald-400'}`} />}
            </div>
            <p className={`text-[11px] leading-snug ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
              Otomatis berubah seiring waktu 24 jam dengan awan berarak & fluktuasi angin alami.
            </p>
          </button>

          {mode === 'challenge' ? (
            <div
              className={`p-3 rounded-xl text-left border cursor-not-allowed relative group ${
                isLight
                  ? 'bg-slate-50 border-slate-200 text-slate-500'
                  : 'bg-slate-950/40 border-slate-800/80 text-slate-500'
              }`}
              title="Terkunci: Pengaturan cuaca manual hanya aktif di Mode Sandbox"
            >
              <div className="flex items-center justify-between mb-1">
                <span className={`font-bold text-xs flex items-center gap-1.5 ${isLight ? 'text-slate-700' : 'text-slate-400'}`}>
                  <Lock className="w-3.5 h-3.5 text-amber-500" />
                  Atur Manual & Preset
                </span>
                <span className={`text-[9px] px-1.5 py-0.5 rounded font-semibold uppercase border ${
                  isLight
                    ? 'bg-amber-100 text-amber-800 border-amber-200'
                    : 'bg-amber-950/60 text-amber-400 border-amber-800/50'
                }`}>
                  Sandbox Saja
                </span>
              </div>
              <p className={`text-[11px] leading-snug ${isLight ? 'text-slate-500' : 'text-slate-500'}`}>
                Terkunci pada Mode Tantangan. Beralih ke <strong>Mode Sandbox</strong> untuk mengatur slider dan preset cuaca.
              </p>
            </div>
          ) : (
            <button
              onClick={() => handleSelectPreset(weatherConfig.presetKey || 'sunny')}
              className={`p-3 rounded-xl text-left border transition-all ${
                !isDynamic
                  ? isLight
                    ? 'bg-sky-50 border-sky-500 text-slate-900 shadow-sm ring-1 ring-sky-500'
                    : 'bg-sky-950/60 border-sky-500 text-white shadow-md shadow-sky-950'
                  : isLight
                  ? 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:bg-slate-800/40'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-xs flex items-center gap-1.5">
                  <Sliders className={`w-3.5 h-3.5 ${isLight ? 'text-sky-600' : 'text-sky-400'}`} />
                  Atur Manual & Preset
                </span>
                {!isDynamic && <Check className={`w-4 h-4 ${isLight ? 'text-sky-600' : 'text-sky-400'}`} />}
              </div>
              <p className={`text-[11px] leading-snug ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                Pilih skenario cuaca tetap atau atur slider surya dan angin sesuai keinginan.
              </p>
            </button>
          )}
        </div>

        {/* Konten Sesuai Mode Terpilih */}
        <div className="flex-1 overflow-y-auto px-3 sm:px-6 pb-4 sm:pb-6 space-y-4">
          {mode === 'challenge' && (
            <div
              className={`p-3 rounded-xl border flex items-start justify-between gap-3 text-xs ${
                isLight
                  ? 'bg-amber-50 border-amber-200 text-amber-900'
                  : 'bg-amber-950/30 border-amber-800/50 text-amber-200'
              }`}
            >
              <div className="flex items-start gap-2.5">
                <Lock className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block">Cuaca Ditetapkan Berdasarkan Misi</span>
                  <p className={`text-[11px] mt-0.5 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                    Mode tantangan menguji strategi Anda menghadapi cuaca skenario. Pengaturan manual cuaca (slider surya & angin) tersedia bebas di <strong>Mode Sandbox</strong>.
                  </p>
                </div>
              </div>
              {onSwitchToSandbox && (
                <button
                  onClick={() => {
                    onSwitchToSandbox();
                    onClose();
                  }}
                  className="px-2.5 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-[10px] transition-colors shrink-0 self-center"
                >
                  Ke Sandbox ➔
                </button>
              )}
            </div>
          )}
          {isDynamic ? (
            /* Mode Cuaca Alami Dinamis */
            <div className="space-y-3 text-xs">
              <div
                className={`p-3 rounded-xl border space-y-2.5 ${
                  isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/70 border-slate-800'
                }`}
              >
                <h4 className={`font-bold text-xs ${isLight ? 'text-slate-900' : 'text-slate-200'}`}>
                  Siklus Cuaca Alami 24 Jam:
                </h4>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className={`p-2 rounded-lg border ${isLight ? 'bg-white border-slate-200 text-slate-700' : 'bg-slate-900 border-slate-800 text-slate-300'}`}>
                    <span className="text-amber-500 font-semibold block">06:00 - 10:00 (Pagi)</span>
                    Matahari mulai bersinar, angin sejuk 3-4 m/s.
                  </div>
                  <div className={`p-2 rounded-lg border ${isLight ? 'bg-white border-slate-200 text-slate-700' : 'bg-slate-900 border-slate-800 text-slate-300'}`}>
                    <span className="text-amber-500 font-semibold block">10:00 - 14:00 (Siang)</span>
                    Radiasi surya puncak ~1.000 W/m² dengan bayangan awan sesekali.
                  </div>
                  <div className={`p-2 rounded-lg border ${isLight ? 'bg-white border-slate-200 text-slate-700' : 'bg-slate-900 border-slate-800 text-slate-300'}`}>
                    <span className="text-cyan-600 font-semibold block">14:00 - 18:00 (Sore)</span>
                    Angin laut/darat meningkat kencang 7-9 m/s.
                  </div>
                  <div className={`p-2 rounded-lg border ${isLight ? 'bg-white border-slate-200 text-slate-700' : 'bg-slate-900 border-slate-800 text-slate-300'}`}>
                    <span className="text-purple-600 font-semibold block">18:00 - 06:00 (Malam)</span>
                    Surya padam, menguji ketahanan pasokan daya baterai.
                  </div>
                </div>
              </div>

              {/* Opsi Fluktuasi Mikro */}
              <div
                className={`p-3 rounded-xl border space-y-2 ${
                  isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/50 border-slate-800'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className={`font-semibold ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>
                      Awan Berarak (Cloud Passing)
                    </div>
                    <div className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                      Menghasilkan penurunan radiasi surya sesaat secara realistis saat awan melintas.
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={weatherConfig.cloudPassing !== false}
                    onChange={(e) =>
                      setWeatherConfig((prev) => ({ ...prev, cloudPassing: e.target.checked }))
                    }
                    className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
                  />
                </div>

                <div className={`w-full h-[1px] ${isLight ? 'bg-slate-200' : 'bg-slate-800'}`} />

                <div className="flex items-center justify-between">
                  <div>
                    <div className={`font-semibold ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>
                      Hembusan Angin Dinamis (Wind Gusts)
                    </div>
                    <div className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                      Kecepatan angin berfluktuasi naik-turun alami di setiap jamnya.
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={weatherConfig.windGusts !== false}
                    onChange={(e) =>
                      setWeatherConfig((prev) => ({ ...prev, windGusts: e.target.checked }))
                    }
                    className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
                  />
                </div>
              </div>
            </div>
          ) : (
            /* Mode Atur Manual & Preset */
            <div className="space-y-4 text-xs">
              {/* Pilihan Preset Cepat */}
              <div>
                <h4 className={`font-bold mb-2 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                  Pilih Preset Cuaca Cepat:
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(WEATHER_PROFILES).map(([key, p]) => (
                    <button
                      key={key}
                      onClick={() => handleSelectPreset(key)}
                      className={`p-2.5 rounded-xl border text-left transition-all ${
                        weatherConfig.presetKey === key
                          ? isLight
                            ? 'bg-sky-50 border-sky-500 text-slate-900 shadow-sm ring-1 ring-sky-500'
                            : 'bg-sky-950/70 border-sky-500 text-white'
                          : isLight
                          ? 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                          : 'bg-slate-950/50 border-slate-800 text-slate-300 hover:bg-slate-800/60'
                      }`}
                    >
                      <div className="flex items-center gap-2 font-bold mb-1">
                        <span>
                          {key === 'sunny' && '☀️'}
                          {key === 'partly_cloudy' && '⛅'}
                          {key === 'rainy_storm' && '⛈️'}
                          {key === 'windy_night' && '🌙'}
                        </span>
                        <span>{p.name}</span>
                      </div>
                      <div className={`text-[10px] line-clamp-1 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                        Surya: {Math.round(p.solarFactor * 100)}% • Angin: {p.windSpeedMS} m/s
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Slider Manual Kustom */}
              <div
                className={`p-3.5 rounded-xl border space-y-3.5 ${
                  isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/70 border-slate-800'
                }`}
              >
                <h4 className={`font-bold ${isLight ? 'text-slate-800' : 'text-slate-300'}`}>
                  Kustomisasi Manual Parameter:
                </h4>

                {/* Slider Radiasi Surya */}
                <div>
                  <div className="flex justify-between font-mono text-xs mb-1">
                    <span className={`flex items-center gap-1.5 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                      <Sun className="w-3.5 h-3.5 text-amber-500" />
                      Intensitas Radiasi Surya (Siang)
                    </span>
                    <span className="text-amber-600 font-bold">
                      {Math.round((weatherConfig.solarFactor ?? 1.0) * 100)}% ({Math.round((weatherConfig.solarFactor ?? 1.0) * 1000)} W/m²)
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={weatherConfig.solarFactor ?? 1.0}
                    onChange={(e) => handleSliderChange('solarFactor', parseFloat(e.target.value))}
                    className={`w-full h-1.5 rounded-lg appearance-none cursor-pointer accent-amber-500 ${
                      isLight ? 'bg-slate-200' : 'bg-slate-800'
                    }`}
                  />
                  <div className={`flex justify-between text-[10px] mt-0.5 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                    <span>Mendung Gelap (0%)</span>
                    <span>Cerah Terik (100%)</span>
                  </div>
                </div>

                {/* Slider Kecepatan Angin */}
                <div>
                  <div className="flex justify-between font-mono text-xs mb-1">
                    <span className={`flex items-center gap-1.5 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                      <Wind className="w-3.5 h-3.5 text-cyan-600" />
                      Kecepatan Angin
                    </span>
                    <span className="text-cyan-600 font-bold">
                      {(weatherConfig.windSpeedMS ?? 4.5).toFixed(1)} m/s
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="22"
                    step="0.5"
                    value={weatherConfig.windSpeedMS ?? 4.5}
                    onChange={(e) => handleSliderChange('windSpeedMS', parseFloat(e.target.value))}
                    className={`w-full h-1.5 rounded-lg appearance-none cursor-pointer accent-cyan-500 ${
                      isLight ? 'bg-slate-200' : 'bg-slate-800'
                    }`}
                  />
                  <div className={`flex justify-between text-[10px] mt-0.5 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                    <span>Tenang (0 m/s)</span>
                    <span>Sedang (6 m/s)</span>
                    <span>Badai Kencang (20 m/s)</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Modal */}
        <div
          className={`p-4 border-t flex justify-end ${
            isLight ? 'border-slate-200 bg-slate-50' : 'border-slate-800 bg-slate-950/90'
          }`}
        >
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-bold bg-sky-600 hover:bg-sky-500 text-white transition-all shadow-sm"
          >
            Terapkan Cuaca
          </button>
        </div>
      </div>
    </div>
  );
}
