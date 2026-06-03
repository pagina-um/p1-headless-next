// Mock data generator for the /saude-teste demo dashboard.
// All numbers are fictional. Deterministic (seeded) so SSR and client match.

export type MonthPoint = {
  date: string; // "2021-01"
  label: string; // "Jan 21"
  year: number;
  month: number; // 0-11
  hospitalizacoes: number;
  altas: number;
  despesa: number; // millions €
  ocupacao: number; // %
};

export type Region = {
  id: string;
  name: string;
  short: string;
  population: number; // thousands
  monthly: MonthPoint[];
};

export type ExpenseSlice = {
  id: string;
  name: string;
  share: number;
  color: string;
};

export const EXPENSE_SLICES: ExpenseSlice[] = [
  { id: "pessoal", name: "Pessoal", share: 0.38, color: "#34d399" },
  { id: "medicamentos", name: "Medicamentos", share: 0.22, color: "#38bdf8" },
  { id: "mcdt", name: "Exames e MCDT", share: 0.14, color: "#a78bfa" },
  { id: "infra", name: "Infraestruturas", share: 0.11, color: "#fbbf24" },
  { id: "equipamento", name: "Equipamento", share: 0.08, color: "#fb7185" },
  { id: "outros", name: "Outros", share: 0.07, color: "#64748b" },
];

const MONTH_LABELS = [
  "Jan",
  "Fev",
  "Mar",
  "Abr",
  "Mai",
  "Jun",
  "Jul",
  "Ago",
  "Set",
  "Out",
  "Nov",
  "Dez",
];

export const MONTH_NAMES = MONTH_LABELS;

// mulberry32 — tiny deterministic PRNG
function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const REGION_DEFS: Array<{
  id: string;
  name: string;
  short: string;
  population: number;
  seed: number;
}> = [
  { id: "norte", name: "Norte", short: "NOR", population: 3573, seed: 11 },
  { id: "centro", name: "Centro", short: "CEN", population: 2227, seed: 23 },
  {
    id: "lvt",
    name: "Lisboa e Vale do Tejo",
    short: "LVT",
    population: 3659,
    seed: 37,
  },
  { id: "alentejo", name: "Alentejo", short: "ALE", population: 705, seed: 41 },
  { id: "algarve", name: "Algarve", short: "ALG", population: 467, seed: 53 },
  { id: "acores", name: "Açores", short: "AÇO", population: 236, seed: 67 },
  { id: "madeira", name: "Madeira", short: "MAD", population: 251, seed: 79 },
];

const YEARS = [2021, 2022, 2023, 2024, 2025];

function buildRegion(def: (typeof REGION_DEFS)[number]): Region {
  const rand = mulberry32(def.seed);
  const monthly: MonthPoint[] = [];

  YEARS.forEach((year, yi) => {
    for (let month = 0; month < 12; month++) {
      const t = yi * 12 + month; // 0..59
      // Winter peak (Dec–Feb), summer dip
      const seasonal = 1 + 0.28 * Math.cos(((month - 0.5) / 12) * Math.PI * 2);
      // Pandemic-style wave fading out across 2021–2022
      const wave = 1 + 0.55 * Math.exp(-t / 9) * (1 + 0.4 * Math.sin(t / 2));
      // Slow structural decline in admissions, slow rise in costs
      const trend = 1 - 0.015 * yi;

      const baseHosp = def.population * 2.1;
      const hospitalizacoes = Math.round(
        baseHosp * seasonal * wave * trend * (0.92 + rand() * 0.16),
      );
      const altas = Math.round(hospitalizacoes * (0.9 + rand() * 0.08));
      const despesa =
        Math.round(
          (def.population * 0.135 * (1 + 0.045 * yi) * seasonal +
            hospitalizacoes * 0.0021) *
            (0.95 + rand() * 0.1) *
            10,
        ) / 10;
      const ocupacao = Math.min(
        98,
        Math.max(
          46,
          Math.round(
            62 + 16 * (seasonal - 1) * 4 + 10 * (wave - 1) + (rand() - 0.5) * 9,
          ),
        ),
      );

      monthly.push({
        date: `${year}-${String(month + 1).padStart(2, "0")}`,
        label: `${MONTH_LABELS[month]} ${String(year).slice(2)}`,
        year,
        month,
        hospitalizacoes,
        altas,
        despesa,
        ocupacao,
      });
    }
  });

  return { ...def, monthly };
}

export const REGIONS: Region[] = REGION_DEFS.map(buildRegion);

export const TOTAL_MONTHS = YEARS.length * 12;

/** Aggregate monthly series across one region or all of them. */
export function aggregateMonthly(regionId: string): MonthPoint[] {
  if (regionId !== "all") {
    const region = REGIONS.find((r) => r.id === regionId);
    return region ? region.monthly : [];
  }
  const totalPop = REGIONS.reduce((s, r) => s + r.population, 0);
  return REGIONS[0].monthly.map((_, i) => {
    const base = REGIONS[0].monthly[i];
    let hosp = 0;
    let altas = 0;
    let despesa = 0;
    let ocupacao = 0;
    for (const r of REGIONS) {
      const p = r.monthly[i];
      hosp += p.hospitalizacoes;
      altas += p.altas;
      despesa += p.despesa;
      ocupacao += p.ocupacao * r.population;
    }
    return {
      ...base,
      hospitalizacoes: hosp,
      altas,
      despesa: Math.round(despesa * 10) / 10,
      ocupacao: Math.round(ocupacao / totalPop),
    };
  });
}
