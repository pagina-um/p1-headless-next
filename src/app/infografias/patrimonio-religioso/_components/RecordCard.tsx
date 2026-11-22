import { ChevronDown, ChevronUp, ExternalLink } from "lucide-react";
import {
  humanDate,
  precisionLabels,
  recordDate,
  safeHttpUrl,
} from "../_lib/presentation";
import type { TimelineMode, VisibleRecord } from "../_lib/types";

interface RecordCardProps {
  item: VisibleRecord;
  mode: TimelineMode;
  open: boolean;
  onToggle: () => void;
}

export function RecordCard({ item, mode, open, onToggle }: RecordCardProps) {
  const { record, status } = item;
  const labels = precisionLabels(record, status, mode);
  let temporalNote = (
    record.precisionNote ||
    "A precisão temporal é a que consta das fontes do levantamento."
  ).trim();
  if (!/[.!?]$/.test(temporalNote)) temporalNote += ".";
  if (record.isCrossYear) {
    temporalNote +=
      mode === "cumulative" && status === "assigned"
        ? " O intervalo fica totalmente abrangido pelo acumulado, mas não foi atribuído um ano exacto ao acontecimento."
        : " O intervalo não permite escolher um dos anos como data certa.";
  }
  const details = [
    {
      label: "Data e precisão",
      text: `${record.dateRoleLabel}: ${humanDate(record.dateOriginal || record.dateDisplay)}. ${temporalNote}`,
    },
    ...(record.referenceDate
      ? [
          {
            label: "Data de referência",
            text: `${humanDate(record.referenceDate)}${record.referenceDateEnd ? " a " + humanDate(record.referenceDateEnd) : ""} · ${record.referenceDateBasis || record.dateRoleLabel}`,
          },
        ]
      : []),
    {
      label: "Localização",
      text: `${record.location} · ${record.municipality} · ${record.district}. No mapa: concelho.`,
    },
    { label: "Descrição original do tipo", text: record.originalType },
    { label: "Prejuízos descritos", text: record.damagesOriginal },
    { label: "Seguimento no levantamento", text: record.followUp },
    {
      label: "Autoridades e seguimento referido",
      text: record.authorities?.replace(/ \| /g, " · "),
    },
    { label: "Notas de verificação", text: record.verificationNotes },
    {
      label: "Motivação nas fontes consultadas",
      text: `${record.motivation}${record.motivationBasis ? " " + record.motivationBasis : ""}`,
    },
  ].filter((item) => item.text);

  return (
    <article
      className={`min-w-0 rounded-md border bg-white shadow-sm ${status === "assigned" ? "border-gray-200" : "border-dashed border-gray-400"}`}
      data-record-id={record.id}
      data-temporal-status={status}
    >
      <button
        type="button"
        className="block w-full rounded-md p-5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
        onClick={onToggle}
        aria-expanded={open}
        aria-controls={`record-detail-${record.id}`}
      >
        <span className="block text-[11px] font-medium uppercase tracking-wider text-stone-500">
          {record.municipality} · {record.district}
        </span>
        <span className="mt-2 block font-serif text-lg font-bold text-stone-900">
          {record.location}
        </span>
        <span className="mt-2 block text-sm font-medium text-stone-700">
          {recordDate(record)}
        </span>
        <span className="mt-1 block text-sm text-stone-600">
          {record.categoryLabel}
        </span>
        {labels.length > 0 && (
          <span className="mt-3 flex flex-wrap gap-2">
            {labels.map((label) => (
              <span
                key={label}
                className="rounded border border-gray-300 bg-gray-100 px-2 py-1 text-xs text-stone-700"
              >
                {label}
              </span>
            ))}
          </span>
        )}
        {!open && (
          <span className="mt-3 line-clamp-3 text-sm leading-relaxed text-stone-600">
            {record.description}
          </span>
        )}
        <span className="mt-4 flex items-center gap-2 text-sm font-medium text-primary">
          {open ? "Fechar ficha" : "Ler ficha e fontes"}
          {open ? (
            <ChevronUp size={16} aria-hidden="true" />
          ) : (
            <ChevronDown size={16} aria-hidden="true" />
          )}
        </span>
      </button>
      <div
        id={`record-detail-${record.id}`}
        hidden={!open}
        className="border-t border-gray-200 p-5"
      >
        {open && (
          <>
            <p className="text-base leading-relaxed text-stone-800">
              {record.description}
            </p>
            <dl className="mt-5 space-y-4 text-sm leading-relaxed">
              {details.map((detail) => (
                <div key={detail.label}>
                  <dt className="font-semibold text-stone-900">
                    {detail.label}
                  </dt>
                  <dd className="mt-1 text-stone-600">{detail.text}</dd>
                </div>
              ))}
            </dl>
            <h3 className="mt-5 font-serif !text-lg !font-bold text-stone-900">
              Fontes
            </h3>
            <ul className="mt-2 space-y-3 text-sm leading-relaxed">
              {record.sources.map((source, index) => {
                const href = safeHttpUrl(source.url);
                return href ? (
                  <li key={`${href}-${index}`}>
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline text-primary underline underline-offset-2"
                    >
                      {source.title || "Consultar fonte"}
                      <ExternalLink
                        className="ml-1 inline h-3 w-3"
                        aria-hidden="true"
                      />
                    </a>
                    {source.publishedDate && (
                      <span> · {humanDate(source.publishedDate)}</span>
                    )}
                    {source.isPrimary && <span> · fonte principal</span>}
                  </li>
                ) : null;
              })}
            </ul>
            <p className="!mt-5 text-xs text-stone-500">
              Identificador: {record.id}
              {record.siteId ? ` · Local: ${record.siteId}` : ""}
            </p>
          </>
        )}
      </div>
    </article>
  );
}
