// Modal Skenario Tantangan & Evaluasi Hasil Misi SimuGrid (SDG 7 & SDG 11)
// Dilengkapi penilaian bintang 1-3, perayaan konfeti, status target dinamis, dan penguncian misi aktif

import React, { useState, useEffect } from 'react';
import {
  X,
  Award,
  Star,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Coins,
  CloudSun,
  Lock,
  XCircle,
  AlertTriangle
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { SCENARIOS, checkTargetMet, isScenarioCompleted } from '../data/scenarios';
import { playSound } from '../utils/audio';

export default function ChallengeModal({
  isOpen,
  onClose,
  activeScenario,
  onSelectScenario,
  onCancelScenario,
  onCompleteScenario,
  completedScenarioIds = [],
  evaluationResults,
  summaryStats,
  remainingBudget,
  ambientTheme
}) {
  const [selectedScenarioId, setSelectedScenarioId] = useState(
    activeScenario?.id || SCENARIOS[0].id
  );
  const [shouldRender, setShouldRender] = useState(isOpen);
  const [isClosing, setIsClosing] = useState(false);

  // Animasi Masuk & Keluar Modal
  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      setIsClosing(false);
      if (activeScenario) {
        setSelectedScenarioId(activeScenario.id);
      }
    } else if (shouldRender) {
      setIsClosing(true);
      const timer = setTimeout(() => {
        setShouldRender(false);
        setIsClosing(false);
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [isOpen, activeScenario]);

  // Handler Tutup dengan Animasi Keluar
  const handleClose = () => {
    if (isClosing) return;
    setIsClosing(true);
    setTimeout(() => {
      onClose();
    }, 200);
  };

  if (!shouldRender) return null;

  const currentScenario =
    SCENARIOS.find((s) => s.id === selectedScenarioId) || SCENARIOS[0];

  const hasEvaluation = Boolean(evaluationResults && evaluationResults.stars > 0);
  const isLight = Boolean(ambientTheme?.isLight);

  // Status Misi Sedang Berjalan & Penguncian
  const isCurrentActive = Boolean(activeScenario && activeScenario.id === currentScenario.id);

  // Apakah misi aktif saat ini sudah memenuhi SEMUA target?
  const activeTargetsMet = Boolean(
    activeScenario &&
    isScenarioCompleted(activeScenario, summaryStats, remainingBudget, evaluationResults)
  );

  const isActiveCompleted = Boolean(
    activeScenario &&
    (activeTargetsMet || completedScenarioIds.includes(activeScenario.id) || evaluationResults?.stars === 3)
  );

  // Misi lain terkunci HANYA jika ada misi aktif yang BELUM selesai
  const isMissionLocked = Boolean(activeScenario && !isActiveCompleted);

  const handleStartScenario = () => {
    onSelectScenario(currentScenario);
    playSound('click');
    handleClose();
  };

  const handleCancelClick = () => {
    if (window.confirm(`Batalkan "${currentScenario.title}" dan kembali ke mode Sandbox?`)) {
      if (onCancelScenario) {
        onCancelScenario();
      }
      handleClose();
    }
  };

  const handleCompleteClick = () => {
    if (onCompleteScenario) {
      onCompleteScenario(currentScenario.id);
    }
    triggerConfetti();
  };

  const triggerConfetti = () => {
    playSound('victory');
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  return (
    <div
      onClick={handleClose}
      className={`fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-2 sm:p-4 select-none ${
        isClosing ? 'animate-backdrop-out' : 'animate-backdrop-in'
      }`}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`border rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl flex flex-col max-h-[94vh] sm:max-h-[90vh] ${
          isClosing ? 'animate-modal-pop-out' : 'animate-modal-pop'
        } ${
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
                  ? 'bg-amber-100 text-amber-800 border-amber-300'
                  : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
              }`}
            >
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h2 className={`text-base font-bold ${isLight ? 'text-slate-900' : 'text-slate-100'}`}>
                Mode Misi Tantangan Kawasan
              </h2>
              <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                Uji kemampuan perencanaan sistem mikrogrid bersih berbasis SDG 7 & SDG 11
              </p>
            </div>
          </div>

          <button
            onClick={handleClose}
            className={`p-1.5 rounded-lg transition-all duration-150 hover:scale-110 active:scale-90 ${
              isLight
                ? 'hover:bg-slate-200 text-slate-500 hover:text-slate-900'
                : 'hover:bg-slate-800 text-slate-400 hover:text-slate-200'
            }`}
            title="Tutup jendela tantangan"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Pemilihan Skenario */}
        <div
          className={`grid grid-cols-3 border-b p-2 gap-2 ${
            isLight ? 'border-slate-200 bg-slate-100/70' : 'border-slate-800 bg-slate-950/50'
          }`}
        >
          {SCENARIOS.map((scen, idx) => {
            const isTabActive = selectedScenarioId === scen.id;
            const isThisScenActive = Boolean(activeScenario && activeScenario.id === scen.id);
            const isThisScenCompleted = Boolean(
              completedScenarioIds.includes(scen.id) ||
              (isThisScenActive && isActiveCompleted)
            );
            const isTabLocked = isMissionLocked && !isThisScenActive;

            return (
              <button
                key={scen.id}
                disabled={isTabLocked}
                onClick={() => {
                  if (isTabLocked) {
                    playSound('warning');
                    return;
                  }
                  setSelectedScenarioId(scen.id);
                  playSound('click');
                }}
                className={`p-2.5 rounded-xl text-left transition-all border ${
                  isTabLocked
                    ? isLight
                      ? 'bg-slate-100/60 border-slate-200 text-slate-400 cursor-not-allowed opacity-55'
                      : 'bg-slate-950/40 border-slate-800/60 text-slate-600 cursor-not-allowed opacity-45'
                    : isTabActive
                    ? isLight
                      ? 'bg-white border-emerald-500 text-slate-900 shadow-sm ring-1 ring-emerald-500'
                      : 'bg-emerald-950/60 border-emerald-500/80 text-white shadow-sm'
                    : isLight
                    ? 'bg-white/80 border-slate-200 text-slate-600 hover:bg-white'
                    : 'bg-slate-900/60 border-slate-800/80 text-slate-400 hover:bg-slate-800/50'
                }`}
                title={isTabLocked ? 'Selesaikan atau batalkan misi aktif terlebih dahulu untuk berpindah misi' : scen.title}
              >
                <div className="flex items-center justify-between mb-1">
                  <span
                    className={`text-[10px] uppercase font-bold tracking-wider flex items-center gap-1 ${
                      isTabLocked
                        ? 'text-slate-400'
                        : isLight
                        ? 'text-emerald-700'
                        : 'text-emerald-400'
                    }`}
                  >
                    {isTabLocked && <Lock className="w-2.5 h-2.5 text-slate-400 shrink-0" />}
                    {scen.sdgBadge}
                  </span>
                  {isThisScenCompleted ? (
                    <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
                      <CheckCircle2 className="w-2.5 h-2.5 shrink-0" /> Selesai
                    </span>
                  ) : (
                    <span className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                      {isTabLocked ? 'Terkunci' : scen.difficulty}
                    </span>
                  )}
                </div>
                <div className="text-xs font-semibold truncate flex items-center gap-1">
                  <span>Misi {idx + 1}</span>
                  {isThisScenActive && (
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 shrink-0" title="Misi aktif" />
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Isi Rincian Skenario Terpilih */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {/* Banner Notifikasi jika sedang ada misi aktif yang terkunci */}
          {isMissionLocked && !isCurrentActive && (
            <div
              className={`p-3 rounded-xl border flex items-center gap-2.5 text-xs ${
                isLight
                  ? 'bg-amber-50 border-amber-300 text-amber-900'
                  : 'bg-amber-950/40 border-amber-800/80 text-amber-300'
              }`}
            >
              <Lock className="w-4 h-4 shrink-0 text-amber-500" />
              <span>
                Misi aktif sedang berjalan: <strong>{activeScenario?.title}</strong>. Selesaikan atau batalkan misi tersebut terlebih dahulu jika ingin berpindah ke misi lain.
              </span>
            </div>
          )}

          {/* Banner Misi Berhasil Diselesaikan */}
          {((isCurrentActive && isActiveCompleted) || completedScenarioIds.includes(currentScenario.id)) && (
            <div
              className={`p-4 rounded-xl border flex items-center justify-between gap-3 animate-fade-in ${
                isLight
                  ? 'bg-emerald-50 border-emerald-400 text-emerald-950 shadow-sm'
                  : 'bg-emerald-950/70 border-emerald-600 text-emerald-100 shadow-md'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center shrink-0">
                  <Award className="w-6 h-6 text-emerald-500 animate-bounce" />
                </div>
                <div>
                  <h4 className="font-bold text-sm flex items-center gap-1.5">
                    <span>Misi Berhasil Diselesaikan!</span>
                    <span className="text-base">🎉</span>
                  </h4>
                  <p className={`text-xs mt-0.5 leading-relaxed ${isLight ? 'text-emerald-700' : 'text-emerald-300/90'}`}>
                    Seluruh target kawasan telah tercapai dengan sukses! Anda kini bebas memilih dan menjalankan misi tantangan lainnya.
                  </p>
                </div>
              </div>
              <button
                onClick={triggerConfetti}
                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all active:scale-95 whitespace-nowrap shrink-0"
              >
                Rayakan! 🎊
              </button>
            </div>
          )}

          <div>
            <div className="flex items-center gap-2 mb-1">
              <span
                className={`text-xs font-bold px-2 py-0.5 rounded border ${
                  isLight
                    ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                    : 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                }`}
              >
                {currentScenario.sdgGoal}
              </span>
              <span className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                Tingkat: {currentScenario.difficulty}
              </span>
              {isCurrentActive && (
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30">
                  Sedang Berjalan
                </span>
              )}
            </div>
            <h3 className={`text-lg font-bold ${isLight ? 'text-slate-900' : 'text-slate-100'}`}>
              {currentScenario.title}
            </h3>
            <p
              className={`text-xs mt-2 leading-relaxed p-3 rounded-xl border ${
                isLight
                  ? 'bg-slate-50 border-slate-200 text-slate-700'
                  : 'bg-slate-950/60 border-slate-800 text-slate-300'
              }`}
            >
              {currentScenario.briefing}
            </p>
          </div>

          {/* Info Batasan & Cuaca */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div
              className={`p-3 rounded-xl border flex items-center gap-3 ${
                isLight
                  ? 'bg-slate-50 border-slate-200 text-slate-800'
                  : 'bg-slate-950/60 border-slate-800 text-slate-100'
              }`}
            >
              <Coins className="w-5 h-5 text-amber-500 shrink-0" />
              <div>
                <div className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Pagu Anggaran Misi</div>
                <div className={`font-mono font-bold ${isLight ? 'text-slate-900' : 'text-slate-100'}`}>
                  Rp {(currentScenario.budget / 1000000).toFixed(0)} Juta
                </div>
              </div>
            </div>

            <div
              className={`p-3 rounded-xl border flex items-center gap-3 ${
                isLight
                  ? 'bg-slate-50 border-slate-200 text-slate-800'
                  : 'bg-slate-950/60 border-slate-800 text-slate-100'
              }`}
            >
              <CloudSun className="w-5 h-5 text-sky-500 shrink-0" />
              <div>
                <div className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Kondisi Cuaca Misi</div>
                <div className={`font-semibold ${isLight ? 'text-slate-900' : 'text-slate-100'}`}>
                  {currentScenario.weather === 'partly_cloudy' && 'Cerah Berawan'}
                  {currentScenario.weather === 'sunny' && 'Cerah Tropis'}
                  {currentScenario.weather === 'rainy_storm' && 'Hujan Badai'}
                </div>
              </div>
            </div>
          </div>

          {/* Daftar Target & Simbol Centang (Abu-abu sampai target tercapai) */}
          <div>
            <h4
              className={`text-xs font-bold uppercase tracking-wider mb-2 ${
                isLight ? 'text-slate-500' : 'text-slate-400'
              }`}
            >
              Target Penyelesaian Misi
            </h4>
            <div className="space-y-2">
              {currentScenario.objectivesText.map((obj, i) => {
                const isMet = (isCurrentActive && checkTargetMet(currentScenario.id, i, summaryStats, remainingBudget)) ||
                  completedScenarioIds.includes(currentScenario.id);

                return (
                  <div
                    key={i}
                    className={`flex items-start justify-between gap-2.5 text-xs p-2.5 rounded-xl border transition-all ${
                      isMet
                        ? isLight
                          ? 'bg-emerald-50/90 border-emerald-300 text-emerald-950'
                          : 'bg-emerald-950/40 border-emerald-700/60 text-emerald-200'
                        : isLight
                        ? 'bg-slate-50 border-slate-200 text-slate-600'
                        : 'bg-slate-950/40 border-slate-800/80 text-slate-400'
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      <CheckCircle2
                        className={`w-4 h-4 shrink-0 mt-0.5 transition-colors duration-300 ${
                          isMet
                            ? 'text-emerald-500 fill-emerald-500/20'
                            : isLight
                            ? 'text-slate-400'
                            : 'text-slate-600'
                        }`}
                      />
                      <span className={isMet ? 'font-medium' : ''}>{obj}</span>
                    </div>

                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded shrink-0 ${
                        isMet
                          ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                          : isLight
                          ? 'bg-slate-200 text-slate-500'
                          : 'bg-slate-800 text-slate-500'
                      }`}
                    >
                      {isMet ? 'Tercapai' : 'Belum'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Jika Misi yang sedang aktif sedang dimainkan, tampilkan evaluasi performa real-time */}
          {isCurrentActive && (
            <div
              className={`mt-4 p-4 rounded-xl border ${
                isLight
                  ? 'bg-slate-50 border-emerald-300 text-slate-800'
                  : 'bg-slate-950 border-emerald-900/60'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className={`text-xs font-bold ${isLight ? 'text-slate-800' : 'text-slate-300'}`}>
                  Evaluasi Performa Rancangan Saat Ini:
                </span>
                <div className="flex items-center gap-1">
                  {[1, 2, 3].map((starIdx) => (
                    <Star
                      key={starIdx}
                      className={`w-5 h-5 ${
                        (evaluationResults?.stars || 0) >= starIdx
                          ? 'text-amber-500 fill-amber-500 drop-shadow-sm'
                          : isLight ? 'text-slate-300' : 'text-slate-700'
                      }`}
                    />
                  ))}
                </div>
              </div>

              <div
                className={`grid grid-cols-3 gap-2 text-center text-xs font-mono pt-2 border-t ${
                  isLight ? 'border-slate-200' : 'border-slate-800'
                }`}
              >
                <div>
                  <div className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Bauran EBT</div>
                  <div className={`font-bold ${isLight ? 'text-emerald-700' : 'text-emerald-400'}`}>
                    {summaryStats?.renewablePercentage || 0}%
                  </div>
                </div>
                <div>
                  <div className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Jam Pemadaman</div>
                  <div
                    className={`font-bold ${
                      summaryStats?.blackoutHours === 0
                        ? isLight ? 'text-emerald-700' : 'text-emerald-400'
                        : isLight ? 'text-red-600' : 'text-red-400'
                    }`}
                  >
                    {summaryStats?.blackoutHours || 0} Jam
                  </div>
                </div>
                <div>
                  <div className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Sisa Anggaran</div>
                  <div
                    className={`font-bold ${
                      remainingBudget >= 0
                        ? isLight ? 'text-slate-900' : 'text-slate-200'
                        : isLight ? 'text-red-600' : 'text-red-400'
                    }`}
                  >
                    Rp {(remainingBudget / 1000000).toFixed(0)} Jt
                  </div>
                </div>
              </div>

              {evaluationResults?.stars === 3 && (
                <div
                  className={`mt-3 flex items-center justify-between p-2 rounded-lg text-xs border ${
                    isLight
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                      : 'bg-emerald-950/60 border-emerald-800/80 text-emerald-300'
                  }`}
                >
                  <span>🎉 Sempurna! Misi terselesaikan dengan 3 Bintang!</span>
                  <button
                    onClick={triggerConfetti}
                    className="px-2 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] shadow-xs"
                  >
                    Rayakan! 🎊
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Tombol Aksi */}
        <div
          className={`p-3 sm:p-4 border-t flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 sm:gap-3 ${
            isLight ? 'border-slate-200 bg-slate-50' : 'border-slate-800 bg-slate-950/90'
          }`}
        >
          <div>
            {isCurrentActive && isActiveCompleted && (
              <span className={`text-xs font-semibold flex items-center gap-1.5 ${
                isLight ? 'text-emerald-700' : 'text-emerald-400'
              }`}>
                <CheckCircle2 className="w-4 h-4" />
                <span>Misi selesai! Akses ke misi lain terbuka.</span>
              </span>
            )}
          </div>

          <div className="flex items-center justify-end gap-2 sm:gap-3">
            <button
              onClick={handleClose}
              className={`px-4 py-2 rounded-xl text-xs font-medium transition-colors ${
                isLight ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Tutup
            </button>

            {isCurrentActive ? (
              isActiveCompleted ? (
                <button
                  onClick={handleCompleteClick}
                  className="flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-950/20 transition-all duration-150 active:scale-95"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Misi Selesai</span>
                </button>
              ) : (
                <button
                  onClick={handleCancelClick}
                  className="flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white shadow-md shadow-rose-950/20 transition-all duration-150 active:scale-95"
                >
                  <XCircle className="w-4 h-4" />
                  <span>Batalkan Misi</span>
                </button>
              )
            ) : (
              <button
                disabled={isMissionLocked && !isCurrentActive}
                onClick={handleStartScenario}
                className={`flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold transition-all duration-150 active:scale-95 ${
                  isMissionLocked && !isCurrentActive
                    ? 'bg-slate-700 text-slate-400 cursor-not-allowed opacity-60'
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-950/20'
                }`}
              >
                <span>Mulai Misi Ini</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
