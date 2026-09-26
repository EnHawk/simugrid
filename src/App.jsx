// Main App Component SimuGrid (SDG 7 & SDG 11)
// Web simulator interaktif berbasis kanvas untuk merancang sistem energi bersih kawasan

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Award } from 'lucide-react';
import confetti from 'canvas-confetti';
import TopNavbar from './components/TopNavbar';
import ComponentPalette from './components/ComponentPalette';
import GridCanvas from './components/GridCanvas';
import EnergyAnalytics from './components/EnergyAnalytics';
import InspectorModal from './components/InspectorModal';
import ChallengeModal from './components/ChallengeModal';
import EducationModal from './components/EducationModal';
import WeatherModal from './components/WeatherModal';

import { COMPONENT_MAP } from './data/components';
import { SCENARIOS, SANDBOX_PRESETS, WEATHER_PROFILES, isScenarioCompleted } from './data/scenarios';
import {
  simulate24Hours,
  computeInstantaneousPower,
  checkGridConnectivity,
  evaluateChallengeCriteria
} from './utils/simulationEngine';
import { getAmbientTheme } from './utils/themeEngine';
import { playSound } from './utils/audio';

export default function App() {
  // Mode Permainan: Default 'sandbox' saat awal masuk web
  const [mode, setMode] = useState('sandbox');
  const [activeScenario, setActiveScenario] = useState(null);

  // Daftar ID Misi yang Telah Berhasil Diselesaikan
  const [completedScenarioIds, setCompletedScenarioIds] = useState(() => {
    try {
      const saved = localStorage.getItem('simugrid_completed_missions');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });
  const [celebratedScenarios, setCelebratedScenarios] = useState({});

  // Tata Letak Grid: Mulai dengan grid default Sandbox (Gardu Induk Awal)
  const [gridItems, setGridItems] = useState(() => {
    return SANDBOX_PRESETS[0]?.initialItems
      ? JSON.parse(JSON.stringify(SANDBOX_PRESETS[0].initialItems))
      : [];
  });

  // Pemilihan Tool Aktif dari Palet (null = kursor biasa)
  const [selectedTool, setSelectedTool] = useState(null);

  // Komponen yang Sedang Dipilih/Diinspeksi
  const [selectedItem, setSelectedItem] = useState(null);

  // Status & Konfigurasi Cuaca (Alami Dinamis atau Atur Manual)
  const [weatherConfig, setWeatherConfig] = useState({
    isDynamic: true, // Cuaca alami dinamis aktif otomatis
    presetKey: 'sunny',
    name: 'Cuaca Alami Dinamis',
    solarFactor: 0.85,
    windSpeedMS: 4.8,
    cloudPassing: true,
    windGusts: true
  });

  // Waktu Simulasi (0.0 sampai 24.0 Jam)
  const [simulationHour, setSimulationHour] = useState(12.0); // Default jam 12 siang
  const [isPlaying, setIsPlaying] = useState(true); // Otomatis berjalan dari awal masuk
  const [simSpeed, setSimSpeed] = useState(1);

  // Status Modal
  const [isChallengeModalOpen, setIsChallengeModalOpen] = useState(false);
  const [isEducationModalOpen, setIsEducationModalOpen] = useState(false);
  const [isWeatherModalOpen, setIsWeatherModalOpen] = useState(false);
  const [isMobilePaletteOpen, setIsMobilePaletteOpen] = useState(false);

  // Kalkulasi Anggaran: Bangunan latar belakang misi (isInitial) tidak mengurangi anggaran pemain
  const totalCost = useMemo(() => {
    return gridItems.reduce((acc, item) => {
      if (item.isInitial) return acc;
      const comp = COMPONENT_MAP[item.componentId];
      return acc + (comp?.cost || 0);
    }, 0);
  }, [gridItems]);

  const maxBudget = mode === 'challenge' && activeScenario ? activeScenario.budget : 999000000;
  const remainingBudget = maxBudget - totalCost;

  // Kalkulasi Simulasi 24 Jam Penuh
  const simulationResults = useMemo(() => {
    return simulate24Hours(gridItems, weatherConfig);
  }, [gridItems, weatherConfig]);

  // Kalkulasi Daya Instan pada Jam Tertentu
  const instantPower = useMemo(() => {
    return computeInstantaneousPower(gridItems, simulationHour, weatherConfig);
  }, [gridItems, simulationHour, weatherConfig]);

  // Himpunan Item yang Terhubung Jaringan
  const connectedSet = useMemo(() => {
    return checkGridConnectivity(gridItems);
  }, [gridItems]);

  // Tema Visual Lingkungan (Berubah Dinamis Mengikuti Jam & Cuaca)
  const ambientTheme = useMemo(() => {
    return getAmbientTheme(simulationHour, weatherConfig);
  }, [simulationHour, weatherConfig]);

  // Evaluasi Capaian Misi (Bintang 1-3)
  const evaluationResults = useMemo(() => {
    if (mode !== 'challenge' || !activeScenario) return null;
    return evaluateChallengeCriteria(activeScenario, simulationResults.summary, remainingBudget);
  }, [mode, activeScenario, simulationResults.summary, remainingBudget]);

  // Status Capaian Seluruh Target Misi
  const isMissionTargetsCompleted = useMemo(() => {
    if (mode !== 'challenge' || !activeScenario) return false;
    return isScenarioCompleted(activeScenario, simulationResults.summary, remainingBudget, evaluationResults);
  }, [mode, activeScenario, simulationResults.summary, remainingBudget, evaluationResults]);

  // Efek Perayaan Otomatis saat seluruh target pertama kali terpenuhi di kanvas
  useEffect(() => {
    if (isMissionTargetsCompleted && activeScenario && !celebratedScenarios[activeScenario.id]) {
      setCelebratedScenarios((prev) => ({ ...prev, [activeScenario.id]: true }));
      playSound('victory');
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.5 }
      });
      setCompletedScenarioIds((prev) => {
        if (prev.includes(activeScenario.id)) return prev;
        const next = [...prev, activeScenario.id];
        try {
          localStorage.setItem('simugrid_completed_missions', JSON.stringify(next));
        } catch (e) {}
        return next;
      });
    }
  }, [isMissionTargetsCompleted, activeScenario, celebratedScenarios]);

  // Handler Konfirmasi Misi Selesai
  const handleCompleteScenario = useCallback((scenarioId) => {
    setCompletedScenarioIds((prev) => {
      if (prev.includes(scenarioId)) return prev;
      const next = [...prev, scenarioId];
      try {
        localStorage.setItem('simugrid_completed_missions', JSON.stringify(next));
      } catch (e) {}
      return next;
    });
    playSound('victory');
    confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.6 }
    });
  }, []);

  // Loop Jam Simulasi (Timer Playback)
  useEffect(() => {
    if (!isPlaying) return;

    const intervalMs = 100; // Update setiap 100ms
    const stepIncrement = (0.05 * simSpeed); // Jam per tick

    const timer = setInterval(() => {
      setSimulationHour((prev) => {
        const next = prev + stepIncrement;
        if (next >= 24) {
          return 0; // Looping 24 jam siklus
        }
        return next;
      });
    }, intervalMs);

    return () => clearInterval(timer);
  }, [isPlaying, simSpeed]);

  // Aksi Tambah Komponen ke Kanvas
  const handleAddItem = useCallback(
    (componentId, x, y) => {
      const comp = COMPONENT_MAP[componentId];
      if (!comp) return;

      // Cek apakah anggaran mencukupi jika mode tantangan
      if (mode === 'challenge' && comp.cost > remainingBudget) {
        alert('Anggaran tidak mencukupi untuk memasang komponen ini!');
        playSound('warning');
        return;
      }

      const newItem = {
        id: `item-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        componentId,
        x,
        y,
        enabled: true,
        isInitial: false
      };

      setGridItems((prev) => [...prev, newItem]);
    },
    [mode, remainingBudget]
  );

  // Aksi Hapus Komponen
  const handleRemoveItem = useCallback((itemId) => {
    setGridItems((prev) => prev.filter((i) => i.id !== itemId));
    setSelectedItem((prev) => (prev?.id === itemId ? null : prev));
  }, []);

  // Aksi Toggle Hidup/Mati Komponen
  const handleToggleItem = useCallback((itemId) => {
    setGridItems((prev) =>
      prev.map((i) => (i.id === itemId ? { ...i, enabled: !i.enabled } : i))
    );
    setSelectedItem((prev) =>
      prev?.id === itemId ? { ...prev, enabled: !prev.enabled } : prev
    );
  }, []);

  // Aksi Ubah Mode (Sandbox vs Tantangan)
  const handleSetMode = useCallback((newMode) => {
    if (newMode === 'challenge') {
      if (!activeScenario) {
        // Belum ada misi sama sekali -> langsung munculkan popup misi yang mau dijalankan
        setIsChallengeModalOpen(true);
      }
      setMode('challenge');
    } else {
      setMode('sandbox');
    }
  }, [activeScenario]);

  // Aksi Tutup Modal Tantangan
  const handleCloseChallengeModal = useCallback(() => {
    setIsChallengeModalOpen(false);
    // Jika tidak ada misi aktif dan popup ditutup, kembali otomatis ke mode sandbox
    if (!activeScenario) {
      setMode('sandbox');
    }
  }, [activeScenario]);

  // Aksi Mulai Skenario Misi
  const handleSelectScenario = useCallback((scenario) => {
    setActiveScenario(scenario);
    setMode('challenge');
    setWeatherConfig({
      isDynamic: true,
      presetKey: scenario.weather || 'partly_cloudy',
      name: 'Cuaca Alami Dinamis',
      solarFactor: WEATHER_PROFILES[scenario.weather]?.solarFactor ?? 0.85,
      windSpeedMS: WEATHER_PROFILES[scenario.weather]?.windSpeedMS ?? 4.8,
      cloudPassing: true,
      windGusts: true
    });
    // Bangunan-bangunan sesuai latar belakang misi muncul di kanvas
    const initial = scenario.initialItems
      ? scenario.initialItems.map((item) => ({ ...item, isInitial: true }))
      : [];
    setGridItems(initial);
    setSelectedItem(null);
    setSimulationHour(12.0);
    setIsPlaying(true);
  }, []);

  // Aksi Batalkan Misi Aktif
  const handleCancelScenario = useCallback(() => {
    setActiveScenario(null);
    setMode('sandbox');
    // Bersihkan atau kembalikan ke kanvas default sandbox
    setGridItems(
      SANDBOX_PRESETS[0]?.initialItems
        ? JSON.parse(JSON.stringify(SANDBOX_PRESETS[0].initialItems))
        : []
    );
    setSelectedItem(null);
    playSound('delete');
  }, []);

  // Aksi Reset Grid
  const handleResetGrid = useCallback(() => {
    if (mode === 'challenge' && activeScenario?.initialItems) {
      setGridItems(
        activeScenario.initialItems.map((item) => ({ ...item, isInitial: true }))
      );
    } else {
      setGridItems(
        SANDBOX_PRESETS[0]?.initialItems
          ? JSON.parse(JSON.stringify(SANDBOX_PRESETS[0].initialItems))
          : []
      );
    }
    setSelectedItem(null);
  }, [mode, activeScenario]);

  // Update selectedItem state jika berubah dari luar
  useEffect(() => {
    if (selectedItem) {
      const updated = gridItems.find((i) => i.id === selectedItem.id);
      if (updated) setSelectedItem(updated);
      else setSelectedItem(null);
    }
  }, [gridItems]);

  return (
    <div
      data-theme={ambientTheme.id === 'day' ? 'light' : ambientTheme.id === 'dawn' ? 'dawn' : ambientTheme.id === 'dusk' ? 'dusk' : 'dark'}
      className={`w-screen h-screen flex flex-col ${ambientTheme.appBg} ${ambientTheme.textPrimary} overflow-hidden font-sans transition-all duration-700`}
      style={{ background: ambientTheme.ambientGradient }}
    >
      {/* Top Navbar Header */}
      <TopNavbar
        mode={mode}
        setMode={handleSetMode}
        activeScenario={activeScenario}
        setActiveScenario={setActiveScenario}
        isMissionCompleted={Boolean(
          (activeScenario && completedScenarioIds.includes(activeScenario.id)) ||
          isMissionTargetsCompleted
        )}
        weatherConfig={weatherConfig}
        setWeatherConfig={setWeatherConfig}
        onOpenWeatherModal={() => setIsWeatherModalOpen(true)}
        ambientTheme={ambientTheme}
        simulationHour={simulationHour}
        setSimulationHour={setSimulationHour}
        isPlaying={isPlaying}
        setIsPlaying={setIsPlaying}
        simSpeed={simSpeed}
        setSimSpeed={setSimSpeed}
        budget={maxBudget}
        remainingBudget={remainingBudget}
        onResetGrid={handleResetGrid}
        onOpenEducation={() => setIsEducationModalOpen(true)}
        onOpenChallenges={() => setIsChallengeModalOpen(true)}
      />

      {/* Area Tengah: Sidebar Palet + Kanvas Grid 2D Interaktif */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Banner Mengambang Notifikasi Misi Selesai Real-time */}
        {mode === 'challenge' && activeScenario && isMissionTargetsCompleted && (
          <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-3 px-4 py-2 rounded-2xl bg-emerald-600/95 hover:bg-emerald-600 text-white shadow-xl shadow-emerald-950/40 backdrop-blur-md border border-emerald-400/50 transition-all select-none">
            <Award className="w-5 h-5 text-amber-300 animate-bounce" />
            <span className="text-xs font-bold">
              🎉 Misi Berhasil Diselesaikan! Seluruh target kawasan tercapai.
            </span>
            <button
              onClick={() => setIsChallengeModalOpen(true)}
              className="px-2.5 py-1 rounded-xl bg-white text-emerald-800 font-extrabold text-[11px] shadow-sm hover:bg-emerald-50 active:scale-95 transition-all"
            >
              Misi Selesai
            </button>
          </div>
        )}

        {/* Sisi Kiri: Katalog Komponen (Pembangkit, Baterai, Beban) - Sidebar di desktop, Drawer off-canvas di mobile */}
        <ComponentPalette
          selectedTool={selectedTool}
          onSelectTool={setSelectedTool}
          ambientTheme={ambientTheme}
          isOpenMobile={isMobilePaletteOpen}
          onCloseMobile={() => setIsMobilePaletteOpen(false)}
        />

        {/* Tombol Buka Katalog Komponen (Khusus Layar HP/Tablet < lg saat kursor bebas) */}
        {!selectedTool && (
          <div className="lg:hidden absolute bottom-4 left-4 z-20">
            <button
              onClick={() => {
                setIsMobilePaletteOpen(true);
                playSound('click');
              }}
              className="flex items-center gap-2 px-3.5 py-2.5 rounded-2xl bg-emerald-600/95 hover:bg-emerald-600 text-white font-bold text-xs shadow-lg shadow-emerald-950/40 border border-emerald-400/40 backdrop-blur-md active:scale-95 transition-all"
            >
              <span className="text-sm leading-none">📦</span>
              <span>Katalog Komponen</span>
            </button>
          </div>
        )}

        {/* Status Bar Penempatan Komponen Aktif di Layar HP/Tablet */}
        {selectedTool && (
          <div className="lg:hidden absolute bottom-4 left-3 right-3 sm:left-4 sm:right-auto z-20 flex items-center justify-between gap-2.5 px-3 py-2 rounded-2xl bg-slate-900/95 text-white border border-emerald-500/50 shadow-xl backdrop-blur-md">
            <div className="flex items-center gap-2 min-w-0">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
              <div className="truncate text-xs">
                <span className="text-slate-400">Pasang: </span>
                <span className="font-bold text-emerald-300">
                  {COMPONENT_MAP[selectedTool]?.name}
                </span>
                <span className="text-[10px] text-slate-400 ml-1 hidden sm:inline">(Ketuk ubin)</span>
              </div>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={() => {
                  setIsMobilePaletteOpen(true);
                  playSound('click');
                }}
                className="px-2 py-1 rounded-lg bg-slate-800 text-[11px] font-medium text-slate-200 hover:text-white border border-slate-700 active:scale-95"
              >
                Ganti
              </button>
              <button
                onClick={() => {
                  setSelectedTool(null);
                  playSound('click');
                }}
                className="px-2 py-1 rounded-lg bg-red-600/90 hover:bg-red-600 text-[11px] font-bold text-white shadow-xs active:scale-95"
              >
                ✕ Batal
              </button>
            </div>
          </div>
        )}

        {/* Tengah: Kanvas Interaktif TinkerCAD-style */}
        <GridCanvas
          gridItems={gridItems}
          onAddItem={handleAddItem}
          onRemoveItem={handleRemoveItem}
          selectedTool={selectedTool}
          selectedItem={selectedItem}
          onSelectItem={setSelectedItem}
          connectedSet={connectedSet}
          instantPower={instantPower}
          simulationHour={simulationHour}
          weatherConfig={weatherConfig}
          ambientTheme={ambientTheme}
        />

        {/* Modal Inspektor Detail Komponen Terpilih */}
        <InspectorModal
          selectedItem={selectedItem}
          onClose={() => setSelectedItem(null)}
          onToggleItem={handleToggleItem}
          onRemoveItem={handleRemoveItem}
          simulationState={instantPower}
          connectedSet={connectedSet}
          ambientTheme={ambientTheme}
        />
      </div>

      {/* Panel Bawah: Kurva Aliran Daya 24 Jam & Analisis Kawasan */}
      <EnergyAnalytics
        simulationResults={simulationResults}
        simulationHour={simulationHour}
        instantPower={instantPower}
        onHourClick={setSimulationHour}
        ambientTheme={ambientTheme}
      />

      {/* Modal Dialog Pengatur Cuaca (Alami vs Manual di Sandbox) */}
      <WeatherModal
        isOpen={isWeatherModalOpen}
        onClose={() => setIsWeatherModalOpen(false)}
        weatherConfig={weatherConfig}
        setWeatherConfig={setWeatherConfig}
        simulationHour={simulationHour}
        mode={mode}
        onSwitchToSandbox={() => {
          setMode('sandbox');
          playSound('click');
        }}
        ambientTheme={ambientTheme}
      />

      {/* Modal Dialog Skenario Tantangan */}
      <ChallengeModal
        isOpen={isChallengeModalOpen}
        onClose={handleCloseChallengeModal}
        activeScenario={activeScenario}
        onSelectScenario={handleSelectScenario}
        onCancelScenario={handleCancelScenario}
        onCompleteScenario={handleCompleteScenario}
        completedScenarioIds={completedScenarioIds}
        evaluationResults={evaluationResults}
        summaryStats={simulationResults.summary}
        remainingBudget={remainingBudget}
        ambientTheme={ambientTheme}
      />

      {/* Modal Dialog Edukasi SDG 7 & SDG 11 */}
      <EducationModal
        isOpen={isEducationModalOpen}
        onClose={() => setIsEducationModalOpen(false)}
        ambientTheme={ambientTheme}
      />
    </div>
  );
}
