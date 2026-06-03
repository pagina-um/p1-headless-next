"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  BedDouble,
  Euro,
  HeartPulse,
  Sparkles,
} from "lucide-react";
import {
  EXPENSE_SLICES,
  MONTH_NAMES,
  REGIONS,
  aggregateMonthly,
  type MonthPoint,
} from "./data";

/* ------------------------------------------------------------------ */
/* Formatting helpers                                                  */
/* ------------------------------------------------------------------ */

const nf = new Intl.NumberFormat("pt-PT", { maximumFractionDigits: 0 });
const nf1 = new Intl.NumberFormat("pt-PT", {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

const fmtInt = (v: number) => nf.format(Math.round(v));
const fmtMoney = (v: number) =>
  v >= 1000 ? `${nf1.format(v / 1000)} mM€` : `${nf.format(Math.round(v))} M€`;
const fmtPct = (v: number) => `${nf.format(Math.round(v))}%`;

/* ------------------------------------------------------------------ */
/* Animated counter                                                    */
/* ------------------------------------------------------------------ */

function useCountUp(target: number, duration = 900) {
  const [value, setValue] = useState(0);
  const fromRef = useRef(0);

  useEffect(() => {
    const from = fromRef.current;
    const start = performance.now();
    let raf: number;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      const v = from + (target - from) * eased;
      setValue(v);
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      fromRef.current = target;
    };
  }, [target, duration]);

  return value;
}

function useMounted() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);
  return mounted;
}

/* ------------------------------------------------------------------ */
/* Metric configuration                                                */
/* ------------------------------------------------------------------ */

type MetricKey = "hospitalizacoes" | "altas" | "despesa" | "ocupacao";

const METRICS: Record<
  MetricKey,
  {
    label: string;
    color: string;
    glow: string;
    format: (v: number) => string;
    goodWhenUp: boolean;
  }
> = {
  hospitalizacoes: {
    label: "Hospitalizações",
    color: "#fb7185",
    glow: "rgba(251,113,133,0.35)",
    format: fmtInt,
    goodWhenUp: false,
  },
  altas: {
    label: "Altas (curas)",
    color: "#34d399",
    glow: "rgba(52,211,153,0.35)",
    format: fmtInt,
    goodWhenUp: true,
  },
  despesa: {
    label: "Despesa",
    color: "#fbbf24",
    glow: "rgba(251,191,36,0.35)",
    format: fmtMoney,
    goodWhenUp: false,
  },
  ocupacao: {
    label: "Ocupação",
    color: "#38bdf8",
    glow: "rgba(56,189,248,0.35)",
    format: fmtPct,
    goodWhenUp: false,
  },
};

const RANGES = [
  { id: 12, label: "12 M" },
  { id: 36, label: "3 A" },
  { id: 60, label: "5 A" },
] as const;

/* ------------------------------------------------------------------ */
/* Sparkline (tiny SVG, no axes)                                       */
/* ------------------------------------------------------------------ */

function Sparkline({ values, color }: { values: number[]; color: string }) {
  const mounted = useMounted();
  const path = useMemo(() => {
    if (values.length < 2) return "";
    const min = Math.min(...values);
    const max = Math.max(...values);
    const span = max - min || 1;
    return values
      .map((v, i) => {
        const x = (i / (values.length - 1)) * 100;
        const y = 28 - ((v - min) / span) * 24 - 2;
        return `${i === 0 ? "M" : "L"}${x.toFixed(2)},${y.toFixed(2)}`;
      })
      .join(" ");
  }, [values]);

  return (
    <svg
      viewBox="0 0 100 30"
      preserveAspectRatio="none"
      className="h-8 w-full"
      aria-hidden
    >
      <path
        d={path}
        fill="none"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
        pathLength={1}
        style={{
          strokeDasharray: 1,
          strokeDashoffset: mounted ? 0 : 1,
          transition: "stroke-dashoffset 1.2s ease-out",
        }}
      />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* KPI card                                                            */
/* ------------------------------------------------------------------ */

function KpiCard({
  icon,
  metric,
  value,
  delta,
  spark,
  delay,
}: {
  icon: React.ReactNode;
  metric: MetricKey;
  value: number;
  delta: number;
  spark: number[];
  delay: number;
}) {
  const cfg = METRICS[metric];
  const animated = useCountUp(value);
  const up = delta >= 0;
  const good = up === cfg.goodWhenUp;

  return (
    <div
      className="st-rise group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-white/20 hover:bg-white/[0.07] sm:p-5"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div
        className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full opacity-20 blur-3xl transition-opacity duration-500 group-hover:opacity-40"
        style={{ background: cfg.color }}
      />
      <div className="flex items-center justify-between">
        <span
          className="flex h-9 w-9 items-center justify-center rounded-xl"
          style={{ background: `${cfg.color}22`, color: cfg.color }}
        >
          {icon}
        </span>
        <span
          className={`flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-semibold ${
            good ? "bg-emerald-400/10 text-emerald-300" : "bg-rose-400/10 text-rose-300"
          }`}
        >
          {up ? (
            <ArrowUpRight className="h-3.5 w-3.5" />
          ) : (
            <ArrowDownRight className="h-3.5 w-3.5" />
          )}
          {nf1.format(Math.abs(delta))}%
        </span>
      </div>
      <p className="mt-4 text-2xl font-bold tabular-nums tracking-tight text-white sm:text-3xl">
        {cfg.format(animated)}
      </p>
      <p className="mt-0.5 text-xs font-medium uppercase tracking-wider text-slate-400">
        {cfg.label}
      </p>
      <div className="mt-3">
        <Sparkline values={spark} color={cfg.color} />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Main area chart with crosshair tooltip                              */
/* ------------------------------------------------------------------ */

function AreaChart({
  points,
  metric,
}: {
  points: MonthPoint[];
  metric: MetricKey;
}) {
  const cfg = METRICS[metric];
  const mounted = useMounted();
  const [hover, setHover] = useState<number | null>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  const values = useMemo(() => points.map((p) => p[metric]), [points, metric]);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const pad = span * 0.12;

  const yPct = useCallback(
    (v: number) => 100 - ((v - (min - pad)) / (span + pad * 2)) * 100,
    [min, span, pad],
  );

  const { linePath, areaPath } = useMemo(() => {
    if (values.length < 2) return { linePath: "", areaPath: "" };
    const pts = values.map((v, i) => {
      const x = (i / (values.length - 1)) * 100;
      return `${x.toFixed(2)},${yPct(v).toFixed(2)}`;
    });
    const line = `M${pts.join(" L")}`;
    return {
      linePath: line,
      areaPath: `${line} L100,100 L0,100 Z`,
    };
  }, [values, yPct]);

  const onMove = (e: React.PointerEvent) => {
    const rect = wrapRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = (e.clientX - rect.left) / rect.width;
    setHover(
      Math.max(0, Math.min(values.length - 1, Math.round(x * (values.length - 1)))),
    );
  };

  const hovered = hover !== null ? points[hover] : null;
  const hoverX = hover !== null ? (hover / (values.length - 1)) * 100 : 0;
  const hoverY = hover !== null ? yPct(values[hover]) : 0;

  // Show ~6 x-axis labels
  const labelStep = Math.max(1, Math.ceil(points.length / 6));
  const xLabels = points.filter((_, i) => i % labelStep === 0);

  // Gridline values (4 lines)
  const gridValues = [0.25, 0.5, 0.75].map(
    (f) => min - pad + (span + pad * 2) * (1 - f),
  );

  return (
    <div>
      <div
        ref={wrapRef}
        className="relative h-56 w-full cursor-crosshair touch-none select-none sm:h-72"
        onPointerMove={onMove}
        onPointerLeave={() => setHover(null)}
      >
        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className="absolute inset-0 h-full w-full"
        >
          <defs>
            <linearGradient id={`grad-${metric}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={cfg.color} stopOpacity={0.4} />
              <stop offset="100%" stopColor={cfg.color} stopOpacity={0.02} />
            </linearGradient>
          </defs>
          {[25, 50, 75].map((y) => (
            <line
              key={y}
              x1="0"
              x2="100"
              y1={y}
              y2={y}
              stroke="rgba(148,163,184,0.12)"
              strokeWidth={1}
              vectorEffect="non-scaling-stroke"
              strokeDasharray="4 4"
            />
          ))}
          <path
            d={areaPath}
            fill={`url(#grad-${metric})`}
            style={{
              opacity: mounted ? 1 : 0,
              transition: "opacity 1s ease-out 0.3s",
            }}
          />
          <path
            d={linePath}
            fill="none"
            stroke={cfg.color}
            strokeWidth={2.5}
            strokeLinejoin="round"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
            pathLength={1}
            style={{
              strokeDasharray: 1,
              strokeDashoffset: mounted ? 0 : 1,
              transition: "stroke-dashoffset 1.4s ease-out",
              filter: `drop-shadow(0 0 6px ${cfg.glow})`,
            }}
          />
        </svg>

        {/* gridline value labels */}
        {gridValues.map((v, i) => (
          <span
            key={i}
            className="absolute left-1 -translate-y-full text-[10px] tabular-nums text-slate-500"
            style={{ top: `${[25, 50, 75][i]}%` }}
          >
            {cfg.format(v)}
          </span>
        ))}

        {/* crosshair + tooltip */}
        {hovered && (
          <>
            <div
              className="pointer-events-none absolute bottom-0 top-0 w-px bg-white/30"
              style={{ left: `${hoverX}%` }}
            />
            <div
              className="pointer-events-none absolute h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white"
              style={{
                left: `${hoverX}%`,
                top: `${hoverY}%`,
                background: cfg.color,
                boxShadow: `0 0 12px ${cfg.glow}`,
              }}
            />
            <div
              className="pointer-events-none absolute z-10 -translate-y-full whitespace-nowrap rounded-lg border border-white/10 bg-slate-900/95 px-3 py-2 text-xs shadow-xl backdrop-blur"
              style={{
                left: `${hoverX}%`,
                top: `${Math.max(hoverY - 6, 14)}%`,
                transform: `translate(${hoverX > 70 ? "-105%" : hoverX < 12 ? "5%" : "-50%"}, -100%)`,
              }}
            >
              <p className="font-semibold text-slate-300">{hovered.label}</p>
              <p
                className="mt-0.5 text-sm font-bold tabular-nums"
                style={{ color: cfg.color }}
              >
                {cfg.format(hovered[metric])}
              </p>
            </div>
          </>
        )}
      </div>
      <div className="mt-2 flex justify-between text-[10px] font-medium uppercase tracking-wide text-slate-500 sm:text-xs">
        {xLabels.map((p) => (
          <span key={p.date}>{p.label}</span>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Region bars (clickable filter)                                      */
/* ------------------------------------------------------------------ */

function RegionBars({
  data,
  selected,
  onSelect,
}: {
  data: Array<{ id: string; name: string; value: number }>;
  selected: string;
  onSelect: (id: string) => void;
}) {
  const mounted = useMounted();
  const max = Math.max(...data.map((d) => d.value)) || 1;

  return (
    <div className="space-y-2.5">
      {data.map((d, i) => {
        const active = selected === d.id;
        const dimmed = selected !== "all" && !active;
        return (
          <button
            key={d.id}
            onClick={() => onSelect(active ? "all" : d.id)}
            className={`group block w-full text-left transition-opacity duration-300 ${
              dimmed ? "opacity-40 hover:opacity-70" : ""
            }`}
          >
            <div className="mb-1 flex items-baseline justify-between text-xs sm:text-sm">
              <span
                className={`font-medium transition-colors ${
                  active ? "text-rose-300" : "text-slate-300 group-hover:text-white"
                }`}
              >
                {d.name}
              </span>
              <span className="tabular-nums font-semibold text-slate-400">
                {fmtInt(d.value)}
              </span>
            </div>
            <div className="h-2.5 overflow-hidden rounded-full bg-white/[0.06]">
              <div
                className="h-full rounded-full bg-gradient-to-r from-rose-500 to-rose-300 transition-all duration-700 ease-out group-hover:from-rose-400 group-hover:to-rose-200"
                style={{
                  width: mounted ? `${(d.value / max) * 100}%` : "0%",
                  transitionDelay: `${i * 60}ms`,
                }}
              />
            </div>
          </button>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Expense donut                                                       */
/* ------------------------------------------------------------------ */

function ExpenseDonut({ total }: { total: number }) {
  const mounted = useMounted();
  const [hover, setHover] = useState<string | null>(null);
  const animatedTotal = useCountUp(total);

  const R = 40;
  const C = 2 * Math.PI * R;
  let acc = 0;

  return (
    <div className="flex flex-col items-center gap-6 sm:flex-row">
      <div className="relative h-44 w-44 shrink-0 sm:h-48 sm:w-48">
        <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
          {EXPENSE_SLICES.map((s) => {
            const start = acc;
            acc += s.share;
            const isHover = hover === s.id;
            return (
              <circle
                key={s.id}
                cx="50"
                cy="50"
                r={R}
                fill="none"
                stroke={s.color}
                strokeWidth={isHover ? 13 : 10}
                strokeDasharray={`${mounted ? s.share * C - 1.5 : 0} ${C}`}
                strokeDashoffset={-start * C}
                strokeLinecap="round"
                style={{
                  transition:
                    "stroke-dasharray 1s cubic-bezier(0.4,0,0.2,1), stroke-width 0.2s ease",
                  opacity: hover && !isHover ? 0.35 : 1,
                  cursor: "pointer",
                }}
                onPointerEnter={() => setHover(s.id)}
                onPointerLeave={() => setHover(null)}
              />
            );
          })}
        </svg>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          {hover ? (
            <>
              <span className="text-lg font-bold tabular-nums text-white sm:text-xl">
                {fmtMoney(total * (EXPENSE_SLICES.find((s) => s.id === hover)?.share ?? 0))}
              </span>
              <span className="mt-0.5 max-w-[7rem] text-center text-[11px] font-medium text-slate-400">
                {EXPENSE_SLICES.find((s) => s.id === hover)?.name}
              </span>
            </>
          ) : (
            <>
              <span className="text-lg font-bold tabular-nums text-white sm:text-xl">
                {fmtMoney(animatedTotal)}
              </span>
              <span className="mt-0.5 text-[11px] font-medium uppercase tracking-wider text-slate-400">
                Total período
              </span>
            </>
          )}
        </div>
      </div>
      <ul className="grid w-full grid-cols-2 gap-x-4 gap-y-2.5 sm:grid-cols-1">
        {EXPENSE_SLICES.map((s) => (
          <li
            key={s.id}
            className={`flex cursor-pointer items-center gap-2.5 rounded-lg px-2 py-1 text-sm transition-colors ${
              hover === s.id ? "bg-white/[0.06]" : ""
            }`}
            onPointerEnter={() => setHover(s.id)}
            onPointerLeave={() => setHover(null)}
          >
            <span
              className="h-2.5 w-2.5 shrink-0 rounded-full"
              style={{ background: s.color }}
            />
            <span className="flex-1 truncate text-slate-300">{s.name}</span>
            <span className="tabular-nums text-xs font-semibold text-slate-400">
              {Math.round(s.share * 100)}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Occupancy heatmap                                                   */
/* ------------------------------------------------------------------ */

function heatColor(v: number) {
  // 46..98 → blue → amber → red
  const t = Math.max(0, Math.min(1, (v - 46) / 52));
  if (t < 0.5) {
    const k = t / 0.5;
    return `rgba(${Math.round(56 + (251 - 56) * k)}, ${Math.round(189 + (191 - 189) * k)}, ${Math.round(248 + (36 - 248) * k)}, 0.85)`;
  }
  const k = (t - 0.5) / 0.5;
  return `rgba(${Math.round(251 + (244 - 251) * k)}, ${Math.round(191 + (63 - 191) * k)}, ${Math.round(36 + (94 - 36) * k)}, 0.9)`;
}

function OccupancyHeatmap({ points }: { points: MonthPoint[] }) {
  const mounted = useMounted();
  const years = useMemo(
    () => Array.from(new Set(points.map((p) => p.year))).sort(),
    [points],
  );

  return (
    <div className="overflow-x-auto pb-1">
      <div className="min-w-[480px]">
        <div className="grid grid-cols-[2.5rem_repeat(12,1fr)] gap-1">
          <span />
          {MONTH_NAMES.map((m) => (
            <span
              key={m}
              className="text-center text-[10px] font-medium uppercase text-slate-500"
            >
              {m}
            </span>
          ))}
          {years.map((year, yi) =>
            [
              <span
                key={`y-${year}`}
                className="flex items-center text-xs font-semibold tabular-nums text-slate-400"
              >
                {year}
              </span>,
              ...Array.from({ length: 12 }, (_, m) => {
                const p = points.find((pt) => pt.year === year && pt.month === m);
                if (!p)
                  return (
                    <span
                      key={`${year}-${m}`}
                      className="aspect-[2/1] rounded bg-white/[0.03]"
                    />
                  );
                return (
                  <span
                    key={`${year}-${m}`}
                    title={`${p.label} — Ocupação ${p.ocupacao}%`}
                    className="flex aspect-[2/1] items-center justify-center rounded text-[9px] font-bold text-slate-900/80 transition-transform duration-200 hover:z-10 hover:scale-125 hover:shadow-lg sm:text-[10px]"
                    style={{
                      background: heatColor(p.ocupacao),
                      opacity: mounted ? 1 : 0,
                      transition: `opacity 0.5s ease ${(yi * 12 + m) * 12}ms, transform 0.2s ease`,
                    }}
                  >
                    {p.ocupacao}
                  </span>
                );
              }),
            ],
          )}
        </div>
        <div className="mt-3 flex items-center justify-end gap-2 text-[10px] text-slate-500">
          <span>46%</span>
          <span
            className="h-2 w-24 rounded-full"
            style={{
              background: `linear-gradient(to right, ${heatColor(46)}, ${heatColor(72)}, ${heatColor(98)})`,
            }}
          />
          <span>98%</span>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Dashboard                                                           */
/* ------------------------------------------------------------------ */

export default function Dashboard() {
  const [regionId, setRegionId] = useState<string>("all");
  const [range, setRange] = useState<(typeof RANGES)[number]["id"]>(12);
  const [metric, setMetric] = useState<MetricKey>("hospitalizacoes");

  const fullSeries = useMemo(() => aggregateMonthly(regionId), [regionId]);
  const series = useMemo(() => fullSeries.slice(-range), [fullSeries, range]);
  const prevSeries = useMemo(
    () => fullSeries.slice(-range * 2, -range),
    [fullSeries, range],
  );

  const totals = useMemo(() => {
    const sum = (pts: MonthPoint[], k: "hospitalizacoes" | "altas" | "despesa") =>
      pts.reduce((s, p) => s + p[k], 0);
    const avg = (pts: MonthPoint[]) =>
      pts.length ? pts.reduce((s, p) => s + p.ocupacao, 0) / pts.length : 0;
    const delta = (cur: number, prev: number) =>
      prev ? ((cur - prev) / prev) * 100 : 0;

    const cur = {
      hospitalizacoes: sum(series, "hospitalizacoes"),
      altas: sum(series, "altas"),
      despesa: sum(series, "despesa"),
      ocupacao: avg(series),
    };
    const prev = {
      hospitalizacoes: sum(prevSeries, "hospitalizacoes"),
      altas: sum(prevSeries, "altas"),
      despesa: sum(prevSeries, "despesa"),
      ocupacao: avg(prevSeries),
    };
    return {
      cur,
      delta: {
        hospitalizacoes: delta(cur.hospitalizacoes, prev.hospitalizacoes),
        altas: delta(cur.altas, prev.altas),
        despesa: delta(cur.despesa, prev.despesa),
        ocupacao: delta(cur.ocupacao, prev.ocupacao),
      },
    };
  }, [series, prevSeries]);

  const regionTotals = useMemo(
    () =>
      REGIONS.map((r) => ({
        id: r.id,
        name: r.name,
        value: r.monthly
          .slice(-range)
          .reduce((s, p) => s + p.hospitalizacoes, 0),
      })).sort((a, b) => b.value - a.value),
    [range],
  );

  const regionName =
    regionId === "all"
      ? "Portugal"
      : REGIONS.find((r) => r.id === regionId)?.name ?? "";

  const spark = (k: MetricKey) => series.map((p) => p[k]);

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 [background-image:radial-gradient(60rem_40rem_at_120%_-10%,rgba(225,0,18,0.13),transparent),radial-gradient(50rem_35rem_at_-20%_110%,rgba(56,189,248,0.09),transparent)]">
      <style>{`
        @keyframes st-rise {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .st-rise { opacity: 0; animation: st-rise 0.6s cubic-bezier(0.2, 0.7, 0.3, 1) forwards; }
        @keyframes st-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        .st-pulse { animation: st-pulse 2.4s ease-in-out infinite; }
      `}</style>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        {/* Header */}
        <header className="st-rise">
          <div className="flex flex-wrap items-center gap-3">
            <span className="flex items-center gap-1.5 rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1 text-xs font-semibold text-amber-300">
              <Sparkles className="h-3.5 w-3.5" />
              DEMO · dados fictícios
            </span>
            <span className="flex items-center gap-1.5 text-xs text-slate-500">
              <span className="st-pulse h-2 w-2 rounded-full bg-emerald-400" />
              Atualizado em tempo real
            </span>
          </div>
          <h1 className="mt-4 font-serif text-3xl font-bold tracking-tight text-white sm:text-5xl">
            Saúde em{" "}
            <span className="bg-gradient-to-r from-rose-400 via-amber-300 to-sky-400 bg-clip-text text-transparent">
              Números
            </span>
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-400 sm:text-base">
            Exploração interativa de hospitalizações, altas e despesa do
            sistema de saúde — {regionName}, últimos{" "}
            {RANGES.find((r) => r.id === range)?.label.toLowerCase()}.
          </p>
        </header>

        {/* Controls */}
        <div
          className="st-rise mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
          style={{ animationDelay: "80ms" }}
        >
          <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
            <button
              onClick={() => setRegionId("all")}
              className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all sm:text-sm ${
                regionId === "all"
                  ? "bg-white text-slate-900 shadow-lg shadow-white/10"
                  : "border border-white/10 bg-white/[0.04] text-slate-300 hover:border-white/25 hover:text-white"
              }`}
            >
              Portugal
            </button>
            {REGIONS.map((r) => (
              <button
                key={r.id}
                onClick={() => setRegionId(regionId === r.id ? "all" : r.id)}
                className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all sm:text-sm ${
                  regionId === r.id
                    ? "bg-white text-slate-900 shadow-lg shadow-white/10"
                    : "border border-white/10 bg-white/[0.04] text-slate-300 hover:border-white/25 hover:text-white"
                }`}
              >
                {r.short}
              </button>
            ))}
          </div>
          <div className="flex shrink-0 gap-1 rounded-full border border-white/10 bg-white/[0.04] p-1">
            {RANGES.map((r) => (
              <button
                key={r.id}
                onClick={() => setRange(r.id)}
                className={`rounded-full px-3.5 py-1 text-xs font-semibold transition-all sm:text-sm ${
                  range === r.id
                    ? "bg-rose-500 text-white shadow-lg shadow-rose-500/30"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>

        {/* KPI cards */}
        <section className="mt-6 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          <KpiCard
            icon={<BedDouble className="h-5 w-5" />}
            metric="hospitalizacoes"
            value={totals.cur.hospitalizacoes}
            delta={totals.delta.hospitalizacoes}
            spark={spark("hospitalizacoes")}
            delay={120}
          />
          <KpiCard
            icon={<HeartPulse className="h-5 w-5" />}
            metric="altas"
            value={totals.cur.altas}
            delta={totals.delta.altas}
            spark={spark("altas")}
            delay={180}
          />
          <KpiCard
            icon={<Euro className="h-5 w-5" />}
            metric="despesa"
            value={totals.cur.despesa}
            delta={totals.delta.despesa}
            spark={spark("despesa")}
            delay={240}
          />
          <KpiCard
            icon={<Activity className="h-5 w-5" />}
            metric="ocupacao"
            value={totals.cur.ocupacao}
            delta={totals.delta.ocupacao}
            spark={spark("ocupacao")}
            delay={300}
          />
        </section>

        {/* Main chart */}
        <section
          className="st-rise mt-4 rounded-2xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur-sm sm:mt-6 sm:p-6"
          style={{ animationDelay: "360ms" }}
        >
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold text-white sm:text-lg">
                Evolução mensal
              </h2>
              <p className="text-xs text-slate-500 sm:text-sm">
                {METRICS[metric].label} · {regionName}
              </p>
            </div>
            <div className="flex gap-1.5 overflow-x-auto">
              {(Object.keys(METRICS) as MetricKey[]).map((k) => (
                <button
                  key={k}
                  onClick={() => setMetric(k)}
                  className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                    metric === k
                      ? "text-slate-900"
                      : "border border-white/10 text-slate-400 hover:text-white"
                  }`}
                  style={
                    metric === k
                      ? {
                          background: METRICS[k].color,
                          boxShadow: `0 4px 16px ${METRICS[k].glow}`,
                        }
                      : undefined
                  }
                >
                  {METRICS[k].label}
                </button>
              ))}
            </div>
          </div>
          <AreaChart key={`${metric}-${regionId}-${range}`} points={series} metric={metric} />
        </section>

        {/* Region bars + donut */}
        <section className="mt-4 grid gap-4 sm:mt-6 lg:grid-cols-5">
          <div
            className="st-rise rounded-2xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur-sm sm:p-6 lg:col-span-3"
            style={{ animationDelay: "420ms" }}
          >
            <h2 className="text-base font-semibold text-white sm:text-lg">
              Hospitalizações por região
            </h2>
            <p className="mb-5 text-xs text-slate-500 sm:text-sm">
              Toque numa região para filtrar todo o painel
            </p>
            <RegionBars
              data={regionTotals}
              selected={regionId}
              onSelect={setRegionId}
            />
          </div>
          <div
            className="st-rise rounded-2xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur-sm sm:p-6 lg:col-span-2"
            style={{ animationDelay: "480ms" }}
          >
            <h2 className="text-base font-semibold text-white sm:text-lg">
              Para onde vai a despesa
            </h2>
            <p className="mb-5 text-xs text-slate-500 sm:text-sm">
              Distribuição por rubrica · {regionName}
            </p>
            <ExpenseDonut
              key={`${regionId}-${range}`}
              total={totals.cur.despesa}
            />
          </div>
        </section>

        {/* Heatmap */}
        <section
          className="st-rise mt-4 rounded-2xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur-sm sm:mt-6 sm:p-6"
          style={{ animationDelay: "540ms" }}
        >
          <h2 className="text-base font-semibold text-white sm:text-lg">
            Taxa de ocupação hospitalar
          </h2>
          <p className="mb-5 text-xs text-slate-500 sm:text-sm">
            Percentagem média mensal de camas ocupadas · {regionName}
          </p>
          <OccupancyHeatmap points={series} />
        </section>

        <footer
          className="st-rise mt-8 border-t border-white/10 pt-6 text-center text-xs text-slate-600"
          style={{ animationDelay: "600ms" }}
        >
          Rota de demonstração <code className="text-slate-500">/saude-teste</code> —
          todos os valores são fictícios e gerados aleatoriamente.
        </footer>
      </div>
    </main>
  );
}
