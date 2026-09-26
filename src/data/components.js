// Katalog Komponen SimuGrid (SDG 7 & SDG 11)
// Seluruh spesifikasi teknis dan biaya disesuaikan dengan skala mikrogrid realistis

export const COMPONENT_CATEGORIES = {
  GENERATOR: 'generator',
  STORAGE: 'storage',
  LOAD: 'load',
  INFRASTRUCTURE: 'infrastructure'
};

export const COMPONENT_CATALOG = [
  // --- Pembangkit Listrik Bersih & Cadangan ---
  {
    id: 'solar_pv',
    name: 'Solar PV Atap',
    category: COMPONENT_CATEGORIES.GENERATOR,
    type: 'solar',
    description: 'Panel surya atap perumahan/kantor. Menghasilkan energi puncak pada tengah hari.',
    ratedPowerKW: 4, // kW peak
    cost: 35000000, // Rp 35 Juta
    sdgImpact: 'SDG 7.2: Peningkatan bauran energi terbarukan lokal',
    color: '#F59E0B',
    accentColor: '#FEF3C7',
    icon: 'Sun',
    size: { w: 1, h: 1 },
    emissionsPerKWh: 0,
    maintenanceCostPerDay: 5000
  },
  {
    id: 'solar_farm',
    name: 'Solar Farm Kawasan',
    category: COMPONENT_CATEGORIES.GENERATOR,
    type: 'solar',
    description: 'Larik panel surya skala komersial untuk kebutuhan daya kawasan besar.',
    ratedPowerKW: 24, // kW peak
    cost: 180000000, // Rp 180 Juta
    sdgImpact: 'SDG 7.b & 11.a: Infrastruktur energi bersih skala kawasan',
    color: '#EAB308',
    accentColor: '#FEF08A',
    icon: 'SunMedium',
    size: { w: 1, h: 1 },
    emissionsPerKWh: 0,
    maintenanceCostPerDay: 25000
  },
  {
    id: 'wind_micro',
    name: 'Turbin Angin Mikro',
    category: COMPONENT_CATEGORIES.GENERATOR,
    type: 'wind',
    description: 'Turbin angin kompak untuk area perumahan/pantai. Aktif siang dan malam saat ada angin.',
    ratedPowerKW: 3.5, // kW peak
    cost: 32000000, // Rp 32 Juta
    sdgImpact: 'SDG 7.2: Pemanfaatan energi bayu 24 jam',
    color: '#06B6D4',
    accentColor: '#CFFAFE',
    icon: 'Wind',
    size: { w: 1, h: 1 },
    emissionsPerKWh: 0,
    maintenanceCostPerDay: 8000
  },
  {
    id: 'wind_tower',
    name: 'Menara Turbin Angin',
    category: COMPONENT_CATEGORIES.GENERATOR,
    type: 'wind',
    description: 'Turbin angin tiang tinggi dengan daya besar untuk kawasan pesisir atau perbukitan.',
    ratedPowerKW: 18, // kW peak
    cost: 155000000, // Rp 155 Juta
    sdgImpact: 'SDG 7.b: Pasokan energi angin berkelanjutan',
    color: '#0284C7',
    accentColor: '#BAE6FD',
    icon: 'Disc',
    size: { w: 1, h: 1 },
    emissionsPerKWh: 0,
    maintenanceCostPerDay: 20000
  },
  {
    id: 'biomass_plant',
    name: 'Mikrohidro / Biomassa',
    category: COMPONENT_CATEGORIES.GENERATOR,
    type: 'biomass',
    description: 'Pembangkit baseload stabil 24 jam memanfaatkan aliran air kanal atau limbah biomassa.',
    ratedPowerKW: 8, // kW konstan
    cost: 90000000, // Rp 90 Juta
    sdgImpact: 'SDG 7.2 & 12: Energi bersih baseload dari sumber terbarukan',
    color: '#10B981',
    accentColor: '#D1FAE5',
    icon: 'Droplets',
    size: { w: 1, h: 1 },
    emissionsPerKWh: 0,
    maintenanceCostPerDay: 12000
  },
  {
    id: 'diesel_backup',
    name: 'Genset Diesel Cadangan',
    category: COMPONENT_CATEGORIES.GENERATOR,
    type: 'diesel',
    description: 'Pembangkit fosil cadangan darurat. Menyebabkan polusi udara dan emisi karbon tinggi.',
    ratedPowerKW: 15,
    cost: 45000000, // Rp 45 Juta
    sdgImpact: 'PERINGATAN: Menurunkan skor SDG 7 & SDG 13 (+0.78 kg CO2/kWh)',
    color: '#EF4444',
    accentColor: '#FEE2E2',
    icon: 'Flame',
    size: { w: 1, h: 1 },
    emissionsPerKWh: 0.78, // kg CO2 per kWh
    fuelCostPerKWh: 3200
  },

  // --- Penyimpanan Energi (BESS) ---
  {
    id: 'battery_home',
    name: 'Baterai Rumah (Powerwall)',
    category: COMPONENT_CATEGORIES.STORAGE,
    type: 'battery',
    description: 'Baterai lithium modular untuk menyimpan surplus surya/angin dan menyalurkannya saat malam.',
    capacityKWh: 14, // kWh
    maxDischargeKW: 5, // kW
    maxChargeKW: 4, // kW
    roundTripEfficiency: 0.92,
    cost: 48000000, // Rp 48 Juta
    sdgImpact: 'SDG 7.1: Menjamin kontinuitas listrik saat malam hari',
    color: '#3B82F6',
    accentColor: '#DBEAFE',
    icon: 'BatteryCharging',
    size: { w: 1, h: 1 }
  },
  {
    id: 'battery_grid',
    name: 'BESS Industri Kontainer',
    category: COMPONENT_CATEGORIES.STORAGE,
    type: 'battery',
    description: 'Sistem baterai skala jaringan kapasitas besar untuk stabilitas daya kawasan penuh.',
    capacityKWh: 75, // kWh
    maxDischargeKW: 25, // kW
    maxChargeKW: 20, // kW
    roundTripEfficiency: 0.94,
    cost: 195000000, // Rp 195 Juta
    sdgImpact: 'SDG 7.b & 11.b: Ketahanan sistem energi kawasan terhadap pemadaman',
    color: '#6366F1',
    accentColor: '#E0E7FF',
    icon: 'Cpu',
    size: { w: 1, h: 1 }
  },

  // --- Beban Konsumen Listrik (Loads) ---
  {
    id: 'load_residential',
    name: 'Klaster Perumahan (10 KK)',
    category: COMPONENT_CATEGORIES.LOAD,
    type: 'residential',
    description: 'Pemukiman warga dengan puncak konsumsi pada pagi hari dan malam hari.',
    baseLoadKW: 6.5,
    critical: false,
    cost: 0, // Disediakan kawasan
    sdgImpact: 'SDG 11.1: Pemukiman layak huni dengan akses energi bersih',
    color: '#EC4899',
    accentColor: '#FCE7F3',
    icon: 'Home',
    size: { w: 1, h: 1 },
    // Profil pengali beban 24 jam (00:00 - 23:00)
    hourlyProfile: [
      0.4, 0.35, 0.35, 0.4, 0.55, 0.85, 0.95, 0.8, 0.6, 0.5, 0.45, 0.5,
      0.55, 0.5, 0.45, 0.5, 0.65, 0.85, 1.0, 1.05, 0.95, 0.8, 0.6, 0.45
    ]
  },
  {
    id: 'load_hospital',
    name: 'Puskesmas & Klinik 24 Jam',
    category: COMPONENT_CATEGORIES.LOAD,
    type: 'hospital',
    description: 'Fasilitas kesehatan primer dengan peralatan medis darurat. Pantang padam listrik!',
    baseLoadKW: 7.0,
    critical: true, // Blackout di sini penalti ganda!
    cost: 0,
    sdgImpact: 'SDG 3 & SDG 7.1: Fasilitas kesehatan beroperasi tanpa henti',
    color: '#F43F5E',
    accentColor: '#FFE4E6',
    icon: 'Activity',
    size: { w: 1, h: 1 },
    // Beban relatif datar 24 jam untuk alat medis & pendingin obat
    hourlyProfile: [
      0.8, 0.75, 0.75, 0.8, 0.85, 0.9, 0.95, 1.0, 1.05, 1.05, 1.0, 0.95,
      0.95, 1.0, 1.0, 0.95, 0.95, 0.95, 0.9, 0.9, 0.85, 0.85, 0.8, 0.8
    ]
  },
  {
    id: 'load_school',
    name: 'Sekolah & Kampus Hijau',
    category: COMPONENT_CATEGORIES.LOAD,
    type: 'education',
    description: 'Pusat pendidikan dengan kebutuhan listrik tinggi saat jam belajar siang.',
    baseLoadKW: 11.0,
    critical: false,
    cost: 0,
    sdgImpact: 'SDG 4 & SDG 11: Sarana edukasi cerdas bertenaga surya',
    color: '#8B5CF6',
    accentColor: '#EDE9FE',
    icon: 'GraduationCap',
    size: { w: 1, h: 1 },
    hourlyProfile: [
      0.15, 0.15, 0.15, 0.15, 0.2, 0.4, 0.85, 1.0, 1.1, 1.05, 0.95, 0.85,
      0.9, 0.95, 0.85, 0.65, 0.35, 0.25, 0.2, 0.2, 0.18, 0.15, 0.15, 0.15
    ]
  },
  {
    id: 'load_commercial',
    name: 'Pusat Usaha & Ruko',
    category: COMPONENT_CATEGORIES.LOAD,
    type: 'commercial',
    description: 'Kawasan ekonomi UMKM, toko, dan perkantoran lokal.',
    baseLoadKW: 14.0,
    critical: false,
    cost: 0,
    sdgImpact: 'SDG 8 & SDG 11: Pertumbuhan ekonomi lokal berkelanjutan',
    color: '#D97706',
    accentColor: '#FEF3C7',
    icon: 'Store',
    size: { w: 1, h: 1 },
    hourlyProfile: [
      0.2, 0.2, 0.2, 0.2, 0.25, 0.35, 0.6, 0.85, 1.0, 1.05, 1.1, 1.0,
      0.95, 1.05, 1.1, 1.0, 0.95, 1.0, 1.05, 0.9, 0.65, 0.45, 0.3, 0.25
    ]
  },
  {
    id: 'load_ev_station',
    name: 'SPKLU Stasiun Pengisian EV',
    category: COMPONENT_CATEGORIES.LOAD,
    type: 'transport',
    description: 'Stasiun pengecasan motor & mobil listrik untuk transportasi kota bebas emisi.',
    baseLoadKW: 9.5,
    critical: false,
    cost: 15000000, // Fasilitas tambahan
    sdgImpact: 'SDG 11.2: Transportasi publik & privat ramah lingkungan',
    color: '#059669',
    accentColor: '#A7F3D0',
    icon: 'Zap',
    size: { w: 1, h: 1 },
    hourlyProfile: [
      0.25, 0.2, 0.2, 0.2, 0.3, 0.65, 1.15, 0.9, 0.7, 0.65, 0.85, 1.0,
      0.8, 0.7, 0.65, 0.8, 1.1, 1.2, 0.95, 0.75, 0.6, 0.45, 0.35, 0.25
    ]
  },
  {
    id: 'load_cold_storage',
    name: 'Cold Storage Hasil Nelayan',
    category: COMPONENT_CATEGORIES.LOAD,
    type: 'industrial',
    description: 'Pendingin tangkapan ikan nelayan agar segar dan berharga tinggi.',
    baseLoadKW: 8.0,
    critical: true,
    cost: 0,
    sdgImpact: 'SDG 14 & SDG 11: Ketahanan pangan pesisir bernilai tambah',
    color: '#0284C7',
    accentColor: '#BAE6FD',
    icon: 'ShieldCheck',
    size: { w: 1, h: 1 },
    hourlyProfile: [
      0.9, 0.9, 0.85, 0.85, 0.9, 0.95, 1.0, 1.05, 1.05, 1.0, 1.0, 1.05,
      1.1, 1.1, 1.05, 1.0, 0.95, 0.95, 0.95, 0.9, 0.9, 0.9, 0.85, 0.85
    ]
  },

  // --- Infrastruktur Jaringan Mikrogrid ---
  {
    id: 'grid_substation',
    name: 'Gardu Mikrogrid Pintar',
    category: COMPONENT_CATEGORIES.INFRASTRUCTURE,
    type: 'substation',
    description: 'Pusat kontrol smart microgrid: mengelola aliran daya, stabilisasi frekuensi, dan proteksi jaringan.',
    cost: 25000000,
    sdgImpact: 'SDG 7.b: Otomasi jaringan distribusi listrik cerdas',
    color: '#8B5CF6',
    accentColor: '#EDE9FE',
    icon: 'Network',
    size: { w: 1, h: 1 }
  },
  {
    id: 'power_line',
    name: 'Kabel Distribusi Listrik',
    category: COMPONENT_CATEGORIES.INFRASTRUCTURE,
    type: 'wire',
    description: 'Menghubungkan klaster pembangkit, baterai, dan konsumen di peta kawasan.',
    cost: 2000000, // Rp 2 Juta per petak
    sdgImpact: 'SDG 7.1: Transmisi listrik andal ke seluruh titik kawasan',
    color: '#94A3B8',
    accentColor: '#E2E8F0',
    icon: 'GitCommit',
    size: { w: 1, h: 1 }
  }
];

export const COMPONENT_MAP = Object.fromEntries(
  COMPONENT_CATALOG.map((item) => [item.id, item])
);
