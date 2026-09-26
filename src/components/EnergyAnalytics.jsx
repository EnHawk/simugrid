// Panel Grafik & Analitik Energi 24 Jam SimuGrid
// Menampilkan kurva pembangkitan EBT, kurva beban kawasan, daya baterai, defisit/surplus, dan indikator dampak SDG

import React, { useRef, useEffect, useState } from 'react';
import {
  Zap,
  Battery,
  AlertTriangle,
  Leaf,
  ChevronDown,
  ChevronUp,
  Activity,
  Award,
  TrendingUp
} from 'lucide-react';

export default function EnergyAnalytics({
  simulationResults,
  simulationHour,
  instantPower,
  onHourClick,
  ambientTheme
}) {
  const [isExpanded, setIsExpanded] = useState(() => typeof window !== 'undefined' && window.innerWidth >= 768);
  const chartCanvasRef = useRef(null);
  const [hoveredDataPoint, setHoveredDataPoint] = useState(null);
  const [renderTrigger, setRenderTrigger] = useState(0);

  // Trigger re-render canvas saat animasi expand selesai
  useEffect(() => {
    if (!isExpanded) return;
    const timer = setTimeout(() => {
      setRenderTrigger((prev) => prev + 1);
    }, 320);
    return () => clearTimeout(timer);
  }, [isExpanded]);

  // Pantau perubahan ukuran kontainer canvas secara responsif
  useEffect(() => {
    const canvas = chartCanvasRef.current;
    if (!canvas || !canvas.parentElement) return;
    const ro = new ResizeObserver(() => {
      setRenderTrigger((prev) => prev + 1);
    });
    ro.observe(canvas.parentElement);
    return () => ro.disconnect();
  }, []);

  const hourlyData = simulationResults?.hourlyData || [];
  const summary = simulationResults?.summary || {};

  // Render Grafik Kurva 24 Jam pada HTML5 Canvas
  useEffect(() => {
    const canvas = chartCanvasRef.current;
    if (!canvas || !isExpanded || hourlyData.length === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;

    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;

    ctx.save();
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, rect.width, rect.height);

    const padding = { top: 20, right: 30, bottom: 25, left: 45 };
    const chartW = rect.width - padding.left - padding.right;
    const chartH = rect.height - padding.top - padding.bottom;

    // Hitung batas nilai maksimum untuk skala sumbu Y (kW)
    let maxKW = 20;
    hourlyData.forEach((d) => {
      maxKW = Math.max(maxKW, d.cleanGenKW + d.dieselKW, d.loadKW, d.deficitKW);
    });
    maxKW = Math.ceil(maxKW * 1.15); // Beri ruang margin 15%

    // Fungsi konversi koordinat nilai ke posisi pixel grafik
    const getX = (hour) => padding.left + (hour / 24) * chartW;
    const getY = (val) => padding.top + chartH - (val / maxKW) * chartH;

    // 1. Gambar Garis Grid Horizontal & Label Sumbu Y (kW)
    const isLightMode = Boolean(ambientTheme?.isLight);
    ctx.strokeStyle = isLightMode ? 'rgba(203, 213, 225, 0.75)' : 'rgba(51, 65, 85, 0.35)';
    ctx.lineWidth = 1;
    ctx.fillStyle = isLightMode ? '#64748B' : '#94A3B8';
    ctx.font = '10px monospace';
    ctx.textAlign = 'right';

    const ySteps = 4;
    for (let i = 0; i <= ySteps; i++) {
      const val = Math.round((maxKW / ySteps) * i);
      const y = getY(val);
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(padding.left + chartW, y);
      ctx.stroke();

      ctx.fillText(`${val} kW`, padding.left - 6, y + 3);
    }

    // 2. Gambar Label Sumbu X (Jam 00:00 - 24:00)
    ctx.textAlign = 'center';
    ctx.fillStyle = isLightMode ? '#64748B' : '#94A3B8';
    for (let h = 0; h <= 24; h += 4) {
      const x = getX(h);
      ctx.beginPath();
      ctx.moveTo(x, padding.top + chartH);
      ctx.lineTo(x, padding.top + chartH + 4);
      ctx.stroke();

      ctx.fillText(`${String(h).padStart(2, '0')}:00`, x, padding.top + chartH + 16);
    }

    // 3. Gambar Area Defisit (Pemadaman Listrik / Blackout) jika ada (Merah)
    ctx.fillStyle = isLightMode ? 'rgba(239, 68, 68, 0.15)' : 'rgba(239, 68, 68, 0.2)';
    ctx.beginPath();
    ctx.moveTo(getX(0), getY(0));
    hourlyData.forEach((d) => {
      ctx.lineTo(getX(d.hour), getY(d.deficitKW));
    });
    ctx.lineTo(getX(24), getY(0));
    ctx.closePath();
    ctx.fill();

    // 4. Gambar Area Pembangkitan Energi Bersih (EBT - Hijau / Kuning)
    const genGrad = ctx.createLinearGradient(0, padding.top, 0, padding.top + chartH);
    genGrad.addColorStop(0, isLightMode ? 'rgba(16, 185, 129, 0.35)' : 'rgba(16, 185, 129, 0.45)');
    genGrad.addColorStop(1, 'rgba(16, 185, 129, 0.02)');

    ctx.fillStyle = genGrad;
    ctx.beginPath();
    ctx.moveTo(getX(0), getY(0));
    hourlyData.forEach((d) => {
      ctx.lineTo(getX(d.hour), getY(d.cleanGenKW));
    });
    ctx.lineTo(getX(24), getY(0));
    ctx.closePath();
    ctx.fill();

    // Garis kurva pembangkitan EBT
    ctx.strokeStyle = isLightMode ? '#059669' : '#10B981';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    hourlyData.forEach((d, idx) => {
      const x = getX(d.hour);
      const y = getY(d.cleanGenKW);
      if (idx === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

    // 5. Gambar Garis Kurva Beban Konsumsi Kawasan (Pink / Magenta Putus-putus)
    ctx.strokeStyle = isLightMode ? '#E11D48' : '#F43F5E';
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    hourlyData.forEach((d, idx) => {
      const x = getX(d.hour);
      const y = getY(d.loadKW);
      if (idx === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();
    ctx.setLineDash([]); // Reset line dash

    // 6. Gambar Garis Persentase Baterai SoC (Cyan / Biru)
    ctx.strokeStyle = isLightMode ? '#0284C7' : '#38BDF8';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    hourlyData.forEach((d, idx) => {
      const x = getX(d.hour);
      // Petakan 0-100% ke tinggi grafik
      const y = padding.top + chartH - (d.batterySocPercent / 100) * chartH;
      if (idx === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

    // 7. Kursor Garis Vertikal Waktu Saat Ini (Current Hour Cursor)
    const currentX = getX(simulationHour % 24);
    ctx.strokeStyle = '#F59E0B';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(currentX, padding.top - 5);
    ctx.lineTo(currentX, padding.top + chartH + 5);
    ctx.stroke();

    // Titik kepala kursor
    ctx.fillStyle = '#F59E0B';
    ctx.beginPath();
    ctx.arc(currentX, padding.top - 5, 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }, [hourlyData, simulationHour, ambientTheme?.isLight, renderTrigger, isExpanded]);

  // Klik pada grafik untuk langsung melompat ke jam tersebut (Scrubbing via Chart)
  const handleChartClick = (e) => {
    const canvas = chartCanvasRef.current;
    if (!canvas || !onHourClick) return;

    const rect = canvas.getBoundingClientRect();
    const paddingLeft = 45;
    const paddingRight = 30;
    const chartW = rect.width - paddingLeft - paddingRight;

    const clickX = e.clientX - rect.left - paddingLeft;
    const targetHour = Math.max(0, Math.min(24, (clickX / chartW) * 24));
    onHourClick(targetHour);
  };

  const isDeficitNow = (instantPower?.netPowerKW || 0) < -0.05;

  return (
    <section
      className={`border-t transition-colors duration-500 ${
        ambientTheme?.panelBg || 'bg-slate-950/95 border-slate-800'
      } backdrop-blur-md flex flex-col z-20 select-none`}
    >
      {/* Header Bar Analitik dengan Ticker Live */}
      <div
        className={`h-10 px-4 flex items-center justify-between border-b ${
          ambientTheme?.isLight
            ? 'border-slate-200/90 bg-slate-50/90 text-slate-800'
            : 'border-slate-800/80 bg-slate-900/60'
        }`}
      >
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className={`flex items-center gap-1 text-xs font-bold transition-all duration-200 hover:opacity-80 active:scale-95 py-0.5 px-1 rounded-md ${
              ambientTheme?.isLight ? 'text-slate-800 hover:bg-slate-200/60' : 'text-slate-300 hover:bg-slate-800/60'
            }`}
          >
            <Activity
              className={`w-3.5 h-3.5 ${
                ambientTheme?.isLight ? 'text-emerald-600' : 'text-emerald-400'
              }`}
            />
            <span>Kurva Energi 24 Jam & Analisis Kawasan</span>
            <ChevronDown
              className={`w-3.5 h-3.5 transition-transform duration-300 ease-out ${
                isExpanded ? 'rotate-0' : 'rotate-180'
              }`}
            />
          </button>

          {/* Mini Legend */}
          <div className="hidden md:flex items-center gap-3 text-[11px]">
            <span
              className={`flex items-center gap-1 ${
                ambientTheme?.isLight ? 'text-emerald-700 font-medium' : 'text-emerald-400'
              }`}
            >
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              Pembangkit EBT
            </span>
            <span
              className={`flex items-center gap-1 ${
                ambientTheme?.isLight ? 'text-rose-700 font-medium' : 'text-rose-400'
              }`}
            >
              <span className="w-2.5 h-1 border-t-2 border-dashed border-rose-500" />
              Beban Konsumsi
            </span>
            <span
              className={`flex items-center gap-1 ${
                ambientTheme?.isLight ? 'text-sky-700 font-medium' : 'text-sky-400'
              }`}
            >
              <span className="w-2.5 h-1 bg-sky-400" />
              Daya Baterai (%)
            </span>
            {summary.blackoutHours > 0 && (
              <span
                className={`flex items-center gap-1 font-semibold ${
                  ambientTheme?.isLight ? 'text-red-700' : 'text-red-400'
                }`}
              >
                <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                Defisit ({summary.blackoutHours} Jam)
              </span>
            )}
          </div>
        </div>

        {/* Live Status Neraca Daya */}
        <div className="flex items-center gap-3 text-xs font-mono">
          <div className="flex items-center gap-1.5">
            <span
              className={`text-[11px] ${
                ambientTheme?.isLight ? 'text-slate-600' : 'text-slate-400'
              }`}
            >
              Neraca Daya:
            </span>
            <span
              className={`font-bold px-2 py-0.5 rounded ${
                isDeficitNow
                  ? ambientTheme?.isLight
                    ? 'bg-red-100 text-red-700 border border-red-300 animate-pulse'
                    : 'bg-red-950/80 text-red-400 border border-red-800 animate-pulse'
                  : ambientTheme?.isLight
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  : 'bg-emerald-950/80 text-emerald-400 border border-emerald-800'
              }`}
            >
              {instantPower?.netPowerKW >= 0 ? '+' : ''}
              {instantPower?.netPowerKW?.toFixed(1) || '0.0'} kW
            </span>
          </div>
        </div>
      </div>

      {/* Konten Terbuka (Grafik + KPI Cards) dengan Animasi Slide Down & Collapse Halus */}
      <div
        className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out ${
          isExpanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0 pointer-events-none'
        }`}
      >
        <div className="overflow-hidden max-h-[60vh] lg:max-h-none overflow-y-auto">
          <div
            className={`p-3 grid grid-cols-1 lg:grid-cols-4 gap-3 transition-transform duration-300 ease-out ${
              isExpanded ? 'translate-y-0' : 'translate-y-6'
            }`}
          >
            {/* Sisi Kiri (3 Kolom): Grafik Interaktif 24 Jam */}
            <div
            className={`lg:col-span-3 flex flex-col rounded-xl border p-2.5 ${
              ambientTheme?.isLight
                ? 'bg-white border-slate-200 shadow-xs'
                : 'bg-slate-900/60 border-slate-800/80'
            }`}
          >
            <div
              className={`flex items-center justify-between text-[11px] mb-1 px-2 ${
                ambientTheme?.isLight ? 'text-slate-600' : 'text-slate-400'
              }`}
            >
              <span>Kurva Siklus Harian (Klik titik grafik untuk melompat jam)</span>
              <span
                className={`font-mono font-semibold ${
                  ambientTheme?.isLight ? 'text-emerald-700' : 'text-emerald-400'
                }`}
              >
                Pembangkitan EBT: {instantPower?.cleanGenKW?.toFixed(1) || 0} kW • Beban: {instantPower?.loadKW?.toFixed(1) || 0} kW
              </span>
            </div>

            <div className="relative w-full h-36 cursor-pointer">
              <canvas
                ref={chartCanvasRef}
                onClick={handleChartClick}
                className="w-full h-full block rounded-lg"
              />
            </div>
          </div>

          {/* Sisi Kanan (1 Kolom): Metrik SDG & Performa Ringkas */}
          <div className="grid grid-cols-2 lg:grid-cols-1 gap-2">
            {/* Metrik SDG 7: Bauran Energi Bersih */}
            <div
              className={`border rounded-xl p-2.5 flex flex-col justify-between ${
                ambientTheme?.isLight
                  ? 'bg-white border-slate-200 shadow-xs text-slate-800'
                  : 'bg-slate-900/80 border-slate-800 text-slate-200'
              }`}
            >
              <div
                className={`flex items-center justify-between text-[11px] ${
                  ambientTheme?.isLight ? 'text-slate-600' : 'text-slate-400'
                }`}
              >
                <span
                  className={`flex items-center gap-1 font-semibold ${
                    ambientTheme?.isLight ? 'text-emerald-700' : 'text-emerald-400'
                  }`}
                >
                  <Leaf className="w-3.5 h-3.5" />
                  Bauran EBT
                </span>
                <span
                  className={`font-mono font-bold ${
                    ambientTheme?.isLight ? 'text-slate-900' : 'text-slate-200'
                  }`}
                >
                  {summary.renewablePercentage || 0}%
                </span>
              </div>
              <div
                className={`w-full h-2 rounded-full mt-1.5 overflow-hidden ${
                  ambientTheme?.isLight ? 'bg-slate-100 border border-slate-200' : 'bg-slate-800'
                }`}
              >
                <div
                  className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, summary.renewablePercentage || 0)}%` }}
                />
              </div>
              <div
                className={`text-[10px] mt-1 flex justify-between ${
                  ambientTheme?.isLight ? 'text-slate-600' : 'text-slate-400'
                }`}
              >
                <span>0 Jam Defisit</span>
                <span
                  className={`font-medium ${
                    summary.blackoutHours === 0
                      ? ambientTheme?.isLight
                        ? 'text-emerald-700 font-semibold'
                        : 'text-cyan-400 font-medium'
                      : 'text-amber-600 font-semibold'
                  }`}
                >
                  {summary.blackoutHours === 0 ? '✅ 100% Andal' : `⚠️ ${summary.blackoutHours} Jam Padam`}
                </span>
              </div>
            </div>

            {/* Metrik SDG 11: Emisi Karbon Terhindar */}
            <div
              className={`border rounded-xl p-2.5 flex flex-col justify-between ${
                ambientTheme?.isLight
                  ? 'bg-white border-slate-200 shadow-xs text-slate-800'
                  : 'bg-slate-900/80 border-slate-800 text-slate-200'
              }`}
            >
              <div
                className={`flex items-center justify-between text-[11px] ${
                  ambientTheme?.isLight ? 'text-slate-600' : 'text-slate-400'
                }`}
              >
                <span
                  className={`flex items-center gap-1 font-semibold ${
                    ambientTheme?.isLight ? 'text-cyan-700' : 'text-cyan-400'
                  }`}
                >
                  <Award className="w-3.5 h-3.5" />
                  Reduksi CO2
                </span>
                <span
                  className={`font-mono font-bold ${
                    ambientTheme?.isLight ? 'text-emerald-700' : 'text-emerald-400'
                  }`}
                >
                  +{summary.co2AvoidedKg || 0} kg
                </span>
              </div>
              <div
                className={`text-[10px] mt-1 ${
                  ambientTheme?.isLight ? 'text-slate-600' : 'text-slate-400'
                }`}
              >
                Kawasan bebas polusi batu bara & menghemat biaya bahan bakar fosil.
              </div>
              <div
                className={`text-[10px] font-mono mt-1 flex justify-between pt-1 border-t ${
                  ambientTheme?.isLight ? 'border-slate-200 text-slate-600' : 'border-slate-800 text-slate-400'
                }`}
              >
                <span>Emisi Fosil:</span>
                <span
                  className={
                    summary.co2EmissionsKg > 0
                      ? ambientTheme?.isLight
                        ? 'text-amber-700 font-bold'
                        : 'text-amber-400'
                      : ambientTheme?.isLight
                      ? 'text-emerald-700 font-bold'
                      : 'text-emerald-400'
                  }
                >
                  {summary.co2EmissionsKg || 0} kg CO2
                </span>
              </div>
            </div>
          </div>
          </div>
        </div>
      </div>
    </section>
  );
}
