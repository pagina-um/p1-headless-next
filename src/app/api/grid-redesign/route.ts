import { NextResponse } from "next/server";
import { generateObject } from "ai";
import { z } from "zod";
import { getClient, GET_POSTS_BY_IDS } from "@/services/wp-graphql";
import { verifyAdminToken } from "@/services/admin-token";
import { plainErrorMessage, stripTags } from "@/utils/promoDraft";
import {
  bandsToPlacements,
  buildRedesignPrompt,
  chunkRanges,
  dedupeProposal,
  sortProposalByClaims,
  resolvePlacements,
  mergeRedesign,
  validateRedesign,
  RedesignSchema,
  ART_DIRECTION_SYSTEM_PROMPT,
  REDESIGN_SYSTEM_PROMPT,
  StoryPromptMeta,
  type RedesignProposal,
} from "@/utils/redesign";
import type { Block, CustomPostFields, GridState, StoryBlock } from "@/types";

// A full-cover restyle is a much bigger generation than a tweet draft.
export const maxDuration = 120;

// Routed through the Vercel AI Gateway, same as the promo drafts. Needs
// AI_GATEWAY_API_KEY locally; on Vercel the OIDC token covers it.
const MODEL = process.env.AI_MODEL ?? "anthropic/claude-sonnet-4.6";

const MAX_POSTS_PER_QUERY = 100;

function isOpinionCategory(name: string): boolean {
  const normalized = name.toLowerCase();
  return normalized.includes("opini") || normalized.includes("crónica");
}

async function fetchStoryMeta(
  blocks: Block[]
): Promise<Map<number, StoryPromptMeta>> {
  const ids = Array.from(
    new Set(
      blocks
        .filter((block): block is StoryBlock => block.blockType === "story")
        .map((block) => block.databaseId)
        .filter((databaseId) => databaseId != null)
    )
  );
  if (ids.length === 0) return new Map();

  const chunks: number[][] = [];
  for (let i = 0; i < ids.length; i += MAX_POSTS_PER_QUERY) {
    chunks.push(ids.slice(i, i + MAX_POSTS_PER_QUERY));
  }

  const meta = new Map<number, StoryPromptMeta>();
  for (const chunk of chunks) {
    const { data, error } = await getClient().query(GET_POSTS_BY_IDS, {
      ids: chunk.map(String),
      first: chunk.length,
    });
    if (error) {
      throw new Error(`Failed to load story posts: ${error.message}`, {
        cause: error,
      });
    }
    for (const post of data?.posts?.nodes ?? []) {
      if (post?.databaseId == null) continue;
      // The generated schema types the ACF group as {} — same cast the rest
      // of the codebase uses (see utils/categoryUtils.ts).
      const fields = (post.postFields ?? {}) as CustomPostFields;
      const categories = (post.categories?.nodes ?? [])
        .map((category) => category?.name)
        .filter((name): name is string => Boolean(name));
      const media = post.featuredImage?.node?.mediaDetails;
      const imageDescription =
        media?.width && media?.height
          ? `${media.width}×${media.height} (${
              media.width > media.height
                ? "apaisada"
                : media.width < media.height
                  ? "ao alto"
                  : "quadrada"
            }, rácio ${(media.width / media.height).toFixed(2)})`
          : undefined;

      meta.set(post.databaseId, {
        title: stripTags(post.title ?? ""),
        antetitulo: fields.antetitulo ? stripTags(fields.antetitulo) : undefined,
        chamadaManchete: fields.chamadaManchete
          ? stripTags(fields.chamadaManchete)
          : undefined,
        chamadaDestaque: fields.chamadaDestaque
          ? stripTags(fields.chamadaDestaque)
          : undefined,
        excerpt: post.excerpt
          ? stripTags(post.excerpt).slice(0, 200)
          : undefined,
        author: post.author?.node?.name ?? undefined,
        categories,
        isOpinion: categories.some(isOpinionCategory),
        imageDescription,
      });
    }
  }
  return meta;
}

/**
 * Admin-only, strictly read-only: propose an AI restyle of the cover the
 * editor sends in. Nothing is persisted here — the proposal goes back to the
 * admin UI as unsaved changes, and only the editor's explicit "Guardar Layout"
 * writes it (which matters doubly because local dev talks to production
 * Redis — see services/config.ts).
 */
export async function POST(req: Request) {
  if (!verifyAdminToken(req.headers.get("x-admin-token"))) {
    return NextResponse.json({ error: "não autorizado" }, { status: 401 });
  }

  const { gridState, screenshot } = (await req.json().catch(() => ({}))) as {
    gridState?: GridState;
    /** data:image/... URL of the current page, captured in the admin. */
    screenshot?: string;
  };
  const blocks = gridState?.blocks;
  if (
    !Array.isArray(blocks) ||
    blocks.length === 0 ||
    !blocks.every(
      (block) => block?.uId && block.blockType && block.gridPosition
    )
  ) {
    return NextResponse.json(
      { error: "gridState inválido ou vazio" },
      { status: 400 }
    );
  }

  let meta: Map<number, StoryPromptMeta>;
  try {
    meta = await fetchStoryMeta(blocks);
  } catch (e) {
    console.error("[grid-redesign] WordPress fetch failed", e);
    return NextResponse.json(
      { error: "não foi possível carregar as peças no WordPress" },
      { status: 502 }
    );
  }

  // Stage 0 — art direction: one vision pass over a screenshot of the current
  // page produces a concrete styling brief. It is prepended to every section
  // prompt, which is also what keeps the sections stylistically coherent.
  // Optional: without a screenshot the redesign still runs, just blinder.
  let artDirection: string | undefined;
  if (typeof screenshot === "string" && screenshot.startsWith("data:image/")) {
    try {
      const { object } = await generateObject({
        model: MODEL,
        schema: z.object({
          diagnostico: z
            .string()
            .describe("o que torna a página atual monótona ou desequilibrada"),
          diretrizes: z
            .string()
            .describe("diretrizes concretas de estilo para o redesenho"),
        }),
        system: ART_DIRECTION_SYSTEM_PROMPT,
        messages: [
          {
            role: "user",
            content: [
              { type: "image", image: screenshot },
              {
                type: "text",
                text: "A primeira página tal como está agora. Analisa e escreve as diretrizes.",
              },
            ],
          },
        ],
        maxOutputTokens: 2_000,
      });
      artDirection = `${object.diagnostico}\n\nDiretrizes:\n${object.diretrizes}`;
      console.log("[grid-redesign] art direction:", artDirection);
    } catch (e) {
      console.warn("[grid-redesign] art direction pass failed, continuing", e);
    }
  }

  // The model reliably stops designing after ~20 blocks in a single pass, so
  // big pages are generated as stacked sections (in parallel — sections are
  // independent) and their bands concatenated top to bottom.
  const CHUNK_SIZE = 12;
  const ranges = chunkRanges(blocks.length, CHUNK_SIZE);
  let lastError: unknown = null;
  let pageFeedback: string | null = null;

  const generateSection = async (range: {
    from: number;
    to: number;
  }): Promise<RedesignProposal["bands"]> => {
    const expected = range.to - range.from + 1;
    const basePrompt = buildRedesignPrompt(blocks, meta, range, artDirection);
    let feedback = pageFeedback;
    let lastProblem = "";
    // Off-by-one sections are tolerable: the global resolve step repairs
    // duplicated/missing positions as long as the page total matches, so
    // after the retries we hand back the closest attempt rather than fail.
    let best: { bands: RedesignProposal["bands"]; miss: number } | null = null;
    for (let attempt = 0; attempt < 3; attempt++) {
      const { object: proposal }: { object: RedesignProposal } =
        await generateObject({
          model: MODEL,
          schema: RedesignSchema,
          system: REDESIGN_SYSTEM_PROMPT,
          prompt: feedback ? `${basePrompt}\n\n${feedback}` : basePrompt,
          // A section is well under 2k output tokens; the cap bounds how long
          // a runaway generation can take.
          maxOutputTokens: 8_000,
          // Low temperature: this is constraint satisfaction, not prose.
          temperature: 0.2,
          // The gateway does not enforce the schema server-side, and the
          // model hand-writes JSON with occasional trailing commas — strip
          // them instead of failing the whole generation.
          experimental_repairText: async ({ text }) =>
            text.replace(/,\s*([}\]])/g, "$1"),
        });

      const deduped = dedupeProposal(sortProposalByClaims(proposal));
      const slots = bandsToPlacements(deduped);
      const outOfRange = slots.some(
        (slot) => slot.position < range.from || slot.position > range.to
      );
      if (slots.length === expected && !outOfRange) return deduped.bands;

      const miss = Math.abs(slots.length - expected) + (outOfRange ? 1 : 0);
      if (slots.length > 0 && (!best || miss < best.miss)) {
        best = { bands: deduped.bands, miss };
      }
      lastProblem =
        `devolveu ${slots.length} de ${expected} blocos` +
        (outOfRange ? ", com positions fora da secção" : "");
      console.warn(
        `[grid-redesign] secção #${range.from}-#${range.to}, tentativa ${attempt + 1}: ${lastProblem}`
      );
      feedback =
        (pageFeedback ? `${pageFeedback}\n\n` : "") +
        `NOTA: a tua resposta anterior ${lastProblem}. Esta secção tem ` +
        `exatamente ${expected} blocos — as positions #${range.from} a ` +
        `#${range.to}, cada uma exatamente uma vez. Devolve a secção ` +
        "completa.";
    }
    if (best) return best.bands;
    throw new Error(`secção #${range.from}-#${range.to}: ${lastProblem}`);
  };

  for (let pass = 0; pass < 2; pass++) {
    let bands: RedesignProposal["bands"];
    try {
      const sections = await Promise.all(ranges.map(generateSection));
      bands = sections.flat();
    } catch (e) {
      console.error(`[grid-redesign] pass ${pass + 1} failed`, e);
      lastError = e;
      continue;
    }

    const rawPlacements = bandsToPlacements({ bands });
    // Two ways to bind slots to blocks: by the model's claimed positions
    // (keeps its design intent), and by pure geometric reading order (fixes
    // order swaps deterministically). Accept the first that validates.
    const primary = resolvePlacements(blocks, rawPlacements);
    if (!primary) {
      console.warn(
        `[grid-redesign] pass ${pass + 1}: ${rawPlacements.length} slots for ${blocks.length} blocks`
      );
      pageFeedback =
        "NOTA: uma proposta anterior não devolveu o número certo de blocos. " +
        "Cumpre exatamente as positions pedidas, cada uma uma vez.";
      continue;
    }
    const geometric = resolvePlacements(blocks, rawPlacements, true)!;

    let errors: string[] = [];
    let accepted: { placements: typeof primary; warnings: string[] } | null =
      null;
    for (const placements of [primary, geometric]) {
      const verdict = validateRedesign(blocks, placements);
      if (verdict.errors.length === 0) {
        accepted = { placements, warnings: verdict.warnings };
        break;
      }
      if (errors.length === 0) errors = verdict.errors;
    }

    if (accepted) {
      return NextResponse.json({
        gridState: {
          blocks: mergeRedesign(blocks, accepted.placements),
          createdAt: gridState!.createdAt,
        },
        warnings: accepted.warnings,
      });
    }

    console.warn(`[grid-redesign] pass ${pass + 1} rejected:`, errors);
    pageFeedback =
      "NOTA: uma proposta anterior para esta página foi rejeitada pelos " +
      "problemas abaixo (os números #N são posições de leitura da página " +
      "inteira). Evita estes erros:\n" +
      errors.map((error) => `- ${error}`).join("\n");
  }

  if (lastError) {
    return NextResponse.json(
      {
        error:
          lastError instanceof Error
            ? `A IA não gerou o redesenho (${plainErrorMessage(lastError.message)}).`
            : "A IA não gerou o redesenho.",
      },
      { status: 502 }
    );
  }
  return NextResponse.json(
    {
      error:
        "A IA não conseguiu produzir um redesenho válido que preservasse " +
        "a ordem e a hierarquia editoriais. Tente de novo.",
    },
    { status: 422 }
  );
}
