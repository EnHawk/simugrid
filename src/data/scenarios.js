// Skenario & Profil Cuaca SimuGrid (SDG 7 & SDG 11)

export const WEATHER_PROFILES = {
  sunny: {
    id: 'sunny',
    name: 'Cerah Tropis',
    description: 'Langit cerah benderang, radiasi surya optimal 1.000 W/m² di siang hari. Angin sejuk 3.5 m/s.',
    solarFactor: 1.0,
    windSpeedMS: 3.8,
    ambientTempC: 31,
    icon: 'Sun',
    themeColor: '#F59E0B'
  },
  partly_cloudy: {
    id: 'partly_cloudy',
    name: 'Cerah Berawan',
    description: 'Awan berarak menyebabkan radiasi surya berfluktuasi antara 450-700 W/m². Angin sedang 5.5 m/s.',
    solarFactor: 0.65,
    windSpeedMS: 5.5,
    ambientTempC: 28,
    icon: 'CloudSun',
    themeColor: '#0EA5E9'
  },
  rainy_storm: {
    id: 'rainy_storm',
    name: 'Hujan & Angin Kencang',
    description: 'Mendung gelap mengurangi radiasi surya hingga 20%, namun kecepatan angin melonjak hingga 12.5 m/s.',
    solarFactor: 0.22,
    windSpeedMS: 12.5,
    ambientTempC: 24,
    icon: 'CloudLightning',
    themeColor: '#6366F1'
  },
  windy_night: {
    id: 'windy_night',
    name: 'Malam Berangin',
    description: 'Ketiadaan cahaya matahari menguji daya tahan baterai. Angin malam stabil pada 8.2 m/s.',
    solarFactor: 0.0,
    windSpeedMS: 8.2,
    ambientTempC: 22,
    icon: 'Moon',
    themeColor: '#8B5CF6'
  }
};

export const SCENARIOS = [
  {
    id: 'desa_pesisir',
    title: 'Misi 1: Desa Nelayan Pesisir Mandiri Energi',
    sdgGoal: 'SDG 7 (Akses Energi Bersih & Andal)',
    sdgBadge: 'SDG 7',
    difficulty: 'Pemula',
    budget: 260000000, // Rp 260 Juta
    weather: 'partly_cloudy',
    briefing:
      'Desa nelayan terpencil di pesisir sering mengalami pemadaman listrik dari jaringan utama. Terdapat Puskesmas darurat dan ruang pendingin hasil tangkapan nelayan (Cold Storage) yang tidak boleh mati. Rancang mikrogrid EBT dengan anggaran Rp 260 Juta agar desa mandiri energi!',
    objectivesText: [
      'Nol pemadaman listrik pada Puskesmas & Cold Storage selama 24 jam',
      'Bauran energi terbarukan minimal 85%',
      'Total pengeluaran tidak melebihi anggaran Rp 260 Juta'
    ],
    initialItems: [
      { id: 'cs-1', componentId: 'load_cold_storage', x: 4, y: 5, enabled: true },
      { id: 'hosp-1', componentId: 'load_hospital', x: 8, y: 5, enabled: true },
      { id: 'res-1', componentId: 'load_residential', x: 12, y: 5, enabled: true },
      { id: 'sub-1', componentId: 'grid_substation', x: 8, y: 7, enabled: true },
      // Jalur kabel awal
      { id: 'w-1', componentId: 'power_line', x: 5, y: 5, enabled: true },
      { id: 'w-2', componentId: 'power_line', x: 6, y: 5, enabled: true },
      { id: 'w-3', componentId: 'power_line', x: 7, y: 5, enabled: true },
      { id: 'w-4', componentId: 'power_line', x: 8, y: 6, enabled: true },
      { id: 'w-5', componentId: 'power_line', x: 9, y: 5, enabled: true },
      { id: 'w-6', componentId: 'power_line', x: 10, y: 5, enabled: true },
      { id: 'w-7', componentId: 'power_line', x: 11, y: 5, enabled: true }
    ],
    criteria: {
      star1: (stats) => stats.renewablePercentage >= 70 && stats.blackoutHours <= 3,
      star2: (stats) => stats.renewablePercentage >= 85 && stats.criticalBlackoutHours === 0 && stats.remainingBudget >= 10000000,
      star3: (stats) => stats.renewablePercentage >= 95 && stats.blackoutHours === 0 && stats.fossilUsedKWh === 0
    }
  },
  {
    id: 'kampus_hijau',
    title: 'Misi 2: Smart Eco-Campus 24 Jam',
    sdgGoal: 'SDG 11 (Kawasan Berkelanjutan & Transportasi Ramah Lingkungan)',
    sdgBadge: 'SDG 11',
    difficulty: 'Menengah',
    budget: 450000000, // Rp 450 Juta
    weather: 'sunny',
    briefing:
      'Kampus hijau terpadu ingin mewujudkan kawasan nir-emisi karbon. Beban siang hari sangat tinggi untuk kegiatan akademik, ditambah stasiun pengisian kendaraan listrik (SPKLU). Pada malam hari, asrama membutuhkan pasokan listrik stabil. Buat sistem mikrogrid cerdas dengan kapasitas penyimpanan yang cukup!',
    objectivesText: [
      'Pasok listrik untuk Gedung Kampus, Asrama, dan SPKLU EV',
      'Penyimpanan energi (BESS) sanggup mengalihkan daya surya siang ke asrama malam',
      'Kemandirian energi terbarukan minimal 90% dengan emisi CO2 < 10 kg/hari'
    ],
    initialItems: [
      { id: 'sch-1', componentId: 'load_school', x: 5, y: 4, enabled: true },
      { id: 'res-2', componentId: 'load_residential', x: 11, y: 4, enabled: true },
      { id: 'ev-1', componentId: 'load_ev_station', x: 8, y: 8, enabled: true },
      { id: 'sub-2', componentId: 'grid_substation', x: 8, y: 6, enabled: true },
      // Kabel penghubung awal
      { id: 'w-10', componentId: 'power_line', x: 6, y: 4, enabled: true },
      { id: 'w-11', componentId: 'power_line', x: 7, y: 5, enabled: true },
      { id: 'w-12', componentId: 'power_line', x: 8, y: 5, enabled: true },
      { id: 'w-13', componentId: 'power_line', x: 9, y: 5, enabled: true },
      { id: 'w-14', componentId: 'power_line', x: 10, y: 4, enabled: true },
      { id: 'w-15', componentId: 'power_line', x: 8, y: 7, enabled: true }
    ],
    criteria: {
      star1: (stats) => stats.renewablePercentage >= 75 && stats.blackoutHours <= 2,
      star2: (stats) => stats.renewablePercentage >= 90 && stats.co2EmissionsKg <= 12,
      star3: (stats) => stats.renewablePercentage >= 98 && stats.blackoutHours === 0 && stats.co2EmissionsKg === 0
    }
  },
  {
    id: 'pulau_badai',
    title: 'Misi 3: Ketahanan Pulau Terpencil saat Badai',
    sdgGoal: 'SDG 7 & 13 (Ketahanan Iklim & Transisi Energi)',
    sdgBadge: 'SDG 7 & 13',
    difficulty: 'Tantangan Tinggi',
    budget: 380000000, // Rp 380 Juta
    weather: 'rainy_storm',
    briefing:
      'Sebuah pulau terpencil dilanda hujan deras dan angin badai seharian. Pembangkit surya kehilangan daya lebih dari 75%, tetapi kecepatan angin mencapai 12.5 m/s. Hindari ketergantungan pada Genset Diesel yang mahal dan mencemari lingkungan. Manfaatkan potensi turbin angin dan manajemen baterai!',
    objectivesText: [
      'Gunakan potensi energi bayu (angin kencang) secara maksimal',
      'Minimalkan penggunaan genset fosil (< 20 kWh)',
      'Total durasi pemadaman listrik kurang dari 1 jam'
    ],
    initialItems: [
      { id: 'hosp-3', componentId: 'load_hospital', x: 5, y: 6, enabled: true },
      { id: 'res-3', componentId: 'load_residential', x: 11, y: 6, enabled: true },
      { id: 'com-1', componentId: 'load_commercial', x: 8, y: 9, enabled: true },
      { id: 'sub-3', componentId: 'grid_substation', x: 8, y: 7, enabled: true },
      { id: 'w-20', componentId: 'power_line', x: 6, y: 6, enabled: true },
      { id: 'w-21', componentId: 'power_line', x: 7, y: 6, enabled: true },
      { id: 'w-22', componentId: 'power_line', x: 8, y: 6, enabled: true },
      { id: 'w-23', componentId: 'power_line', x: 9, y: 6, enabled: true },
      { id: 'w-24', componentId: 'power_line', x: 10, y: 6, enabled: true },
      { id: 'w-25', componentId: 'power_line', x: 8, y: 8, enabled: true }
    ],
    criteria: {
      star1: (stats) => stats.blackoutHours <= 3,
      star2: (stats) => stats.blackoutHours <= 1 && stats.fossilUsedKWh <= 25,
      star3: (stats) => stats.blackoutHours === 0 && stats.fossilUsedKWh <= 10 && stats.renewablePercentage >= 95
    }
  }
];

export const SANDBOX_PRESETS = [
  {
    id: 'blank',
    title: 'Kanvas Kosong (Grid Bersih)',
    description: 'Mulai dari awal tanpa komponen awal.',
    initialItems: [
      { id: 'sub-main', componentId: 'grid_substation', x: 7, y: 7, enabled: true }
    ]
  },
  {
    id: 'starter_village',
    title: 'Desa Ramah Lingkungan',
    description: 'Kawasan pemukiman dan puskesmas siap dirancang.',
    initialItems: [
      { id: 'sub-main', componentId: 'grid_substation', x: 7, y: 7, enabled: true },
      { id: 'hosp', componentId: 'load_hospital', x: 5, y: 5, enabled: true },
      { id: 'res', componentId: 'load_residential', x: 9, y: 5, enabled: true },
      { id: 'w1', componentId: 'power_line', x: 6, y: 6, enabled: true },
      { id: 'w2', componentId: 'power_line', x: 8, y: 6, enabled: true },
      { id: 'sol', componentId: 'solar_pv', x: 5, y: 8, enabled: true },
      { id: 'bat', componentId: 'battery_home', x: 9, y: 8, enabled: true }
    ]
  }
];

/**
 * Helper evaluasi capaian target objektif skenario
 */
export const checkTargetMet = (scenarioId, targetIndex, summaryStats, remainingBudget) => {
  if (!summaryStats) return false;
  const hasActivity =
    (summaryStats.totalGenKWh || summaryStats.totalCleanGeneratedKWh || 0) > 0 ||
    (summaryStats.renewablePercentage || 0) > 0;
  if (!hasActivity) return false;

  switch (scenarioId) {
    case 'desa_pesisir':
      if (targetIndex === 0) {
        return (summaryStats.criticalBlackoutHours || 0) === 0 && (summaryStats.blackoutHours || 0) === 0;
      }
      if (targetIndex === 1) {
        return (summaryStats.renewablePercentage || 0) >= 85;
      }
      if (targetIndex === 2) {
        return remainingBudget >= 0;
      }
      return false;

    case 'kampus_hijau':
      if (targetIndex === 0) {
        return (summaryStats.blackoutHours || 0) <= 2;
      }
      if (targetIndex === 1) {
        return (
          (summaryStats.batteryUsageKWh || 0) > 0 ||
          (summaryStats.totalBatteryCapacityKWh || 0) > 0 ||
          ((summaryStats.blackoutHours || 0) === 0 && (summaryStats.totalGenKWh || 0) > 0)
        );
      }
      if (targetIndex === 2) {
        return (summaryStats.renewablePercentage || 0) >= 90 && (summaryStats.co2EmissionsKg || 0) <= 10;
      }
      return false;

    case 'pulau_badai':
      if (targetIndex === 0) {
        return (summaryStats.windGenKWh || 0) > 0;
      }
      if (targetIndex === 1) {
        return (summaryStats.fossilUsedKWh || summaryStats.totalFossilGeneratedKWh || 0) < 20;
      }
      if (targetIndex === 2) {
        return (summaryStats.blackoutHours || 0) <= 1;
      }
      return false;

    default:
      return false;
  }
};

/**
 * Cek apakah semua target pada suatu skenario telah tercapai
 */
export const isScenarioCompleted = (scenario, summaryStats, remainingBudget) => {
  if (!scenario || !summaryStats) return false;
  if (!scenario.objectivesText || scenario.objectivesText.length === 0) return false;
  return scenario.objectivesText.every((_, idx) =>
    checkTargetMet(scenario.id, idx, summaryStats, remainingBudget)
  );
};
