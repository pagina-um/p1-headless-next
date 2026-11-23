import type { TimelineMode, TimelineSeriesPoint } from "../_lib/types";

interface AnnualChartProps {
  points: TimelineSeriesPoint[];
  year: number;
  mode: TimelineMode;
  showUncertain: boolean;
  onSelect: (year: number) => void;
}

export function AnnualChart({
  points,
  year,
  mode,
  showUncertain,
  onSelect,
}: AnnualChartProps) {
  const max = Math.max(1, ...points.map((point) => point.assigned));
  return (
    <section
      aria-labelledby="annual-title"
      className="mt-8 border-t border-gray-200 pt-6"
    >
      <h3
        id="annual-title"
        className="font-serif !text-2xl !font-bold text-stone-900"
      >
        {mode === "period"
          ? "Os registos por ano"
          : "A acumulação dos registos"}
      </h3>
      <p className="!mt-2 text-sm leading-relaxed text-stone-600">
        O gráfico acompanha os filtros. Seleccione uma barra para mudar de ano.
      </p>
      <div
        className="mt-5 grid grid-cols-5 gap-2"
        role="group"
        aria-label="Seleccionar um ano no gráfico"
      >
        {points.map((point) => {
          const height = (point.assigned / max) * 100;
          const uncertain = showUncertain ? point.possible + point.undated : 0;
          return (
            <button
              key={point.year}
              type="button"
              onClick={() => onSelect(point.year)}
              aria-pressed={year === point.year}
              aria-label={`${point.year}: ${point.assigned} na contagem principal${uncertain ? ` e ${uncertain} com ano incerto` : ""}${point.year === 2026 ? ". Período incompleto" : ""}`}
              className={`min-w-0 rounded border p-2 text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${year === point.year ? "border-primary bg-white" : "border-transparent hover:border-gray-300"}`}
            >
              <span className="block text-lg font-bold text-stone-900">
                {point.assigned}
              </span>
              <span className="block min-h-5 text-xs text-stone-600">
                {uncertain ? `+ ${uncertain}?` : ""}
              </span>
              <svg
                viewBox="0 0 50 110"
                className="mx-auto h-28 w-full"
                aria-hidden="true"
              >
                <rect
                  x="5"
                  y={105 - height}
                  width="40"
                  height={Math.max(1, height)}
                  rx="2"
                  className={
                    year === point.year ? "fill-primary" : "fill-stone-400"
                  }
                />
              </svg>
              <span className="mt-2 block text-xs font-semibold text-stone-700">
                {point.year}
                {point.year === 2026 ? "*" : ""}
              </span>
            </button>
          );
        })}
      </div>
      <p className="!mt-3 text-xs leading-relaxed text-stone-600">
        As barras representam a contagem principal. “+ 1?” assinala um registo
        entre anos, contado à parte.{" "}
        <strong>*2026 é um período incompleto.</strong>
      </p>
    </section>
  );
}
