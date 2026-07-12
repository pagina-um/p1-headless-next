import { Activity } from "lucide-react";

// Corpus brand palette (mirrors corpus.paginaum.pt tokens)
const CORPUS_TEAL = "#009588";
const CORPUS_TEAL_DARK = "#00786e";

const CORPUS_URL = "https://corpus.paginaum.pt";
const BATALHA_URL =
  "https://paginaum.pt/2025/11/18/38-486-636-registos-de-internamentos-hospitalares";

export function CorpusBanner() {
  return (
    <div
      className="w-full text-white"
      style={{
        background: `linear-gradient(160deg, ${CORPUS_TEAL} 0%, ${CORPUS_TEAL_DARK} 100%)`,
      }}
    >
      {/* same container as the navbar so edges line up */}
      <div className="max-w-7xl mx-auto px-4 py-3 md:py-3.5 flex flex-col md:flex-row md:items-center gap-1.5 md:gap-5 text-center md:text-left">
        <div className="flex items-center justify-center md:justify-start gap-2.5 md:gap-3 shrink-0 flex-wrap">
          <span className="text-[13.5px] md:text-[15px] font-semibold leading-snug">
            Experimente o
          </span>
          <a
            href={CORPUS_URL}
            className="inline-flex items-center gap-2 rounded-lg bg-white px-3 py-1.5 md:px-3.5 shadow-sm transition hover:bg-white/90 hover:shadow active:translate-y-px"
            style={{ color: CORPUS_TEAL_DARK }}
          >
            <Activity
              className="w-4 h-4 md:w-[17px] md:h-[17px] shrink-0"
              strokeWidth={2.4}
              aria-hidden="true"
            />
            <span className="uppercase tracking-[0.22em] text-[13px] md:text-[14px] font-bold leading-none">
              Corpus
            </span>
          </a>
          <span className="text-[13.5px] md:text-[15px] font-normal text-white/90 leading-snug">
            Observatório de dados em saúde
          </span>
        </div>

        {/* divider, desktop only */}
        <span
          className="hidden md:block w-px h-5 bg-white/30 shrink-0"
          aria-hidden="true"
        />

        <p className="text-[12px] md:text-[13px] leading-snug text-white/80 hidden md:block">
          Obrigado aos leitores que apoiaram a{" "}
          <a
            href={BATALHA_URL}
            className="underline underline-offset-2 decoration-white/50 hover:text-white hover:decoration-white transition-colors"
          >
            longa batalha judicial
          </a>{" "}
          que lhe deu origem.
        </p>
      </div>
    </div>
  );
}
