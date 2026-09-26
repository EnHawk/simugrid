// Sistem Tema Warna Dinamis SimuGrid
// Menyesuaikan tampilan seluruh web app (Dark Theme & Light Theme) secara otomatis berdasarkan waktu 24 jam & cuaca

import { getEffectiveWeatherAtHour } from './simulationEngine';

/**
 * Mendapatkan konfigurasi tema warna lingkungan berdasarkan jam dan cuaca
 */
export function getAmbientTheme(simulationHour, weatherConfig) {
  const eff = getEffectiveWeatherAtHour(simulationHour, weatherConfig);
  const hour = (simulationHour % 24 + 24) % 24;

  // Cek apakah kondisi badai hujan
  const isStormy =
    weatherConfig?.presetKey === 'rainy_storm' ||
    eff.weatherName?.toLowerCase().includes('hujan') ||
    eff.weatherName?.toLowerCase().includes('badai');

  let timePhase = 'night';
  if (isStormy) {
    timePhase = 'storm';
  } else if (hour >= 5.5 && hour < 7.5) {
    timePhase = 'dawn';
  } else if (hour >= 7.5 && hour < 16.5) {
    timePhase = 'day'; // Siang Terik -> FULL LIGHT THEME!
  } else if (hour >= 16.5 && hour < 18.5) {
    timePhase = 'dusk'; // Sore / Sunset Twilight
  } else {
    timePhase = 'night'; // Malam -> FULL DARK THEME!
  }

  // Definisi tema visual lengkap (Light & Dark)
  const THEMES = {
    // 1. Siang Hari (TRUE LIGHT THEME: Bersih, Terang, Elegan ala Clean-Tech Modern)
    day: {
      id: 'day',
      label: 'Siang (Mode Terang)',
      isLight: true,
      appBg: 'bg-slate-50',
      ambientGradient:
        'radial-gradient(ellipse 90% 50% at 50% -10%, rgba(56, 189, 248, 0.15), transparent 70%), linear-gradient(180deg, #f0fdf4 0%, #f8fafc 100%)',
      navbarBg: 'bg-white/95 border-slate-200/90 shadow-sm text-slate-800',
      panelBg: 'bg-white/95 border-slate-200/90 shadow-sm text-slate-800',
      panelHeaderBg: 'bg-slate-50/90 border-slate-200/80 text-slate-800',
      cardBg: 'bg-white hover:bg-slate-50/90 border-slate-200 shadow-xs text-slate-800',
      cardSelectedBg: 'bg-emerald-50/90 border-emerald-500 shadow-md ring-1 ring-emerald-500 text-slate-900',
      subtleBg: 'bg-slate-100/90 border-slate-200 text-slate-700',
      inputBg: 'bg-slate-100 border-slate-300 text-slate-800',
      buttonNeutral: 'bg-white hover:bg-slate-100 border-slate-200 text-slate-700 shadow-xs',
      buttonActive: 'bg-emerald-600 text-white shadow-sm',
      textPrimary: 'text-slate-900',
      textSecondary: 'text-slate-700',
      textMuted: 'text-slate-500',
      accentColor: '#059669', // Emerald Renewable
      borderColor: 'border-slate-200',
      canvas: {
        bgStart: '#f0fdf4', // Soft fresh green meadow tone
        bgEnd: '#f1f5f9',   // Crisp clean technical paper
        gridLine: 'rgba(203, 213, 225, 0.7)',
        gridBorder: 'rgba(16, 185, 129, 0.6)',
        ambientColor: 'rgba(16, 185, 129, 0.08)',
        accentDot: 'rgba(148, 163, 184, 0.6)',
        tileBg: 'rgba(255, 255, 255, 0.95)',
        tileBorder: '#cbd5e1',
        tileText: '#0f172a',
        starfield: false,
        sunGlance: 1.0
      }
    },

    // 2. Pagi / Fajar (GOLDEN MORNING LIGHT THEME: Hangat, Lembut, Sinar Matahari Pagi)
    dawn: {
      id: 'dawn',
      label: 'Pagi (Fajar Keemasan)',
      isLight: true,
      appBg: 'bg-[#fffbeb]',
      ambientGradient:
        'radial-gradient(ellipse 90% 50% at 50% -10%, rgba(251, 191, 36, 0.22), transparent 70%), linear-gradient(180deg, #fffbeb 0%, #fef3c7 100%)',
      navbarBg: 'bg-white/95 border-amber-200/80 shadow-sm text-stone-900',
      panelBg: 'bg-white/95 border-amber-200/80 shadow-sm text-stone-900',
      panelHeaderBg: 'bg-amber-50/80 border-amber-200/70 text-stone-800',
      cardBg: 'bg-white hover:bg-amber-50/60 border-amber-200/80 shadow-xs text-stone-900',
      cardSelectedBg: 'bg-amber-50 border-amber-500 shadow-md ring-1 ring-amber-500 text-stone-900',
      subtleBg: 'bg-amber-50/80 border-amber-200/60 text-stone-700',
      inputBg: 'bg-amber-50 border-amber-200 text-stone-900',
      buttonNeutral: 'bg-white hover:bg-amber-50 border-amber-200 text-stone-700 shadow-xs',
      buttonActive: 'bg-amber-600 text-white shadow-sm',
      textPrimary: 'text-stone-900',
      textSecondary: 'text-stone-700',
      textMuted: 'text-stone-500',
      accentColor: '#d97706', // Warm Amber
      borderColor: 'border-amber-200',
      canvas: {
        bgStart: '#fefce8',
        bgEnd: '#fef3c7',
        gridLine: 'rgba(245, 208, 140, 0.65)',
        gridBorder: 'rgba(245, 158, 11, 0.5)',
        ambientColor: 'rgba(245, 158, 11, 0.1)',
        accentDot: 'rgba(217, 119, 6, 0.45)',
        tileBg: 'rgba(255, 255, 255, 0.95)',
        tileBorder: '#fde68a',
        tileText: '#1c1917',
        starfield: false,
        sunGlance: 0.6
      }
    },

    // 3. Sore / Senja (TWILIGHT SUNSET: Hangat Mewah, Lembayung Senja & Jingga Terbenam)
    dusk: {
      id: 'dusk',
      label: 'Sore (Lembayung Senja)',
      isLight: false,
      appBg: 'bg-[#0e0919]',
      ambientGradient:
        'radial-gradient(ellipse 90% 50% at 50% -10%, rgba(244, 63, 94, 0.22), transparent 75%), radial-gradient(ellipse 60% 40% at 20% 0%, rgba(249, 115, 22, 0.25), transparent 70%), linear-gradient(180deg, #0e0919 0%, #030712 100%)',
      navbarBg: 'bg-[#130e26]/95 border-rose-950/60 text-slate-100',
      panelBg: 'bg-[#130e26]/95 border-rose-950/60 text-slate-100',
      panelHeaderBg: 'bg-[#1a1233]/80 border-rose-950/60 text-slate-200',
      cardBg: 'bg-[#1a1334]/70 hover:bg-[#1a1334] border-rose-900/30 text-slate-200',
      cardSelectedBg: 'bg-rose-950/60 border-rose-500 shadow-md ring-1 ring-rose-500 text-white',
      subtleBg: 'bg-[#16102d]/80 border-rose-950/40 text-slate-300',
      inputBg: 'bg-[#181132] border-rose-900/40 text-slate-200',
      buttonNeutral: 'bg-[#1b1436] hover:bg-[#251b4a] border-rose-950 text-slate-300',
      buttonActive: 'bg-rose-600 text-white shadow-sm',
      textPrimary: 'text-slate-100',
      textSecondary: 'text-slate-300',
      textMuted: 'text-slate-400',
      accentColor: '#f43f5e',
      borderColor: 'border-rose-950',
      canvas: {
        bgStart: '#140e26',
        bgEnd: '#1e1112',
        gridLine: 'rgba(159, 80, 120, 0.35)',
        gridBorder: 'rgba(244, 63, 94, 0.45)',
        ambientColor: 'rgba(244, 63, 94, 0.08)',
        accentDot: 'rgba(244, 63, 94, 0.35)',
        tileBg: 'rgba(28, 20, 48, 0.85)',
        tileBorder: 'rgba(244, 63, 94, 0.4)',
        tileText: '#f8fafc',
        starfield: false,
        sunGlance: 0.3
      }
    },

    // 4. Malam Hari (TRUE DEEP DARK THEME: Kosmik Midnight, Bintang Gemintang, Lampu Kota)
    night: {
      id: 'night',
      label: 'Malam (Mode Gelap)',
      isLight: false,
      appBg: 'bg-[#020617]',
      ambientGradient:
        'radial-gradient(ellipse 90% 50% at 50% -10%, rgba(30, 27, 75, 0.5), transparent 75%), linear-gradient(180deg, #020617 0%, #030712 100%)',
      navbarBg: 'bg-slate-950/95 border-slate-800/80 text-slate-100',
      panelBg: 'bg-slate-950/95 border-slate-800/80 text-slate-100',
      panelHeaderBg: 'bg-slate-900/80 border-slate-800/80 text-slate-200',
      cardBg: 'bg-slate-900/70 hover:bg-slate-900 border-slate-800/80 text-slate-200',
      cardSelectedBg: 'bg-emerald-950/40 border-emerald-500 shadow-md ring-1 ring-emerald-500 text-white',
      subtleBg: 'bg-slate-900/80 border-slate-800/80 text-slate-300',
      inputBg: 'bg-slate-900 border-slate-800 text-slate-100',
      buttonNeutral: 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-300',
      buttonActive: 'bg-emerald-600 text-white shadow-sm',
      textPrimary: 'text-slate-100',
      textSecondary: 'text-slate-300',
      textMuted: 'text-slate-400',
      accentColor: '#10b981',
      borderColor: 'border-slate-800',
      canvas: {
        bgStart: '#020617',
        bgEnd: '#080d1e',
        gridLine: 'rgba(51, 65, 85, 0.35)',
        gridBorder: 'rgba(99, 102, 241, 0.45)',
        ambientColor: 'rgba(129, 140, 248, 0.05)',
        accentDot: 'rgba(129, 140, 248, 0.35)',
        tileBg: 'rgba(30, 41, 59, 0.85)',
        tileBorder: '#475569',
        tileText: '#f8fafc',
        starfield: true,
        sunGlance: 0
      }
    },

    // 5. Hujan & Badai (STORMY GRAY THEME: Mendung Kelabu Dingin, Petir Elektrik)
    storm: {
      id: 'storm',
      label: 'Hujan & Badai',
      isLight: false,
      appBg: 'bg-[#050811]',
      ambientGradient:
        'radial-gradient(ellipse 90% 50% at 50% -10%, rgba(79, 70, 229, 0.28), transparent 75%), linear-gradient(180deg, #050811 0%, #02040a 100%)',
      navbarBg: 'bg-[#070b16]/95 border-indigo-950/60 text-slate-100',
      panelBg: 'bg-[#070b16]/95 border-indigo-950/60 text-slate-100',
      panelHeaderBg: 'bg-[#0b1020]/80 border-indigo-950/60 text-slate-200',
      cardBg: 'bg-slate-900/80 hover:bg-slate-900 border-indigo-950/80 text-slate-200',
      cardSelectedBg: 'bg-indigo-950/50 border-indigo-500 shadow-md ring-1 ring-indigo-500 text-white',
      subtleBg: 'bg-[#090e1c]/80 border-indigo-950/60 text-slate-300',
      inputBg: 'bg-slate-900 border-indigo-950 text-slate-100',
      buttonNeutral: 'bg-slate-900 hover:bg-slate-800 border-indigo-950 text-slate-300',
      buttonActive: 'bg-indigo-600 text-white shadow-sm',
      textPrimary: 'text-slate-100',
      textSecondary: 'text-slate-300',
      textMuted: 'text-slate-400',
      accentColor: '#6366f1',
      borderColor: 'border-indigo-950',
      canvas: {
        bgStart: '#060a14',
        bgEnd: '#090d1c',
        gridLine: 'rgba(71, 85, 105, 0.35)',
        gridBorder: 'rgba(99, 102, 241, 0.5)',
        ambientColor: 'rgba(99, 102, 241, 0.08)',
        accentDot: 'rgba(99, 102, 241, 0.35)',
        tileBg: 'rgba(15, 23, 42, 0.85)',
        tileBorder: '#475569',
        tileText: '#f8fafc',
        starfield: false,
        sunGlance: 0.1
      }
    }
  };

  return THEMES[timePhase] || THEMES.day;
}
