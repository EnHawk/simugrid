// Kanvas Grid 2D Interaktif SimuGrid (TinkerCAD-style & City Builder)
// Menampilkan ubin kawasan, komponen pembangkit/beban, animasi kincir angin, dan partikel aliran energi listrik

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Plus, Minus, Maximize2 } from 'lucide-react';
import { COMPONENT_MAP, COMPONENT_CATEGORIES } from '../data/components';
import { playSound } from '../utils/audio';

const GRID_SIZE = 16;
const CELL_SIZE = 64;

export default function GridCanvas({
  gridItems,
  onAddItem,
  onRemoveItem,
  onToggleItem,
  selectedTool,
  selectedItem,
  onSelectItem,
  simulationState,
  connectedSet,
  ambientTheme
}) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  // Transformasi tampilan (Pan & Zoom)
  const [transform, setTransform] = useState({ x: 0, y: 0, scale: 0.5 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [hoveredCell, setHoveredCell] = useState(null);
  const [hoveredItem, setHoveredItem] = useState(null);
  const hasUserInteractedRef = useRef(false);

  // Animasi rotasi turbin angin & partikel aliran daya
  const animFrameRef = useRef(null);
  const bladeAngleRef = useRef(0);
  const particleOffsetRef = useRef(0);

  // Konversi koordinat layar ke koordinat Grid
  const screenToGrid = useCallback(
    (screenX, screenY) => {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return { x: -1, y: -1 };

      const canvasX = (screenX - rect.left - transform.x) / transform.scale;
      const canvasY = (screenY - rect.top - transform.y) / transform.scale;

      const gridX = Math.floor(canvasX / CELL_SIZE);
      const gridY = Math.floor(canvasY / CELL_SIZE);

      return { x: gridX, y: gridY };
    },
    [transform]
  );

  // Pusatkan tampilan kanvas dengan skala presisi agar pas sempurna di tengah layar sejak awal
  const centerView = useCallback(() => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return;

    const gridPixelWidth = GRID_SIZE * CELL_SIZE; // 1024
    const gridPixelHeight = GRID_SIZE * CELL_SIZE; // 1024

    // Hitung rasio skala agar seluruh grid muat dengan margin estetis di semua ukuran layar
    const paddingX = 48;
    const paddingY = 48;
    const fitScale = Math.min(
      1.0,
      (rect.width - paddingX) / gridPixelWidth,
      (rect.height - paddingY) / gridPixelHeight
    );

    const scale = Math.max(0.35, fitScale);
    const x = Math.round((rect.width - gridPixelWidth * scale) / 2);
    const y = Math.round((rect.height - gridPixelHeight * scale) / 2);

    setTransform({ x, y, scale });
  }, []);

  // Jalankan pemusatan saat awal muat aplikasi
  useEffect(() => {
    centerView();

    const rafId = requestAnimationFrame(() => {
      centerView();
    });

    const timerId = setTimeout(() => {
      centerView();
    }, 80);

    let resizeObserver;
    if (window.ResizeObserver && containerRef.current) {
      resizeObserver = new ResizeObserver(() => {
        if (!hasUserInteractedRef.current) {
          centerView();
        }
      });
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      cancelAnimationFrame(rafId);
      clearTimeout(timerId);
      if (resizeObserver) resizeObserver.disconnect();
    };
  }, [centerView]);

  // Loop Render Canvas 60 FPS
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let isMounted = true;

    const render = () => {
      if (!isMounted) return;

      // Update animasi
      const currentWind = simulationState?.instantPower?.windSpeed || 4;
      bladeAngleRef.current += (currentWind * 0.04);
      particleOffsetRef.current = (particleOffsetRef.current + 1.2) % 100;

      // Handle ukuran DPI tinggi (Retina)
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      if (canvas.width !== rect.width * dpr || canvas.height !== rect.height * dpr) {
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
      }

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, rect.width, rect.height);

      // Gambar background grid luar angkasa / dark studio sesuai tema
      ctx.fillStyle = ambientTheme?.canvas?.bgStart || '#020617';
      ctx.fillRect(0, 0, rect.width, rect.height);

      // Aplikasikan Pan & Zoom
      ctx.save();
      ctx.translate(transform.x, transform.y);
      ctx.scale(transform.scale, transform.scale);

      // 1. Gambar Area Grid Utama (Terrain / Map)
      drawTerrainAndGrid(ctx);

      // 2. Gambar Kabel & Jalur Distribusi
      drawPowerLines(ctx);

      // 3. Gambar Partikel Aliran Daya Listrik (Energy Flow Animation)
      drawEnergyParticles(ctx);

      // 4. Gambar Komponen-komponen yang telah ditempatkan
      drawPlacedComponents(ctx);

      // 5. Gambar Preview Penempatan (Ghost hover)
      drawPlacementPreview(ctx);

      // 6. Gambar Highlight Komponen Terpilih
      if (selectedItem) {
        drawSelectionHalo(ctx, selectedItem);
      }

      ctx.restore();
      ctx.restore();

      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);

    return () => {
      isMounted = false;
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [gridItems, transform, hoveredCell, selectedTool, selectedItem, simulationState, connectedSet, ambientTheme]);

  // --- FUNGSI MENGGAMBAR ELEMEN KANVAS ---

  const drawTerrainAndGrid = (ctx) => {
    const totalW = GRID_SIZE * CELL_SIZE;
    const totalH = GRID_SIZE * CELL_SIZE;

    const bgStart = ambientTheme?.canvas?.bgStart || '#091522';
    const bgEnd = ambientTheme?.canvas?.bgEnd || '#051b1b';
    const gridLine = ambientTheme?.canvas?.gridLine || 'rgba(51, 65, 85, 0.4)';
    const gridBorder = ambientTheme?.canvas?.gridBorder || 'rgba(16, 185, 129, 0.35)';

    // Latar belakang peta grid (gradient dinamis sesuai cuaca & waktu)
    const bgGrad = ctx.createLinearGradient(0, 0, totalW, totalH);
    bgGrad.addColorStop(0, bgStart);
    bgGrad.addColorStop(1, bgEnd);
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, totalW, totalH);

    // Jika malam hari: gambar bintang-bintang kosmik halus di langit kawasan
    if (ambientTheme?.canvas?.starfield) {
      ctx.save();
      ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
      const stars = [
        [1.3, 2.5, 1.2], [3.2, 5.4, 0.8], [6.7, 1.8, 1.4], [11.2, 3.8, 1.0],
        [14.1, 8.2, 1.3], [2.4, 10.6, 1.1], [5.9, 13.2, 0.9], [9.1, 11.5, 1.3],
        [13.8, 14.2, 1.5], [10.2, 6.8, 0.8], [4.5, 8.1, 1.1], [7.9, 3.2, 1.0],
        [14.9, 2.1, 1.2], [1.1, 14.8, 1.3], [12.6, 12.8, 0.9]
      ];
      stars.forEach(([sx, sy, sr]) => {
        ctx.beginPath();
        ctx.arc(sx * CELL_SIZE, sy * CELL_SIZE, sr, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.restore();
    }

    // Border luar kawasan
    ctx.strokeStyle = gridBorder;
    ctx.lineWidth = 2;
    ctx.strokeRect(0, 0, totalW, totalH);

    // Garis-garis petak grid
    ctx.strokeStyle = gridLine;
    ctx.lineWidth = 1;

    for (let x = 0; x <= GRID_SIZE; x++) {
      ctx.beginPath();
      ctx.moveTo(x * CELL_SIZE, 0);
      ctx.lineTo(x * CELL_SIZE, totalH);
      ctx.stroke();
    }
    for (let y = 0; y <= GRID_SIZE; y++) {
      ctx.beginPath();
      ctx.moveTo(0, y * CELL_SIZE);
      ctx.lineTo(totalW, y * CELL_SIZE);
      ctx.stroke();
    }

    // Titik aksen di sudut-sudut petak (Tactical TinkerCAD style)
    ctx.fillStyle =
      ambientTheme?.id === 'night'
        ? 'rgba(129, 140, 248, 0.35)'
        : ambientTheme?.id === 'dawn'
        ? 'rgba(245, 158, 11, 0.35)'
        : 'rgba(148, 163, 184, 0.25)';
    for (let x = 0; x <= GRID_SIZE; x++) {
      for (let y = 0; y <= GRID_SIZE; y++) {
        ctx.beginPath();
        ctx.arc(x * CELL_SIZE, y * CELL_SIZE, 1.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  };

  const drawPowerLines = (ctx) => {
    // Kumpulkan semua kabel
    const wireItems = gridItems.filter((i) => i.componentId === 'power_line' && i.enabled);
    const wireSet = new Set(wireItems.map((w) => `${w.x},${w.y}`));

    ctx.save();
    wireItems.forEach((wire) => {
      const cx = wire.x * CELL_SIZE + CELL_SIZE / 2;
      const cy = wire.y * CELL_SIZE + CELL_SIZE / 2;

      // Gambar koneksi ke 4 arah
      const dirs = [
        { dx: 1, dy: 0 },
        { dx: -1, dy: 0 },
        { dx: 0, dy: 1 },
        { dx: 0, dy: -1 }
      ];

      ctx.strokeStyle = '#64748B';
      ctx.lineWidth = 4;
      ctx.lineCap = 'round';

      dirs.forEach(({ dx, dy }) => {
        const neighborKey = `${wire.x + dx},${wire.y + dy}`;
        // Jika bertetangga dengan kabel lain atau item grid aktif
        const hasNeighbor = gridItems.some((i) => i.x === wire.x + dx && i.y === wire.y + dy && i.enabled);
        if (hasNeighbor) {
          ctx.beginPath();
          ctx.moveTo(cx, cy);
          ctx.lineTo(cx + (dx * CELL_SIZE) / 2, cy + (dy * CELL_SIZE) / 2);
          ctx.stroke();
        }
      });

      // Titik sambungan kabel tengah (Junction Node)
      ctx.fillStyle = '#38BDF8';
      ctx.beginPath();
      ctx.arc(cx, cy, 4, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.restore();
  };

  const drawEnergyParticles = (ctx) => {
    // Aliran energi dari pembangkit aktif ke gardu/beban
    const generators = gridItems.filter((i) => {
      const comp = COMPONENT_MAP[i.componentId];
      return i.enabled && comp?.category === COMPONENT_CATEGORIES.GENERATOR && connectedSet?.has(i.id);
    });
    const loads = gridItems.filter((i) => {
      const comp = COMPONENT_MAP[i.componentId];
      return i.enabled && comp?.category === COMPONENT_CATEGORIES.LOAD && connectedSet?.has(i.id);
    });

    if (generators.length === 0 || loads.length === 0) return;

    ctx.save();
    const progress = (particleOffsetRef.current % 100) / 100;

    generators.forEach((gen, gIdx) => {
      const startX = gen.x * CELL_SIZE + CELL_SIZE / 2;
      const startY = gen.y * CELL_SIZE + CELL_SIZE / 2;

      // Hubungkan ke load terdekat
      loads.forEach((load, lIdx) => {
        if ((gIdx + lIdx) % 2 !== 0) return; // Batasi jalur agar tidak terlalu ramai

        const endX = load.x * CELL_SIZE + CELL_SIZE / 2;
        const endY = load.y * CELL_SIZE + CELL_SIZE / 2;

        const px = startX + (endX - startX) * progress;
        const py = startY + (endY - startY) * progress;

        // Gambar partikel cahaya energi
        ctx.fillStyle = '#10B981';
        ctx.shadowColor = '#10B981';
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(px, py, 2.5, 0, Math.PI * 2);
        ctx.fill();

        // Garis lintasan samar
        ctx.strokeStyle = 'rgba(16, 185, 129, 0.08)';
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 6]);
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(endX, endY);
        ctx.stroke();
      });
    });
    ctx.restore();
  };

  const drawPlacedComponents = (ctx) => {
    gridItems.forEach((item) => {
      const comp = COMPONENT_MAP[item.componentId];
      if (!comp) return;

      const px = item.x * CELL_SIZE;
      const py = item.y * CELL_SIZE;
      const isConnected = connectedSet?.has(item.id);
      const isPowered = isConnected && item.enabled;

      ctx.save();

      const isLightMode = Boolean(ambientTheme?.isLight);

      // Background ubin komponen
      ctx.fillStyle = isLightMode
        ? (isPowered ? (ambientTheme?.canvas?.tileBg || 'rgba(255, 255, 255, 0.95)') : 'rgba(241, 245, 249, 0.85)')
        : (isPowered ? 'rgba(30, 41, 59, 0.85)' : 'rgba(15, 23, 42, 0.6)');
      ctx.strokeStyle = isPowered
        ? comp.color
        : (isLightMode ? (ambientTheme?.canvas?.tileBorder || '#cbd5e1') : '#475569');
      ctx.lineWidth = 1.5;

      // Rounded rectangle ubin
      const r = 8;
      ctx.beginPath();
      ctx.roundRect(px + 3, py + 3, CELL_SIZE - 6, CELL_SIZE - 6, r);
      ctx.fill();
      ctx.stroke();

      // Render Visual Khusus Komponen
      switch (comp.id) {
        case 'solar_pv':
        case 'solar_farm':
          drawSolarPV(ctx, px, py, comp, isPowered);
          break;
        case 'wind_micro':
        case 'wind_tower':
          drawWindTurbine(ctx, px, py, comp, isPowered);
          break;
        case 'biomass_plant':
          drawBiomass(ctx, px, py, comp, isPowered);
          break;
        case 'diesel_backup':
          drawDiesel(ctx, px, py, comp, isPowered);
          break;
        case 'battery_home':
        case 'battery_grid':
          drawBattery(ctx, px, py, comp, isPowered);
          break;
        case 'load_residential':
          drawResidential(ctx, px, py, comp, isPowered);
          break;
        case 'load_hospital':
          drawHospital(ctx, px, py, comp, isPowered);
          break;
        case 'load_school':
          drawSchool(ctx, px, py, comp, isPowered);
          break;
        case 'load_commercial':
          drawCommercial(ctx, px, py, comp, isPowered);
          break;
        case 'load_ev_station':
          drawEVStation(ctx, px, py, comp, isPowered);
          break;
        case 'load_cold_storage':
          drawColdStorage(ctx, px, py, comp, isPowered);
          break;
        case 'grid_substation':
          drawSubstation(ctx, px, py, comp, isPowered);
          break;
        default:
          drawGenericItem(ctx, px, py, comp, isPowered);
      }

      // Mini Badge Status Daya di pojok ubin
      drawComponentStatusBadge(ctx, item, comp, isPowered);

      ctx.restore();
    });
  };

  // --- DRAWERS SPESIFIK UNTUK KOMPONEN ---

  const drawSolarPV = (ctx, x, y, comp, isPowered) => {
    const cx = x + CELL_SIZE / 2;
    const cy = y + CELL_SIZE / 2;

    // Larik panel miring
    ctx.save();
    ctx.fillStyle = isPowered ? '#1E3A8A' : '#1E293B';
    ctx.strokeStyle = '#38BDF8';
    ctx.lineWidth = 1;

    const pw = CELL_SIZE - 18;
    const ph = CELL_SIZE - 22;
    ctx.beginPath();
    ctx.roundRect(cx - pw / 2, cy - ph / 2, pw, ph, 3);
    ctx.fill();
    ctx.stroke();

    // Kisi-kisi silikon fotovoltaik
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
    ctx.beginPath();
    ctx.moveTo(cx - pw / 2, cy);
    ctx.lineTo(cx + pw / 2, cy);
    ctx.moveTo(cx, cy - ph / 2);
    ctx.lineTo(cx, cy + ph / 2);
    ctx.stroke();

    // Pantulan kilau matahari jika siang hari
    if (isPowered && simulationState?.hour >= 6 && simulationState?.hour <= 18) {
      ctx.fillStyle = 'rgba(253, 224, 71, 0.25)';
      ctx.beginPath();
      ctx.moveTo(cx - pw / 2 + 2, cy - ph / 2 + 2);
      ctx.lineTo(cx + pw / 4, cy - ph / 2 + 2);
      ctx.lineTo(cx - pw / 4, cy + ph / 2 - 2);
      ctx.lineTo(cx - pw / 2 + 2, cy + ph / 2 - 2);
      ctx.fill();
    }
    ctx.restore();
  };

  const drawWindTurbine = (ctx, x, y, comp, isPowered) => {
    const cx = x + CELL_SIZE / 2;
    const cy = y + CELL_SIZE / 2;

    ctx.save();
    // Tiang Menara Turbin
    ctx.strokeStyle = '#94A3B8';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(cx, cy + 14);
    ctx.lineTo(cx, cy - 2);
    ctx.stroke();

    // Nacelle (Pusat Hub Kincir)
    ctx.fillStyle = '#F8FAFC';
    ctx.beginPath();
    ctx.arc(cx, cy - 2, 3.5, 0, Math.PI * 2);
    ctx.fill();

    // 3 Bilah Baling-baling yang Berputar (Rotasi dinamis)
    const angle = isPowered ? bladeAngleRef.current : 0;
    const bladeLen = comp.id === 'wind_tower' ? 17 : 12;

    for (let i = 0; i < 3; i++) {
      const a = angle + (i * Math.PI * 2) / 3;
      ctx.strokeStyle = isPowered ? '#38BDF8' : '#64748B';
      ctx.lineWidth = 2.2;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(cx, cy - 2);
      ctx.lineTo(cx + Math.cos(a) * bladeLen, cy - 2 + Math.sin(a) * bladeLen);
      ctx.stroke();
    }
    ctx.restore();
  };

  const drawBiomass = (ctx, x, y, comp, isPowered) => {
    const cx = x + CELL_SIZE / 2;
    const cy = y + CELL_SIZE / 2;

    ctx.save();
    // Tangki silinder pembangkit
    ctx.fillStyle = isPowered ? '#065F46' : '#1F2937';
    ctx.strokeStyle = '#10B981';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(cx - 14, cy - 12, 28, 24, 6);
    ctx.fill();
    ctx.stroke();

    // Ikon tetesan air / daun
    ctx.fillStyle = '#34D399';
    ctx.beginPath();
    ctx.arc(cx, cy, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  };

  const drawDiesel = (ctx, x, y, comp, isPowered) => {
    const cx = x + CELL_SIZE / 2;
    const cy = y + CELL_SIZE / 2;

    ctx.save();
    // Generator box dengan striping peringatan
    ctx.fillStyle = '#374151';
    ctx.strokeStyle = isPowered ? '#EF4444' : '#6B7280';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(cx - 16, cy - 12, 32, 24, 4);
    ctx.fill();
    ctx.stroke();

    // Cerobong asap
    ctx.fillStyle = '#9CA3AF';
    ctx.fillRect(cx + 6, cy - 18, 5, 6);

    // Hazard cross
    ctx.fillStyle = '#EF4444';
    ctx.font = 'bold 10px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('DIESEL', cx, cy);
    ctx.restore();
  };

  const drawBattery = (ctx, x, y, comp, isPowered) => {
    const cx = x + CELL_SIZE / 2;
    const cy = y + CELL_SIZE / 2;

    ctx.save();
    // Wadah baterai
    const bw = 24;
    const bh = 32;
    ctx.fillStyle = '#1E293B';
    ctx.strokeStyle = isPowered ? '#3B82F6' : '#64748B';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(cx - bw / 2, cy - bh / 2, bw, bh, 4);
    ctx.fill();
    ctx.stroke();

    // Terminal baterai atas
    ctx.fillStyle = '#94A3B8';
    ctx.fillRect(cx - 4, cy - bh / 2 - 3, 8, 3);

    // Indikator level isi baterai (State of Charge %)
    const soc = simulationState?.summaryStats?.batterySocPercent ?? 50;
    const fillHeight = (bh - 6) * (soc / 100);

    const fillGrad = ctx.createLinearGradient(0, cy + bh / 2 - 3, 0, cy - bh / 2 + 3);
    fillGrad.addColorStop(0, '#2563EB');
    fillGrad.addColorStop(1, '#60A5FA');

    ctx.fillStyle = fillGrad;
    ctx.fillRect(cx - bw / 2 + 3, cy + bh / 2 - 3 - fillHeight, bw - 6, fillHeight);

    // Teks SoC %
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 9px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${Math.round(soc)}%`, cx, cy);
    ctx.restore();
  };

  const drawResidential = (ctx, x, y, comp, isPowered) => {
    const cx = x + CELL_SIZE / 2;
    const cy = y + CELL_SIZE / 2;

    ctx.save();
    // Atap rumah segitiga
    ctx.fillStyle = '#BE185D';
    ctx.beginPath();
    ctx.moveTo(cx, cy - 14);
    ctx.lineTo(cx + 16, cy - 1);
    ctx.lineTo(cx - 16, cy - 1);
    ctx.closePath();
    ctx.fill();

    // Dinding rumah
    ctx.fillStyle = isPowered ? '#FBCFE8' : '#64748B';
    ctx.fillRect(cx - 13, cy - 1, 26, 17);

    // Jendela berlampu hangat jika menyala
    ctx.fillStyle = isPowered ? '#FDE047' : '#1E293B';
    ctx.fillRect(cx - 9, cy + 3, 6, 6);
    ctx.fillRect(cx + 3, cy + 3, 6, 6);
    ctx.restore();
  };

  const drawHospital = (ctx, x, y, comp, isPowered) => {
    const cx = x + CELL_SIZE / 2;
    const cy = y + CELL_SIZE / 2;

    ctx.save();
    // Gedung utama putih medis
    ctx.fillStyle = isPowered ? '#FFFFFF' : '#94A3B8';
    ctx.beginPath();
    ctx.roundRect(cx - 18, cy - 14, 36, 28, 4);
    ctx.fill();

    // Palang Merah Medis (Red Cross)
    ctx.fillStyle = '#EF4444';
    // Batang vertikal
    ctx.fillRect(cx - 3, cy - 10, 6, 20);
    // Batang horizontal
    ctx.fillRect(cx - 10, cy - 3, 20, 6);

    // Indikator darurat jika mati lampu
    if (!isPowered) {
      ctx.fillStyle = '#DC2626';
      ctx.beginPath();
      ctx.arc(cx, cy - 16, 4, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  };

  const drawSchool = (ctx, x, y, comp, isPowered) => {
    const cx = x + CELL_SIZE / 2;
    const cy = y + CELL_SIZE / 2;

    ctx.save();
    // Gedung sekolah dengan atap mansard & menara jam
    ctx.fillStyle = isPowered ? '#7C3AED' : '#475569';
    ctx.beginPath();
    ctx.roundRect(cx - 18, cy - 10, 36, 22, 3);
    ctx.fill();

    // Menara tengah
    ctx.fillStyle = '#A78BFA';
    ctx.fillRect(cx - 6, cy - 18, 12, 10);

    // Ikon topi wisuda / buku
    ctx.fillStyle = '#EDE9FE';
    ctx.beginPath();
    ctx.arc(cx, cy - 13, 2.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  };

  const drawCommercial = (ctx, x, y, comp, isPowered) => {
    const cx = x + CELL_SIZE / 2;
    const cy = y + CELL_SIZE / 2;

    ctx.save();
    // Gedung ruko / bertingkat
    ctx.fillStyle = isPowered ? '#D97706' : '#4B5563';
    ctx.beginPath();
    ctx.roundRect(cx - 16, cy - 15, 32, 30, 2);
    ctx.fill();

    // Kaca etalase toko
    ctx.fillStyle = isPowered ? '#FEF08A' : '#1F2937';
    ctx.fillRect(cx - 12, cy + 2, 24, 10);
    ctx.restore();
  };

  const drawEVStation = (ctx, x, y, comp, isPowered) => {
    const cx = x + CELL_SIZE / 2;
    const cy = y + CELL_SIZE / 2;

    ctx.save();
    // Kanopi SPKLU
    ctx.fillStyle = '#059669';
    ctx.beginPath();
    ctx.roundRect(cx - 16, cy - 14, 32, 8, 2);
    ctx.fill();

    // Dispenser charger
    ctx.fillStyle = isPowered ? '#A7F3D0' : '#6B7280';
    ctx.fillRect(cx - 8, cy - 6, 16, 20);

    // Simbol Petir Listrik Hijau
    ctx.fillStyle = isPowered ? '#047857' : '#374151';
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('⚡', cx, cy + 4);
    ctx.restore();
  };

  const drawColdStorage = (ctx, x, y, comp, isPowered) => {
    const cx = x + CELL_SIZE / 2;
    const cy = y + CELL_SIZE / 2;

    ctx.save();
    // Gudang pendingin berinsulasi es
    ctx.fillStyle = isPowered ? '#0284C7' : '#334155';
    ctx.beginPath();
    ctx.roundRect(cx - 16, cy - 12, 32, 24, 4);
    ctx.fill();

    // Simbol keping salju / ikan
    ctx.fillStyle = '#E0F2FE';
    ctx.font = '11px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('❄️', cx, cy);
    ctx.restore();
  };

  const drawSubstation = (ctx, x, y, comp, isPowered) => {
    const cx = x + CELL_SIZE / 2;
    const cy = y + CELL_SIZE / 2;

    ctx.save();
    // Trafo utama
    ctx.fillStyle = '#4C1D95';
    ctx.strokeStyle = '#8B5CF6';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(cx - 16, cy - 16, 32, 32, 6);
    ctx.fill();
    ctx.stroke();

    // Insulator keramik tegangan tinggi
    ctx.fillStyle = '#C4B5FD';
    ctx.fillRect(cx - 12, cy - 20, 6, 5);
    ctx.fillRect(cx + 6, cy - 20, 6, 5);

    // Ikon Hub
    ctx.fillStyle = '#A78BFA';
    ctx.beginPath();
    ctx.arc(cx, cy, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  };

  const drawGenericItem = (ctx, x, y, comp, isPowered) => {
    const cx = x + CELL_SIZE / 2;
    const cy = y + CELL_SIZE / 2;
    ctx.save();
    ctx.fillStyle = comp.color || '#64748B';
    ctx.beginPath();
    ctx.arc(cx, cy, 14, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  };

  const drawComponentStatusBadge = (ctx, item, comp, isPowered) => {
    const px = item.x * CELL_SIZE;
    const py = item.y * CELL_SIZE;

    // Mini status dot di kanan atas
    ctx.save();
    ctx.fillStyle = isPowered ? '#10B981' : '#EF4444';
    ctx.shadowColor = isPowered ? '#10B981' : '#EF4444';
    ctx.shadowBlur = 4;
    ctx.beginPath();
    ctx.arc(px + CELL_SIZE - 9, py + 9, 3.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  };

  const drawPlacementPreview = (ctx) => {
    if (!selectedTool || !hoveredCell) return;
    const { x, y } = hoveredCell;
    if (x < 0 || x >= GRID_SIZE || y < 0 || y >= GRID_SIZE) return;

    const comp = COMPONENT_MAP[selectedTool];
    if (!comp) return;

    const isOccupied = gridItems.some((i) => i.x === x && i.y === y);
    const px = x * CELL_SIZE;
    const py = y * CELL_SIZE;

    ctx.save();
    ctx.fillStyle = isOccupied ? 'rgba(239, 68, 68, 0.35)' : 'rgba(16, 185, 129, 0.35)';
    ctx.strokeStyle = isOccupied ? '#EF4444' : '#10B981';
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.roundRect(px + 3, py + 3, CELL_SIZE - 6, CELL_SIZE - 6, 8);
    ctx.fill();
    ctx.stroke();

    // Nama preview item
    ctx.fillStyle = isLightMode ? '#0f172a' : '#F8FAFC';
    ctx.font = 'bold 10px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(comp.name, px + CELL_SIZE / 2, py + CELL_SIZE - 8);
    ctx.restore();
  };

  const drawSelectionHalo = (ctx, item) => {
    const px = item.x * CELL_SIZE;
    const py = item.y * CELL_SIZE;
    const isLightMode = Boolean(ambientTheme?.isLight);

    ctx.save();
    ctx.strokeStyle = isLightMode ? '#0284c7' : '#38BDF8';
    ctx.lineWidth = 2.5;
    ctx.shadowColor = isLightMode ? 'rgba(2, 132, 199, 0.5)' : '#38BDF8';
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.roundRect(px - 1, py - 1, CELL_SIZE + 2, CELL_SIZE + 2, 9);
    ctx.stroke();
    ctx.restore();
  };

  // --- EVENT LISTENERS (MOUSE & INTERACTION) ---

  const handleMouseDown = (e) => {
    hasUserInteractedRef.current = true;

    if (e.button === 1 || e.button === 2 || e.altKey || e.shiftKey) {
      // Pan kanvas dengan klik tengah atau klik kanan atau tombol Alt/Shift
      setIsPanning(true);
      setPanStart({ x: e.clientX - transform.x, y: e.clientY - transform.y });
      return;
    }

    if (e.button === 0) {
      const gridPos = screenToGrid(e.clientX, e.clientY);
      const isOutsideGrid = gridPos.x < 0 || gridPos.x >= GRID_SIZE || gridPos.y < 0 || gridPos.y >= GRID_SIZE;
      const existing = !isOutsideGrid ? gridItems.find((i) => i.x === gridPos.x && i.y === gridPos.y) : null;

      if (selectedTool) {
        if (isOutsideGrid) {
          onSelectItem(null);
          return;
        }

        if (!existing) {
          // Tempatkan item baru dari katalog
          onAddItem(selectedTool, gridPos.x, gridPos.y);
          playSound('place');
        } else {
          // Pilih item untuk inspeksi
          onSelectItem(existing);
          playSound('click');
        }
      } else {
        // Mode seleksi kursor biasa
        if (existing) {
          onSelectItem(existing);
          playSound('click');
        } else {
          onSelectItem(null);
          // Izinkan drag pan dengan klik kiri pada area kosong/luar grid
          setIsPanning(true);
          setPanStart({ x: e.clientX - transform.x, y: e.clientY - transform.y });
        }
      }
    }
  };

  const handleMouseMove = (e) => {
    if (isPanning) {
      setTransform((prev) => ({
        ...prev,
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y
      }));
      return;
    }

    const gridPos = screenToGrid(e.clientX, e.clientY);
    setHoveredCell(gridPos);

    const item = gridItems.find((i) => i.x === gridPos.x && i.y === gridPos.y);
    setHoveredItem(item || null);
  };

  const handleMouseUp = () => {
    setIsPanning(false);
  };

  const handleWheel = (e) => {
    e.preventDefault();
    hasUserInteractedRef.current = true;
    const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
    const newScale = Math.max(0.35, Math.min(2.5, transform.scale * zoomFactor));

    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Zoom terpusat pada posisi pointer mouse
    setTransform((prev) => ({
      scale: newScale,
      x: mouseX - (mouseX - prev.x) * (newScale / prev.scale),
      y: mouseY - (mouseY - prev.y) * (newScale / prev.scale)
    }));
  };

  const handleContextMenu = (e) => {
    e.preventDefault(); // Mencegah popup menu browser
    const gridPos = screenToGrid(e.clientX, e.clientY);
    const existing = gridItems.find((i) => i.x === gridPos.x && i.y === gridPos.y);
    if (existing) {
      onRemoveItem(existing.id);
      playSound('delete');
    }
  };

  // --- HANDLER GESTUR SENTUH / TOUCH UNTUK PONSEL & TABLET ---
  const touchStartPosRef = useRef({ x: 0, y: 0, time: 0 });
  const touchDistanceRef = useRef(0);
  const touchScaleRef = useRef(1);
  const touchPanStartRef = useRef({ x: 0, y: 0 });
  const isTouchPanningRef = useRef(false);
  const touchMovedRef = useRef(false);
  const longPressTimerRef = useRef(null);

  const handleTouchStart = (e) => {
    hasUserInteractedRef.current = true;
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      touchStartPosRef.current = { x: touch.clientX, y: touch.clientY, time: Date.now() };
      touchPanStartRef.current = { x: touch.clientX - transform.x, y: touch.clientY - transform.y };
      isTouchPanningRef.current = true;
      touchMovedRef.current = false;

      // Long press (550ms) untuk opsi hapus/inspeksi komponen
      if (longPressTimerRef.current) clearTimeout(longPressTimerRef.current);
      const gridPos = screenToGrid(touch.clientX, touch.clientY);
      const existing = gridItems.find((i) => i.x === gridPos.x && i.y === gridPos.y);
      if (existing) {
        longPressTimerRef.current = setTimeout(() => {
          if (!touchMovedRef.current) {
            onSelectItem(existing);
            playSound('click');
            if (typeof navigator !== 'undefined' && navigator.vibrate) {
              navigator.vibrate(40);
            }
          }
        }, 550);
      }
    } else if (e.touches.length === 2) {
      // Dua Jari: Pinch-to-zoom & Pan
      if (longPressTimerRef.current) clearTimeout(longPressTimerRef.current);
      isTouchPanningRef.current = false;
      const t1 = e.touches[0];
      const t2 = e.touches[1];
      const dist = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
      touchDistanceRef.current = dist;
      touchScaleRef.current = transform.scale;
      const midX = (t1.clientX + t2.clientX) / 2;
      const midY = (t1.clientY + t2.clientY) / 2;
      touchPanStartRef.current = { x: midX - transform.x, y: midY - transform.y };
    }
  };

  const handleTouchMove = (e) => {
    if (e.touches.length === 1 && isTouchPanningRef.current) {
      const touch = e.touches[0];
      const distMoved = Math.hypot(
        touch.clientX - touchStartPosRef.current.x,
        touch.clientY - touchStartPosRef.current.y
      );
      if (distMoved > 8) {
        touchMovedRef.current = true;
        if (longPressTimerRef.current) clearTimeout(longPressTimerRef.current);
      }

      setTransform((prev) => ({
        ...prev,
        x: touch.clientX - touchPanStartRef.current.x,
        y: touch.clientY - touchPanStartRef.current.y
      }));
    } else if (e.touches.length === 2) {
      touchMovedRef.current = true;
      if (longPressTimerRef.current) clearTimeout(longPressTimerRef.current);
      const t1 = e.touches[0];
      const t2 = e.touches[1];
      const dist = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
      if (touchDistanceRef.current > 0) {
        const scaleFactor = dist / touchDistanceRef.current;
        const newScale = Math.max(0.25, Math.min(2.5, touchScaleRef.current * scaleFactor));
        const rect = canvasRef.current?.getBoundingClientRect();
        if (rect) {
          const midX = (t1.clientX + t2.clientX) / 2 - rect.left;
          const midY = (t1.clientY + t2.clientY) / 2 - rect.top;
          setTransform((prev) => ({
            scale: newScale,
            x: midX - (midX - prev.x) * (newScale / prev.scale),
            y: midY - (midY - prev.y) * (newScale / prev.scale)
          }));
        }
      }
    }
  };

  const handleTouchEnd = (e) => {
    if (longPressTimerRef.current) clearTimeout(longPressTimerRef.current);
    isTouchPanningRef.current = false;

    // Jika jari terangkat tanpa bergeser (Tap gesture)
    if (!touchMovedRef.current && e.changedTouches.length === 1) {
      const touch = e.changedTouches[0];
      const gridPos = screenToGrid(touch.clientX, touch.clientY);
      const isOutsideGrid = gridPos.x < 0 || gridPos.x >= GRID_SIZE || gridPos.y < 0 || gridPos.y >= GRID_SIZE;
      const existing = !isOutsideGrid ? gridItems.find((i) => i.x === gridPos.x && i.y === gridPos.y) : null;

      if (selectedTool) {
        if (!isOutsideGrid) {
          if (!existing) {
            onAddItem(selectedTool, gridPos.x, gridPos.y);
            playSound('place');
            if (typeof navigator !== 'undefined' && navigator.vibrate) {
              navigator.vibrate(25);
            }
          } else {
            onSelectItem(existing);
            playSound('click');
          }
        } else {
          onSelectItem(null);
        }
      } else {
        if (existing) {
          onSelectItem(existing);
          playSound('click');
        } else {
          onSelectItem(null);
        }
      }
    }
  };

  return (
    <div
      ref={containerRef}
      className={`relative flex-1 w-full h-full overflow-hidden bg-slate-950 select-none touch-none ${
        isPanning ? 'cursor-grabbing' : selectedTool ? 'cursor-crosshair' : 'cursor-grab'
      }`}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onWheel={handleWheel}
      onContextMenu={handleContextMenu}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
    >
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full block touch-none" />

      {/* Floating Zoom & Recenter Navigation Widget (Sangat nyaman untuk Ponsel & Tablet) */}
      <div className="absolute bottom-5 right-4 z-20 flex flex-col items-center gap-1.5 p-1 rounded-2xl bg-slate-900/90 backdrop-blur-md border border-slate-700/80 shadow-2xl select-none">
        <button
          onClick={() => {
            hasUserInteractedRef.current = true;
            setTransform((prev) => {
              const newScale = Math.min(2.5, prev.scale * 1.25);
              const rect = canvasRef.current?.getBoundingClientRect();
              const cx = rect ? rect.width / 2 : 0;
              const cy = rect ? rect.height / 2 : 0;
              return {
                scale: newScale,
                x: cx - (cx - prev.x) * (newScale / prev.scale),
                y: cy - (cy - prev.y) * (newScale / prev.scale)
              };
            });
            playSound('click');
          }}
          className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-200 hover:text-white hover:bg-slate-800 active:scale-90 transition-all"
          title="Perbesar (Zoom In)"
        >
          <Plus className="w-4 h-4" />
        </button>

        <button
          onClick={() => {
            hasUserInteractedRef.current = true;
            setTransform((prev) => {
              const newScale = Math.max(0.25, prev.scale * 0.8);
              const rect = canvasRef.current?.getBoundingClientRect();
              const cx = rect ? rect.width / 2 : 0;
              const cy = rect ? rect.height / 2 : 0;
              return {
                scale: newScale,
                x: cx - (cx - prev.x) * (newScale / prev.scale),
                y: cy - (cy - prev.y) * (newScale / prev.scale)
              };
            });
            playSound('click');
          }}
          className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-200 hover:text-white hover:bg-slate-800 active:scale-90 transition-all"
          title="Perkecil (Zoom Out)"
        >
          <Minus className="w-4 h-4" />
        </button>

        <button
          onClick={() => {
            centerView();
            playSound('click');
          }}
          className="w-8 h-8 rounded-xl flex items-center justify-center text-emerald-400 hover:text-emerald-300 hover:bg-slate-800 active:scale-90 transition-all border-t border-slate-800"
          title="Pusatkan Kanvas (Reset View)"
        >
          <Maximize2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Floating Hover Tooltip untuk Inspeksi Cepat */}
      {hoveredItem && !isPanning && (
        <div
          className="absolute pointer-events-none z-20 bg-slate-900/95 backdrop-blur-md border border-slate-700/80 rounded-lg p-2.5 shadow-xl text-xs text-slate-200 max-w-xs transition-all hidden sm:block"
          style={{
            left: Math.min(
              window.innerWidth - 240,
              hoveredItem.x * CELL_SIZE * transform.scale + transform.x + 30
            ),
            top: Math.max(
              20,
              hoveredItem.y * CELL_SIZE * transform.scale + transform.y - 10
            )
          }}
        >
          <div className="font-semibold text-emerald-400 flex items-center justify-between gap-2">
            <span>{COMPONENT_MAP[hoveredItem.componentId]?.name}</span>
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded ${
                connectedSet?.has(hoveredItem.id)
                  ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-700/50'
                  : 'bg-red-950/80 text-red-300 border border-red-700/50'
              }`}
            >
              {connectedSet?.has(hoveredItem.id) ? 'Terhubung' : 'Terputus'}
            </span>
          </div>
          <div className="text-slate-400 mt-1">
            {COMPONENT_MAP[hoveredItem.componentId]?.description}
          </div>
          <div className="mt-1.5 pt-1.5 border-t border-slate-800 flex justify-between font-mono text-[11px]">
            <span className="text-slate-400">Koordinat:</span>
            <span className="text-cyan-300 font-semibold">({hoveredItem.x}, {hoveredItem.y})</span>
          </div>
          <div className="text-[10px] text-slate-400 mt-1 italic">
            Klik untuk opsi detail • Klik-kanan untuk hapus
          </div>
        </div>
      )}
    </div>
  );
}
