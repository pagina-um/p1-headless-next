import Link from "next/link";
import Image from "next/image";
import { BASE, PROTOTYPE } from "../_lib/archive";
import type { Person, Source } from "../_lib/types";

export const control =
  "min-w-0 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-base text-stone-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2";
export function SourceLink({ source }: { source: Source }) {
  return (
    <a
      href={source.href}
      target="_blank"
      rel="noopener noreferrer"
      className="break-words text-primary underline underline-offset-4"
    >
      {source.label}
    </a>
  );
}
export function ContextNote() {
  return (
    <p className="max-w-3xl text-sm text-stone-600">
      Uma acusação não é prova de culpa. As contagens descrevem os casos
      catalogados, com cobertura parcial, e incluem decisões sem trânsito em
      julgado confirmado. O resultado de cada pessoa consta da respectiva ficha.
    </p>
  );
}
export function Downloads({ query = "" }: { query?: string }) {
  const suffix = query ? `&${query}` : "";
  return (
    <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm">
      <Link
        prefetch={false}
        download
        href={`${BASE}/dados?formato=json${suffix}`}
        className="text-primary underline underline-offset-4"
      >
        Descarregar JSON
      </Link>
      <Link
        prefetch={false}
        download
        href={`${BASE}/dados?formato=csv${suffix}`}
        className="text-primary underline underline-offset-4"
      >
        Descarregar CSV
      </Link>
    </div>
  );
}
export function Portrait({
  person,
  compact = false,
}: {
  person: Person;
  compact?: boolean;
}) {
  const p = person.portrait;
  return (
    <figure className={compact ? "w-20 shrink-0" : "w-40 shrink-0"}>
      {p ? (
        <Image
          src={p.src}
          alt={`Retrato de ${person.name}`}
          width={160}
          height={192}
          className="aspect-[5/6] w-full rounded-md object-cover"
          style={{ objectPosition: `50% ${p.position}%` }}
          unoptimized
        />
      ) : (
        <div
          className="flex aspect-[5/6] items-center justify-center rounded-md bg-gray-100 font-serif text-3xl text-stone-500"
          aria-label="Fotografia ainda não disponível"
        >
          {person.name
            .split(" ")
            .map((s) => s[0])
            .slice(0, 2)
            .join("")}
        </div>
      )}
      {!compact && (
        <figcaption className="mt-2 text-sm text-stone-600">
          {p ? (
            <>
              {p.credit} ·{" "}
              {p.licenseUrl ? (
                <a
                  href={p.licenseUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline"
                >
                  {p.license}
                </a>
              ) : (
                p.license
              )}
              {p.source && (
                <>
                  {" "}
                  · <SourceLink source={p.source} />
                </>
              )}
            </>
          ) : (
            "Fotografia por acrescentar"
          )}
          <br />
          <a
            className="text-primary underline"
            href={`${PROTOTYPE}/#fotografias?person=${encodeURIComponent(person.id)}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            Sugerir fotografia
          </a>
        </figcaption>
      )}
    </figure>
  );
}
