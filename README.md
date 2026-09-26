# SimuGrid / Renewable Playground (SDG 7 & SDG 11)

**SimuGrid** adalah web simulator interaktif berbasis kanvas (*browser-based simulation*) mirip TinkerCAD / City-Builder untuk merancang dan mensimulasikan sistem mikrogrid energi bersih kawasan tanpa memerlukan perangkat fisik.

Dibuat **100% menggunakan ekosistem JavaScript (React JSX + HTML5 Canvas API + Tailwind CSS)** yang berjalan murni di peramban pengguna (*client-side*).

---

## 🌟 Fitur Utama

1. **Drag-and-Drop Interactive Grid Canvas (TinkerCAD-style)**:
   - Kanvas 2D responsif 60 FPS dengan dukungan **Zoom**, **Pan (Geser Tampilan)**, dan **Snap-to-Grid**.
   - Animasi rotasi bilah turbin angin dinamis yang berputar sesuai kecepatan angin saat itu.
   - Partikel aliran daya listrik animasi (*energy flow pulses*) yang bergerak dari pembangkit ke baterai dan beban.
   - Pilihan komponen lengkap:
     - **Pembangkit (Generators)**: Solar PV Atap (4 kWp), Solar Farm Kawasan (24 kWp), Turbin Angin Mikro (3.5 kW), Menara Turbin Angin (18 kW), Mikrohidro / Biomassa (8 kW), Genset Diesel Cadangan (15 kW fosil).
     - **Penyimpanan (Storage)**: Baterai Rumah Powerwall (14 kWh), BESS Industri Kontainer (75 kWh).
     - **Beban Konsumsi (Loads)**: Klaster Perumahan, Puskesmas 24 Jam (Kritis), Kampus/Sekolah Hijau, Pusat Usaha/Ruko, SPKLU Stasiun Pengisian EV, Cold Storage Nelayan.
     - **Infrastruktur**: Gardu Mikrogrid Pintar (*Smart Substation*) dan Kabel Distribusi Listrik.

2. **Mesin Simulasi 24 Jam & Cuaca Dinamis**:
   - Kontrol pemutaran: Tombol **Play / Pause**, kecepatan (1x, 2x, 5x), dan *scrubber* garis waktu 24 jam (00:00 - 23:59).
   - 4 Profil Cuaca:
     - **Cerah Tropis**: Radiasi surya puncak 1.000 W/m², angin sejuk 3.5 m/s.
     - **Cerah Berawan**: Radiasi fluktuatif 550 W/m², angin sedang 5.5 m/s.
     - **Hujan & Badai**: Radiasi turun drastis (20%), angin kencang 12.5 m/s.
     - **Malam Berangin**: Radiasi 0 W/m², menguji ketahanan baterai dengan angin 8.2 m/s.

3. **Grafik Real-Time & Panel Analisis KPI 24 Jam**:
   - Grafik interaktif kurva pembangkitan EBT vs kurva permintaan beban harian.
   - Visualisasi kapasitas baterai (*State of Charge %*).
   - Deteksi defisit daya / pemadaman listrik (*Blackout Alert*).
   - Meter neraca daya seketika (+ Surplus / - Defisit kW).
   - Indikator dampak keberlanjutan: Persentase bauran EBT (SDG 7) dan Emisi CO2 Terhindar (SDG 11).

4. **Mode Tantangan (Misi Berjenjang SDG 7 & SDG 11)**:
   - **Misi 1**: *Desa Nelayan Pesisir Mandiri Energi* (SDG 7) — 0 pemadaman Puskesmas & Cold Storage, anggaran Rp 260 Juta.
   - **Misi 2**: *Smart Eco-Campus 24 Jam* (SDG 11) — Kawasan kampus terpadu + SPKLU EV ramah lingkungan, anggaran Rp 450 Juta.
   - **Misi 3**: *Ketahanan Pulau Terpencil saat Badai* (SDG 7 & 13) — Mengatasi cuaca mendung ekstrem tanpa genset diesel, anggaran Rp 380 Juta.
   - Sistem rating **1-3 Bintang** dengan evaluasi objektif dan perayaan konfeti kemenangan!

5. **Mode Sandbox (Bebas Merancang)**:
   - Rancang kawasan mikrogrid sesuka hati tanpa batas anggaran dan tanpa batasan misi.

6. **Audio Synthesizer & Pusat Edukasi Terpadu**:
   - Efek suara sintetis berbasis Web Audio API saat memasang komponen, menghapus, atau menang misi.
   - Panduan edukasi mendalam mengenai SDG 7 & SDG 11, intermitensi energi terbarukan, dan sistem penyimpanan BESS.

---

## 🚀 Cara Menjalankan Aplikasi

Pastikan Node.js sudah terpasang, lalu buka terminal di folder proyek:

```bash
# 1. Jalankan development server
npm run dev

# 2. Buka URL yang tampil di terminal (biasanya http://localhost:5173/) di browser Anda.
```

Untuk membangun versi siap produksi:
```bash
npm run build
npm run preview
```

---

## 🛠️ Teknologi yang Digunakan
- **Bahasa**: 100% JavaScript (`.jsx` dan `.js`)
- **Library Frontend**: React 19
- **Styling**: Tailwind CSS v4
- **Ikon**: Lucide React
- **Efek Konfeti**: Canvas Confetti
- **Audio**: Web Audio API Nirkas
- **Build Tool**: Vite 8
