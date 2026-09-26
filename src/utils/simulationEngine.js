// Mesin Simulasi Fisika Energi 24 Jam SimuGrid
// Menghitung kurva surya, angin, beban dinamis, aliran daya baterai, emisi karbon, dan evaluasi misi

import { COMPONENT_MAP, COMPONENT_CATEGORIES } from '../data/components';

/**
 * Menghitung kondisi cuaca efektif (alami dinamis atau manual) pada jam tertentu
 */
export function getEffectiveWeatherAtHour(hour, weatherConfig) {
  // Jika mode Cuaca Alami Dinamis aktif:
  if (weatherConfig?.isDynamic) {
    let solarBase = 0;
    if (hour >= 6.0 && hour <= 18.0) {
      const normalizedTime = (hour - 6.0) / 12.0;
      const bell = Math.sin(normalizedTime * Math.PI);
      solarBase = Math.max(0, Math.pow(bell, 1.15));

      // Fluktuasi alami awan berarak (cloud passing)
      if (weatherConfig.cloudPassing !== false) {
        const cloudDip = Math.sin(hour * 4.2) * 0.15 + Math.cos(hour * 8.5) * 0.09;
        solarBase = Math.max(0.08, solarBase * (1.0 + cloudDip));
      }
    }

    // Siklus alami kecepatan angin (angin darat/laut sore hari meningkat)
    const diurnalWind = 4.5 + Math.sin(((hour - 10) / 24) * Math.PI * 2) * 2.8;
    let windSpeed = Math.max(1.0, diurnalWind);

    // Hembusan angin dinamis (wind gusts)
    if (weatherConfig.windGusts !== false) {
      const gust = Math.sin(hour * 5.7) * 1.3 + Math.cos(hour * 11.3) * 0.8;
      windSpeed = Math.max(0.5, windSpeed + gust);
    }

    let weatherName = 'Cerah Alami';
    let icon = 'Sun';
    if (hour < 6 || hour >= 18) {
      weatherName = 'Malam Berangin';
      icon = 'Moon';
    } else if (windSpeed > 8.0) {
      weatherName = 'Sore Berangin Kencang';
      icon = 'Wind';
    } else if (solarBase > 0.75) {
      weatherName = 'Terik Siang Cerah';
      icon = 'Sun';
    } else {
      weatherName = 'Cerah Berawan Dinamis';
      icon = 'CloudSun';
    }

    return {
      solarMultiplier: Math.min(1.0, solarBase),
      windSpeedMS: Number(windSpeed.toFixed(1)),
      weatherName,
      icon,
      isDynamic: true
    };
  }

  // Jika mode Manual / Preset:
  const solarFactor = weatherConfig?.solarFactor ?? 1.0;
  const baseWind = weatherConfig?.windSpeedMS ?? 4.5;

  let solarMultiplier = 0;
  if (hour >= 6.0 && hour <= 18.0) {
    const normalizedTime = (hour - 6.0) / 12.0;
    const bell = Math.sin(normalizedTime * Math.PI);
    solarMultiplier = Math.max(0, Math.pow(bell, 1.2) * solarFactor);
  }

  const diurnal = Math.sin(((hour - 14) / 24) * Math.PI * 2) * 0.8;
  const windSpeed = Math.max(0.5, baseWind + diurnal);

  return {
    solarMultiplier,
    windSpeedMS: Number(windSpeed.toFixed(1)),
    weatherName: weatherConfig?.name || 'Kustom',
    icon: weatherConfig?.icon || 'Sun',
    isDynamic: false
  };
}

/**
 * Menghitung radiasi surya (0.0 - 1.0) berdasarkan jam (0-24) dan faktor cuaca
 */
export function calculateSolarMultiplier(hour, weatherProfile) {
  const eff = getEffectiveWeatherAtHour(hour, weatherProfile);
  return eff.solarMultiplier;
}

/**
 * Menghitung kecepatan angin efektif berdasarkan jam dan profil cuaca
 */
export function calculateWindSpeed(hour, weatherProfile) {
  const eff = getEffectiveWeatherAtHour(hour, weatherProfile);
  return eff.windSpeedMS;
}

/**
 * Menghitung faktor daya turbin angin (0.0 - 1.0)
 * Cut-in: 2.5 m/s, Rated: 11 m/s, Cut-out: 22 m/s
 */
export function calculateWindMultiplier(windSpeed) {
  const vCutIn = 2.5;
  const vRated = 11.0;
  const vCutOut = 22.0;

  if (windSpeed < vCutIn || windSpeed > vCutOut) return 0;
  if (windSpeed >= vRated) return 1.0;

  // Rumus kubik daya angin: P proportional to (v - v_in)^3
  const ratio = (windSpeed - vCutIn) / (vRated - vCutIn);
  return Math.max(0, Math.min(1.0, Math.pow(ratio, 2.5)));
}

/**
 * Mendapatkan nilai beban untuk jam tertentu dengan interpolasi linear
 */
export function calculateLoadValue(component, hour) {
  if (!component.hourlyProfile || component.hourlyProfile.length === 0) {
    return component.baseLoadKW || 0;
  }
  const h0 = Math.floor(hour) % 24;
  const h1 = (h0 + 1) % 24;
  const fraction = hour - Math.floor(hour);

  const val0 = component.hourlyProfile[h0];
  const val1 = component.hourlyProfile[h1];
  const multiplier = val0 + (val1 - val0) * fraction;

  return (component.baseLoadKW || 0) * multiplier;
}

/**
 * Menentukan konektivitas jaringan microgrid
 * Menggunakan Breadth-First Search (BFS) dari Gardu Substation atau melalui kabel (power_line) & ubin bertetangga
 */
export function checkGridConnectivity(gridItems) {
  const connectedSet = new Set();
  if (!gridItems || gridItems.length === 0) return connectedSet;

  // Petakan posisi
  const itemMap = new Map();
  const substations = [];

  gridItems.forEach((item) => {
    if (!item.enabled) return;
    const key = `${item.x},${item.y}`;
    itemMap.set(key, item);
    if (item.componentId === 'grid_substation') {
      substations.push(item);
    }
  });

  // Jika tidak ada substation sama sekali, semua item yang terhubung kabel saling terkoneksi
  const startNodes = substations.length > 0 ? substations : gridItems.filter(i => i.enabled);

  // Jika ada substation, semua dalam radius 5 petak otomatis terhubung ke substation terdekat
  if (substations.length > 0) {
    substations.forEach((sub) => {
      connectedSet.add(sub.id);
      gridItems.forEach((item) => {
        if (!item.enabled) return;
        const dist = Math.hypot(item.x - sub.x, item.y - sub.y);
        if (dist <= 6.0) {
          connectedSet.add(item.id);
        }
      });
    });
  }

  // BFS penelusuran melalui kabel dan tetangga 4-arah
  const queue = [...gridItems.filter((i) => connectedSet.has(i.id))];
  const visited = new Set(queue.map((i) => i.id));

  // Jika belum ada yang terhubung, buat grup terbesar yang terhubung oleh kabel
  if (queue.length === 0 && gridItems.length > 0) {
    const first = gridItems[0];
    queue.push(first);
    visited.add(first.id);
    connectedSet.add(first.id);
  }

  while (queue.length > 0) {
    const current = queue.shift();
    const neighbors = [
      { x: current.x + 1, y: current.y },
      { x: current.x - 1, y: current.y },
      { x: current.x, y: current.y + 1 },
      { x: current.x, y: current.y - 1 }
    ];

    neighbors.forEach((pos) => {
      const neighbor = itemMap.get(`${pos.x},${pos.y}`);
      if (neighbor && !visited.has(neighbor.id)) {
        visited.add(neighbor.id);
        connectedSet.add(neighbor.id);
        queue.push(neighbor);
      }
    });
  }

  // Fallback ramah pemula: jika jumlah item masih sedikit (< 6), sambungkan otomatis agar pengguna tidak bingung
  if (gridItems.length <= 5) {
    gridItems.forEach((i) => connectedSet.add(i.id));
  }

  return connectedSet;
}

/**
 * Menghitung metrik daya instan pada jam tertentu
 */
export function computeInstantaneousPower(gridItems, hour, weatherProfile, batteryState) {
  const connectedSet = checkGridConnectivity(gridItems);

  let solarKW = 0;
  let windKW = 0;
  let biomassKW = 0;
  let dieselKW = 0;
  let loadKW = 0;
  let criticalLoadKW = 0;

  const solarMult = calculateSolarMultiplier(hour, weatherProfile);
  const windSpeed = calculateWindSpeed(hour, weatherProfile);
  const windMult = calculateWindMultiplier(windSpeed);

  gridItems.forEach((item) => {
    if (!item.enabled) return;
    const comp = COMPONENT_MAP[item.componentId];
    if (!comp) return;

    const isConnected = connectedSet.has(item.id);
    if (!isConnected) return; // Item terputus dari jaringan

    if (comp.category === COMPONENT_CATEGORIES.GENERATOR) {
      if (comp.type === 'solar') {
        solarKW += comp.ratedPowerKW * solarMult;
      } else if (comp.type === 'wind') {
        windKW += comp.ratedPowerKW * windMult;
      } else if (comp.type === 'biomass') {
        biomassKW += comp.ratedPowerKW;
      } else if (comp.type === 'diesel') {
        // Genset diesel hanya menyala saat dipanggil atau darurat
        dieselKW += comp.ratedPowerKW;
      }
    } else if (comp.category === COMPONENT_CATEGORIES.LOAD) {
      const currentDraw = calculateLoadValue(comp, hour);
      loadKW += currentDraw;
      if (comp.critical) {
        criticalLoadKW += currentDraw;
      }
    }
  });

  const cleanGenKW = solarKW + windKW + biomassKW;
  const totalGenKW = cleanGenKW + dieselKW;
  const netPowerKW = totalGenKW - loadKW;

  return {
    solarKW,
    windKW,
    biomassKW,
    dieselKW,
    cleanGenKW,
    totalGenKW,
    loadKW,
    criticalLoadKW,
    netPowerKW,
    windSpeed,
    solarMult,
    connectedCount: connectedSet.size
  };
}

/**
 * Menjalankan simulasi penuh 24 jam (00:00 - 24:00)
 * Menghasilkan kurva grafik, status baterai (SoC), defisit/surplus, dan emisi
 */
export function simulate24Hours(gridItems, weatherProfile, initialBatteryState = null) {
  const connectedSet = checkGridConnectivity(gridItems);

  // Kumpulkan total kapasitas dan batas baterai
  let totalBatteryCapacityKWh = 0;
  let totalMaxChargeKW = 0;
  let totalMaxDischargeKW = 0;
  let totalCost = 0;

  gridItems.forEach((item) => {
    const comp = COMPONENT_MAP[item.componentId];
    if (!comp) return;
    totalCost += comp.cost || 0;

    if (item.enabled && connectedSet.has(item.id) && comp.category === COMPONENT_CATEGORIES.STORAGE) {
      totalBatteryCapacityKWh += comp.capacityKWh || 0;
      totalMaxChargeKW += comp.maxChargeKW || 0;
      totalMaxDischargeKW += comp.maxDischargeKW || 0;
    }
  });

  // State awal baterai: default 50% atau sesuai state
  let currentStoredKWh = initialBatteryState?.currentKWh !== undefined
    ? Math.min(totalBatteryCapacityKWh, initialBatteryState.currentKWh)
    : totalBatteryCapacityKWh * 0.5;

  const hourlyData = [];
  let totalCleanGeneratedKWh = 0;
  let totalFossilGeneratedKWh = 0;
  let totalSolarGeneratedKWh = 0;
  let totalWindGeneratedKWh = 0;
  let totalBatteryDischargeKWh = 0;
  let totalConsumedKWh = 0;
  let totalDeficitKWh = 0;
  let totalSurplusKWh = 0;
  let blackoutHours = 0;
  let criticalBlackoutHours = 0;

  // Lakukan simulasi dengan resolusi 0.5 jam (48 langkah)
  const steps = 48;
  const dt = 24 / steps; // 0.5 jam

  for (let s = 0; s < steps; s++) {
    const hour = s * dt;
    const instant = computeInstantaneousPower(gridItems, hour, weatherProfile, null);

    let cleanGen = instant.cleanGenKW;
    let dieselGen = 0;
    const demand = instant.loadKW;

    let powerBalance = cleanGen - demand;
    let batteryActionKW = 0; // Positif = Discharge (Keluar), Negatif = Charge (Masuk)
    let deficitKW = 0;
    let surplusKW = 0;

    if (powerBalance >= 0) {
      // Surplus energi bersih: simpan ke baterai
      if (totalBatteryCapacityKWh > 0 && currentStoredKWh < totalBatteryCapacityKWh) {
        const spaceAvailable = totalBatteryCapacityKWh - currentStoredKWh;
        const maxChargeThisStep = Math.min(totalMaxChargeKW, spaceAvailable / dt);
        const chargePower = Math.min(powerBalance, maxChargeThisStep);

        currentStoredKWh += chargePower * dt * 0.92; // 92% efisiensi simpan
        batteryActionKW = -chargePower;
        surplusKW = powerBalance - chargePower;
      } else {
        surplusKW = powerBalance; // Curtailment / kelebihan daya
      }
    } else {
      // Defisit energi: ambil dari baterai
      const energyNeeded = -powerBalance;
      if (totalBatteryCapacityKWh > 0 && currentStoredKWh > 0.05 * totalBatteryCapacityKWh) {
        const availableEnergy = currentStoredKWh - (0.05 * totalBatteryCapacityKWh); // Batas kedalaman DoD 95%
        const maxDischargeThisStep = Math.min(totalMaxDischargeKW, availableEnergy / dt);
        const dischargePower = Math.min(energyNeeded, maxDischargeThisStep);

        currentStoredKWh -= dischargePower * dt;
        batteryActionKW = dischargePower;
        powerBalance += dischargePower;
      }

      // Jika masih kurang, cek apakah ada genset diesel cadangan
      if (powerBalance < -0.01 && instant.dieselKW > 0) {
        const neededFromDiesel = -powerBalance;
        dieselGen = Math.min(instant.dieselKW, neededFromDiesel);
        powerBalance += dieselGen;
      }

      // Jika masih ada sisa kekurangan daya -> PEMADAMAN (Blackout)
      if (powerBalance < -0.01) {
        deficitKW = -powerBalance;
        blackoutHours += dt;
        if (instant.criticalLoadKW > 0) {
          criticalBlackoutHours += dt;
        }
      }
    }

    currentStoredKWh = Math.max(0, Math.min(totalBatteryCapacityKWh, currentStoredKWh));
    const batterySocPercent = totalBatteryCapacityKWh > 0
      ? (currentStoredKWh / totalBatteryCapacityKWh) * 100
      : 0;

    totalCleanGeneratedKWh += cleanGen * dt;
    totalFossilGeneratedKWh += dieselGen * dt;
    totalSolarGeneratedKWh += (instant.solarKW || 0) * dt;
    totalWindGeneratedKWh += (instant.windKW || 0) * dt;
    if (batteryActionKW > 0) {
      totalBatteryDischargeKWh += batteryActionKW * dt;
    }
    totalConsumedKWh += (demand - deficitKW) * dt;
    totalDeficitKWh += deficitKW * dt;
    totalSurplusKWh += surplusKW * dt;

    hourlyData.push({
      step: s,
      hour: Number(hour.toFixed(1)),
      hourLabel: `${String(Math.floor(hour)).padStart(2, '0')}:${Math.floor((hour % 1) * 60) === 0 ? '00' : '30'}`,
      solarKW: Number(instant.solarKW.toFixed(2)),
      windKW: Number(instant.windKW.toFixed(2)),
      biomassKW: Number(instant.biomassKW.toFixed(2)),
      cleanGenKW: Number(cleanGen.toFixed(2)),
      dieselKW: Number(dieselGen.toFixed(2)),
      loadKW: Number(demand.toFixed(2)),
      batteryActionKW: Number(batteryActionKW.toFixed(2)),
      batteryStoredKWh: Number(currentStoredKWh.toFixed(2)),
      batterySocPercent: Number(batterySocPercent.toFixed(1)),
      deficitKW: Number(deficitKW.toFixed(2)),
      surplusKW: Number(surplusKW.toFixed(2))
    });
  }

  const totalDemandKWh = totalConsumedKWh + totalDeficitKWh;
  const renewablePercentage = totalDemandKWh > 0
    ? Math.max(0, Math.min(100, (totalCleanGeneratedKWh / totalDemandKWh) * 100))
    : 0;

  // Kalkulasi CO2:
  // Emisi dari genset diesel = totalFossilGeneratedKWh * 0.78 kg CO2/kWh
  // Emisi yang terhindar (Avoided CO2) = totalCleanGeneratedKWh * 0.85 kg CO2/kWh (dibanding grid batu bara)
  const co2EmissionsKg = totalFossilGeneratedKWh * 0.78;
  const co2AvoidedKg = totalCleanGeneratedKWh * 0.85;

  return {
    hourlyData,
    summary: {
      totalCost,
      totalBatteryCapacityKWh,
      finalBatteryStoredKWh: currentStoredKWh,
      totalGenKWh: Number((totalCleanGeneratedKWh + totalFossilGeneratedKWh).toFixed(1)),
      totalCleanGeneratedKWh: Number(totalCleanGeneratedKWh.toFixed(1)),
      totalFossilGeneratedKWh: Number(totalFossilGeneratedKWh.toFixed(1)),
      solarGenKWh: Number(totalSolarGeneratedKWh.toFixed(1)),
      windGenKWh: Number(totalWindGeneratedKWh.toFixed(1)),
      fossilUsedKWh: Number(totalFossilGeneratedKWh.toFixed(1)),
      batteryUsageKWh: Number(totalBatteryDischargeKWh.toFixed(1)),
      totalConsumedKWh: Number(totalConsumedKWh.toFixed(1)),
      totalDeficitKWh: Number(totalDeficitKWh.toFixed(1)),
      totalSurplusKWh: Number(totalSurplusKWh.toFixed(1)),
      blackoutHours: Number(blackoutHours.toFixed(1)),
      criticalBlackoutHours: Number(criticalBlackoutHours.toFixed(1)),
      renewablePercentage: Number(renewablePercentage.toFixed(1)),
      co2EmissionsKg: Number(co2EmissionsKg.toFixed(1)),
      co2AvoidedKg: Number(co2AvoidedKg.toFixed(1)),
      reliabilityScore: Number((Math.max(0, 1 - blackoutHours / 24) * 100).toFixed(1))
    }
  };
}

/**
 * Memeriksa capaian bintang pada skenario tantangan
 */
export function evaluateChallengeCriteria(scenario, summaryStats, remainingBudget) {
  if (!scenario || !scenario.criteria) return { stars: 0, star1: false, star2: false, star3: false };

  const evalStats = {
    ...summaryStats,
    remainingBudget
  };

  const star1 = scenario.criteria.star1 ? scenario.criteria.star1(evalStats) : false;
  const star2 = scenario.criteria.star2 ? scenario.criteria.star2(evalStats) : false;
  const star3 = scenario.criteria.star3 ? scenario.criteria.star3(evalStats) : false;

  let stars = 0;
  if (star1) stars = 1;
  if (star1 && star2) stars = 2;
  if (star1 && star2 && star3) stars = 3;

  return {
    stars,
    star1,
    star2,
    star3
  };
}
