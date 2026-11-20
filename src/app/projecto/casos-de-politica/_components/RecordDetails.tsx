import Link from "next/link";
import { BASE, formatDate } from "../_lib/archive";
import type {
  CaseRecord,
  EntityCase,
  Evidence,
  Participant,
} from "../_lib/types";
import { parties } from "../_lib/data";
import { ContextNote, Downloads, SourceLink } from "./Common";

export function EvidenceList({ evidence }: { evidence: Evidence[] }) {
  return (
    <ul>
      {evidence.map((e, i) => (
        <li key={`${e.source.href}-${i}`}>
          <span>
            {e.person && (
              <strong>
                {e.person}
                {e.party ? ` · ${e.party}` : ""}:{" "}
              </strong>
            )}
            {e.description}
          </span>
          {e.period && (
            <span className="block text-sm text-stone-500">{e.period}</span>
          )}
          <SourceLink source={e.source} />
        </li>
      ))}
    </ul>
  );
}
export function EntityDetails({
  entity,
  person,
}: {
  entity: EntityCase;
  person?: string;
}) {
  const personal = (proof: Evidence[]) =>
    person
      ? proof.filter((p) => p.person === person)
      : proof.filter((p) => entity.people.includes(p.person));
  return (
    <section className="mt-5 rounded-md border border-gray-200 bg-white p-5">
      <h3>{entity.name}</h3>
      <p className="text-sm text-stone-500">
        {[entity.type, entity.municipality].filter(Boolean).join(" · ")}
      </p>
      {entity.connection && <p>{entity.connection}</p>}
      {entity.entityEvidence.length > 0 && (
        <>
          <h4 className="mt-4 font-semibold">
            Natureza e controlo da entidade
          </h4>
          <EvidenceList evidence={entity.entityEvidence} />
        </>
      )}
      <h4 className="mt-4 font-semibold">Cargo documentado</h4>
      <EvidenceList evidence={personal(entity.roleEvidence)} />
      {personal(entity.membershipEvidence).length > 0 && (
        <>
          <h4 className="mt-4 font-semibold">
            Filiação partidária documentada
          </h4>
          <EvidenceList evidence={personal(entity.membershipEvidence)} />
        </>
      )}
      {personal(entity.politicalRoleEvidence).length > 0 && (
        <>
          <h4 className="mt-4 font-semibold">Cargo político documentado</h4>
          <EvidenceList evidence={personal(entity.politicalRoleEvidence)} />
        </>
      )}
    </section>
  );
}
export function ProceduralNote({ person }: { person: Participant }) {
  const status = person.proceduralStatus;
  return status ? (
    <div className="mt-3 border-l-2 border-gray-300 pl-4 text-sm">
      <strong>{status.label}</strong>
      <p>
        Estatuto documentado em {formatDate(status.asOf)}.{" "}
        <SourceLink source={status.source} />
      </p>
    </div>
  ) : null;
}
export function RecordDetails({ record: r }: { record: CaseRecord }) {
  const partyName = (id: string) =>
    parties.find((p) => p.id === id)?.abbr || id;
  return (
    <article className="min-w-0">
      <div className="mb-4 flex flex-wrap gap-2">
        {r.parties.map((p) => (
          <Link
            href={`${BASE}/casos?p=${encodeURIComponent(p)}`}
            key={p}
            className="rounded bg-white px-3 py-1 text-sm text-primary"
          >
            {partyName(p)}
          </Link>
        ))}
      </div>
      <h2>{r.title}</h2>
      <p className="font-semibold">
        {r.phase} · {r.status}
      </p>
      <ContextNote />
      <p className="max-w-3xl">{r.summary}</p>
      {r.people.length > 0 && (
        <div
          className="my-5 flex flex-wrap gap-2"
          aria-label="Pessoas desta ficha"
        >
          {r.people.map((p) => (
            <Link
              key={p.id}
              href={`${BASE}/pessoas/${p.id}`}
              className="rounded-full border border-gray-200 bg-white px-3 py-1 text-sm text-primary"
            >
              {p.name}
            </Link>
          ))}
        </div>
      )}
      <div className="max-w-3xl">
        <p>{r.detail}</p>
      </div>
      <dl className="my-6 grid gap-4 rounded-md border border-gray-200 bg-white p-5 sm:grid-cols-2 lg:grid-cols-3">
        {[
          [
            r.dateKind || "Data de referência",
            r.dateLabel ? formatDate(r.dateLabel) : `Exercício de ${r.year}`,
          ],
          ["Natureza", r.nature],
          ["Consulta das fontes", formatDate(r.checkedAt)],
          ["Processo", r.caseNumber],
          ["Tribunal", r.court],
          ["Local", r.location],
        ]
          .filter(([, value]) => value)
          .map(([label, value]) => (
            <div key={label}>
              <dt className="text-[11px] uppercase tracking-wider text-stone-500">
                {label}
              </dt>
              <dd className="mt-1 break-words">{value}</dd>
            </div>
          ))}
      </dl>
      {r.affiliation && (
        <section className="mt-6 max-w-3xl">
          <h3>Ligação política e cargo</h3>
          <p>{r.affiliation}</p>
        </section>
      )}
      {Object.keys(r.partyOutcomes).length > 0 && (
        <section className="mt-6 max-w-3xl">
          <h3>Desfechos usados na síntese por partido</h3>
          <ul>
            {Object.entries(r.partyOutcomes).map(([id, phase]) => (
              <li key={id}>
                <strong>{partyName(id)}:</strong> {phase}
              </li>
            ))}
          </ul>
          <p>
            O caso conta uma vez por partido. Os resultados individuais são
            descritos nos papéis de cada pessoa.
          </p>
        </section>
      )}
      {(r.penalty || r.amount !== null) && (
        <section className="mt-6 max-w-3xl">
          <h3>Pena ou obrigação documentada</h3>
          {r.penalty && <p>{r.penalty}</p>}
          {r.amount !== null && (
            <p>
              Coima do partido nesta decisão:{" "}
              {new Intl.NumberFormat("pt-PT", {
                style: "currency",
                currency: "EUR",
              }).format(r.amount)}
              .
            </p>
          )}
        </section>
      )}
      <section className="mt-6 max-w-3xl">
        <h3>O que se sabe sobre o desfecho</h3>
        <p>
          {r.finality ||
            "Documento de consulta. A inclusão não constitui juízo sobre a regularidade das contas."}
        </p>
        <p className="text-sm text-stone-500">
          A consulta recente de uma notícia antiga não certifica o estado actual
          do processo.
        </p>
      </section>
      {r.mandate && (
        <section className="mt-6 max-w-3xl">
          <h3>Perda de mandato administrativa</h3>
          <p>{r.mandate.reason}</p>
          <p>{r.mandate.finality}</p>
          {r.mandate.scope && <p>{r.mandate.scope}</p>}
          {Array.isArray(r.mandate.proceedings) && (
            <ul>
              {r.mandate.proceedings.map((proceeding, i) => (
                <li key={i}>
                  {proceeding.applicant}
                  {proceeding.caseNumber ? ` · ${proceeding.caseNumber}` : ""}
                  {" · "}
                  {proceeding.outcome === "reversed"
                    ? "Perda de mandato revogada"
                    : proceeding.outcome === "extinguished"
                      ? "Processo extinto"
                      : proceeding.outcome}
                  {" · "}
                  {formatDate(proceeding.decisionDate)}
                </li>
              ))}
            </ul>
          )}
        </section>
      )}
      {r.timeline.length > 0 && (
        <section className="mt-8 max-w-3xl">
          <h3>Histórico do caso</h3>
          <ol className="space-y-4">
            {r.timeline.map((e, i) => (
              <li key={i}>
                <time
                  dateTime={e.dateLabel}
                  className="text-sm font-semibold text-stone-500"
                >
                  {formatDate(e.dateLabel)}
                </time>
                <p>{e.text}</p>
              </li>
            ))}
          </ol>
        </section>
      )}
      <section className="mt-8 max-w-3xl">
        <h3>Fontes consultadas</h3>
        <ul className="space-y-3">
          {r.sources.map((s, i) => (
            <li key={`${s.href}-${i}`}>
              <span className="block text-xs uppercase tracking-wider text-stone-500">
                {s.kind}
              </span>
              <SourceLink source={s} />
            </li>
          ))}
        </ul>
      </section>
      {r.people.length > 0 && (
        <section className="mt-8 max-w-3xl">
          <h3>Pessoas e respectivos papéis</h3>
          {r.people.map((p) => (
            <div
              key={p.id}
              className="mt-4 rounded-md border border-gray-200 bg-white p-5"
            >
              <Link
                href={`${BASE}/pessoas/${p.id}`}
                className="font-semibold text-primary underline"
              >
                {p.name}
              </Link>
              {p.fullName && (
                <p className="text-sm text-stone-500">
                  Nome no documento: {p.fullName}
                </p>
              )}
              <p>{p.role}</p>
              <ProceduralNote person={p} />
            </div>
          ))}
        </section>
      )}
      {r.entityCases.length > 0 && (
        <section className="mt-8 max-w-3xl">
          <h3>Cargos públicos e ligação política</h3>
          {r.entityCases.map((e, i) => (
            <EntityDetails key={i} entity={e} />
          ))}
        </section>
      )}
      <div className="mt-8">
        <Downloads query={`id=${encodeURIComponent(r.id)}`} />
      </div>
    </article>
  );
}
