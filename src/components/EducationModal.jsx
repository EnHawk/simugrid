// Modal Edukasi SDG 7 & SDG 11 SimuGrid
// Menjelaskan panduan transisi energi, konsep mikrogrid, intermitensi EBT, BESS, dan glosarium

import React, { useState } from 'react';
import {
  X,
  BookOpen,
  Leaf,
  Sun,
  Battery,
  ShieldAlert,
  Zap,
  Building,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';
import { playSound } from '../utils/audio';

export default function EducationModal({ isOpen, onClose, ambientTheme }) {
  const [activeTab, setActiveTab] = useState('sdg7');

  if (!isOpen) return null;

  const isLight = Boolean(ambientTheme?.isLight);

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-2 sm:p-4 select-none animate-backdrop-in">
      <div
        className={`border rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl flex flex-col max-h-[94vh] sm:max-h-[90vh] animate-modal-pop ${
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
                  ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                  : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
              }`}
            >
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h2 className={`text-sm sm:text-base font-bold ${isLight ? 'text-slate-900' : 'text-slate-100'}`}>
                Pusat Edukasi SDG 7 & SDG 11
              </h2>
              <p className={`text-[11px] sm:text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                Panduan Perencanaan Energi Bersih & Kawasan Berkelanjutan
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

        {/* Tab Navigasi Edukasi */}
        <div
          className={`flex flex-col sm:flex-row border-b p-2 gap-1.5 sm:gap-2 text-xs ${
            isLight ? 'border-slate-200 bg-slate-100/70' : 'border-slate-800 bg-slate-950/50'
          }`}
        >
          <button
            onClick={() => {
              setActiveTab('sdg7');
              playSound('click');
            }}
            className={`flex-1 py-2 px-3 rounded-xl font-semibold transition-all ${
              activeTab === 'sdg7'
                ? isLight
                  ? 'bg-white text-amber-800 border border-amber-300 shadow-xs'
                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : isLight
                ? 'text-slate-600 hover:bg-white/80'
                : 'text-slate-400 hover:bg-slate-800/50'
            }`}
          >
            ☀️ SDG 7: Energi Bersih
          </button>

          <button
            onClick={() => {
              setActiveTab('sdg11');
              playSound('click');
            }}
            className={`flex-1 py-2 px-3 rounded-xl font-semibold transition-all ${
              activeTab === 'sdg11'
                ? isLight
                  ? 'bg-white text-emerald-800 border border-emerald-300 shadow-xs'
                  : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : isLight
                ? 'text-slate-600 hover:bg-white/80'
                : 'text-slate-400 hover:bg-slate-800/50'
            }`}
          >
            🏙️ SDG 11: Kota Berkelanjutan
          </button>

          <button
            onClick={() => {
              setActiveTab('microgrid');
              playSound('click');
            }}
            className={`flex-1 py-2 px-3 rounded-xl font-semibold transition-all ${
              activeTab === 'microgrid'
                ? isLight
                  ? 'bg-white text-cyan-800 border border-cyan-300 shadow-xs'
                  : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                : isLight
                ? 'text-slate-600 hover:bg-white/80'
                : 'text-slate-400 hover:bg-slate-800/50'
            }`}
          >
            ⚡ Konsep Mikrogrid & BESS
          </button>
        </div>

        {/* Konten Tab */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 text-xs leading-relaxed">
          {activeTab === 'sdg7' && (
            <div className="space-y-3">
              <div
                className={`p-3 rounded-xl border ${
                  isLight
                    ? 'bg-amber-50 border-amber-200 text-amber-900'
                    : 'bg-amber-950/30 border-amber-800/50 text-amber-200'
                }`}
              >
                <h3 className={`text-sm font-bold mb-1 ${isLight ? 'text-amber-900' : 'text-amber-300'}`}>
                  SDG 7: Energi Bersih dan Terjangkau (Affordable and Clean Energy)
                </h3>
                <p className={isLight ? 'text-slate-700' : 'text-slate-300'}>
                  Memastikan akses terhadap energi yang terjangkau, andal, berkelanjutan, dan modern bagi semua orang.
                </p>
              </div>

              <h4 className={`font-bold text-xs uppercase tracking-wider mt-2 ${isLight ? 'text-slate-800' : 'text-slate-100'}`}>
                Target Kunci yang Diuji dalam SimuGrid:
              </h4>

              <div className="space-y-2">
                <div
                  className={`p-2.5 rounded-lg border flex items-start gap-2.5 ${
                    isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <strong className={isLight ? 'text-slate-900' : 'text-slate-100'}>Target 7.1 (Akses Universal):</strong>
                    <p className={`mt-0.5 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                      Mencegah terjadinya pemadaman (blackout) terutama pada fasilitas vital seperti Puskesmas dan pendingin obat/makanan.
                    </p>
                  </div>
                </div>

                <div
                  className={`p-2.5 rounded-lg border flex items-start gap-2.5 ${
                    isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <strong className={isLight ? 'text-slate-900' : 'text-slate-100'}>Target 7.2 (Bauran Energi Terbarukan):</strong>
                    <p className={`mt-0.5 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                      Meningkatkan proporsi energi surya, bayu (angin), dan mikrohidro/biomassa hingga mendekati 100% dari total konsumsi harian.
                    </p>
                  </div>
                </div>

                <div
                  className={`p-2.5 rounded-lg border flex items-start gap-2.5 ${
                    isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <strong className={isLight ? 'text-slate-900' : 'text-slate-100'}>Target 7.b (Infrastruktur Bersih):</strong>
                    <p className={`mt-0.5 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                      Membangun jaringan gardu mikrogrid pintar (Smart Microgrid) dan sistem baterai BESS di pulau dan desa pelosok.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'sdg11' && (
            <div className="space-y-3">
              <div
                className={`p-3 rounded-xl border ${
                  isLight
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                    : 'bg-emerald-950/30 border-emerald-800/50 text-emerald-200'
                }`}
              >
                <h3 className={`text-sm font-bold mb-1 ${isLight ? 'text-emerald-900' : 'text-emerald-300'}`}>
                  SDG 11: Kota dan Komunitas yang Berkelanjutan (Sustainable Cities)
                </h3>
                <p className={isLight ? 'text-slate-700' : 'text-slate-300'}>
                  Menjadikan kota dan pemukiman manusia inklusif, aman, tangguh, dan berkelanjutan.
                </p>
              </div>

              <h4 className={`font-bold text-xs uppercase tracking-wider mt-2 ${isLight ? 'text-slate-800' : 'text-slate-100'}`}>
                Penerapan dalam Perencanaan Kawasan:
              </h4>

              <div className="space-y-2">
                <div
                  className={`p-2.5 rounded-lg border flex items-start gap-2.5 ${
                    isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className={isLight ? 'text-slate-900' : 'text-slate-100'}>Target 11.2 (Transportasi Rendah Emisi):</strong>
                    <p className={`mt-0.5 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                      Mengintegrasikan Stasiun Pengisian Kendaraan Listrik (SPKLU) yang ditenagai langsung oleh panel surya lokal, bukan listrik fosil.
                    </p>
                  </div>
                </div>

                <div
                  className={`p-2.5 rounded-lg border flex items-start gap-2.5 ${
                    isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className={isLight ? 'text-slate-900' : 'text-slate-100'}>Target 11.b (Ketahanan Bencana & Iklim):</strong>
                    <p className={`mt-0.5 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                      Kawasan mandiri energi (Islanded Microgrid) mampu tetap menyala dan bertahan meski jaringan transmisi nasional lumpuh saat badai atau gempa.
                    </p>
                  </div>
                </div>

                <div
                  className={`p-2.5 rounded-lg border flex items-start gap-2.5 ${
                    isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className={isLight ? 'text-slate-900' : 'text-slate-100'}>Target 11.6 (Kualitas Udara Kawasan):</strong>
                    <p className={`mt-0.5 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                      Menghindari penggunaan genset solar beremisi jelaga dan gas rumah kaca di tengah pemukiman warga.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'microgrid' && (
            <div className="space-y-3">
              <div
                className={`p-3 rounded-xl border ${
                  isLight
                    ? 'bg-cyan-50 border-cyan-200 text-cyan-900'
                    : 'bg-cyan-950/30 border-cyan-800/50 text-cyan-200'
                }`}
              >
                <h3 className={`text-sm font-bold mb-1 ${isLight ? 'text-cyan-900' : 'text-cyan-300'}`}>
                  Kamus Istilah & Konsep Sistem Mikrogrid
                </h3>
                <p className={isLight ? 'text-slate-700' : 'text-slate-300'}>
                  Prinsip kerja fisika energi yang disimulasikan dalam game SimuGrid.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                <div
                  className={`p-3 rounded-xl border ${
                    isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'
                  }`}
                >
                  <div className={`font-bold mb-1 ${isLight ? 'text-amber-800' : 'text-amber-300'}`}>Intermitensi Energi</div>
                  <p className={`text-[11px] ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                    Sifat alami surya (hanya ada siang) dan angin (kecepatan berubah-ubah). Solusinya adalah memadukan multi-sumber (hibrida) dan penyimpanan energi.
                  </p>
                </div>

                <div
                  className={`p-3 rounded-xl border ${
                    isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'
                  }`}
                >
                  <div className={`font-bold mb-1 ${isLight ? 'text-sky-800' : 'text-sky-300'}`}>BESS & Load Shifting</div>
                  <p className={`text-[11px] ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                    <em>Battery Energy Storage System</em> menyerap kelebihan daya saat matahari terik tengah hari (surplus), lalu mengalirkannya saat warga menyalakan lampu malam hari.
                  </p>
                </div>

                <div
                  className={`p-3 rounded-xl border ${
                    isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'
                  }`}
                >
                  <div className={`font-bold mb-1 ${isLight ? 'text-emerald-800' : 'text-emerald-300'}`}>Perbedaan kW vs kWh</div>
                  <p className={`text-[11px] ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                    <strong>kW (Kilowatt)</strong> adalah daya instan (laju aliran listrik). <strong>kWh (Kilowatt-jam)</strong> adalah kapasitas total energi yang tersimpan atau dikonsumsi seiring waktu.
                  </p>
                </div>

                <div
                  className={`p-3 rounded-xl border ${
                    isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'
                  }`}
                >
                  <div className={`font-bold mb-1 ${isLight ? 'text-rose-800' : 'text-rose-300'}`}>Defisit & Pemadaman Listrik</div>
                  <p className={`text-[11px] ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                    Kondisi saat total konsumsi melebihi kemampuan pembangkit dan baterai sudah kosong. Pada simulator ini, defisit memicu peringatan merah.
                  </p>
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
            className="px-5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition-all shadow-md shadow-emerald-950/20"
          >
            Mengerti, Kembali Merancang
          </button>
        </div>
      </div>
    </div>
  );
}
