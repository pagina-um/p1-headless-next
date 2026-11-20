import { NextRequest } from "next/server";
import { filterIndex, readFilters, toCSV } from "../_lib/archive";
import {
  index,
  manifest,
  parties,
  people,
  recordById,
  records,
} from "../_lib/data";

export function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams;
  const format = query.get("formato") || "json";
  if (!["json", "csv"].includes(format))
    return new Response("Formato inválido.", { status: 400 });
  const entity = query.get("entidade") || "casos";
  if (!["casos", "partidos", "pessoas"].includes(entity))
    return new Response("Entidade inválida.", { status: 400 });
  let selected: object[];
  if (entity === "partidos") selected = parties;
  else if (entity === "pessoas") selected = people;
  else if (query.has("id")) {
    const record = recordById(query.get("id") || "");
    if (!record) return new Response("Ficha não encontrada.", { status: 404 });
    selected = [record];
  } else {
    const ids = filterIndex(index, readFilters(query)).map((r) => r.id);
    const byId = new Map(records.map((r) => [r.id, r]));
    selected = ids.map((id) => byId.get(id)!);
  }
  const body =
    format === "csv"
      ? toCSV(selected)
      : JSON.stringify(
          {
            edition: manifest,
            entity,
            count: selected.length,
            records: selected,
          },
          null,
          2
        );
  return new Response(body, {
    headers: {
      "Content-Type":
        format === "csv"
          ? "text/csv; charset=utf-8"
          : "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="casos-de-politica-${entity}-${manifest.extractedAt}.${format}"`,
      "X-Content-Type-Options": "nosniff",
    },
  });
}
