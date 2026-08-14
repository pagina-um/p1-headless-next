import { z } from "zod";
import {
  Block,
  densities,
  objectPositions,
  titleFonts,
  titleScales,
  StoryStyleTokens,
} from "@/types";
import { BLOCK_MIN_ROWS, GRID_COLUMNS } from "@/constants/blocks";
import { findEmptySpaces } from "./grid";
import { zigZagSortingFunction } from "./sorting";

/**
 * Pure logic for the AI cover redesign (/api/grid-redesign): the schema the
 * model must fill, the merge of its proposal onto the editors' blocks, the
 * validation that guards the editorial decisions (reading order, prominence),
 * and the prompt builders. Kept free of React and server imports so it can be
 * unit-tested directly.
 */

// The model never emits free coordinates — asking it to keep ~40 rectangles
// mutually consistent fails in practice (overlaps everywhere). It returns the
// page as BANDS of COLUMNS instead: bands stack top to bottom, each band holds
// columns left to right whose widths sum to 10, each column stacks blocks.
// Coordinates are derived from that structure, so overlaps and holes are
// impossible by construction. Identity fields (uId, blockType, databaseId,
// postId, text overrides, mobilePriority, category/static config) never
// round-trip through the model, so they cannot be hallucinated or dropped.
const designFields = {
  style: z.enum(["classic", "modern"]).optional(),
  orientation: z.enum(["horizontal", "vertical"]).optional(),
  objectPosition: z.enum(objectPositions).optional(),
  hideImage: z.boolean().optional(),
  reverse: z.boolean().optional(),
  expandImage: z.boolean().optional(),
  extraBigTitle: z.boolean().optional(),
  antetituloColor: z.enum(["auto", "noticia", "opiniao"]).optional(),
  // Fine-grained typography tokens (see StoryStyleTokens).
  titleScale: z.enum(titleScales).optional(),
  titleFont: z.enum(titleFonts).optional(),
  titleAlign: z.enum(["left", "center"]).optional(),
  showChamada: z.boolean().optional(),
  density: z.enum(densities).optional(),
};

// Numeric bounds are deliberately loose: a single out-of-range value would
// abort the whole generation (NoObjectGeneratedError) instead of becoming
// feedback the retry can fix. bandsToPlacements clamps, validateRedesign
// judges.
const BandBlockSchema = z.object({
  position: z
    .number()
    .int()
    .describe(
      "posição do bloco na ordem de leitura (o número da legenda, 1 a N)"
    ),
  height: z
    .number()
    .int()
    .describe(
      "altura em linhas (mín. 1); numa coluna com vários blocos, as alturas somam a altura da banda"
    ),
  ...designFields,
});

const ColumnSchema = z.object({
  width: z.number().int().describe("largura em colunas (1 a 10)"),
  blocks: z.array(BandBlockSchema).describe("empilhados de cima para baixo"),
});

const BandSchema = z.object({
  columns: z
    .array(ColumnSchema)
    .describe("da esquerda para a direita; as larguras têm de somar 10"),
});

export const RedesignSchema = z.object({
  bands: z.array(BandSchema).describe("bandas da página, de cima para baixo"),
});

export type RedesignProposal = z.infer<typeof RedesignSchema>;

interface PlacementDesign extends StoryStyleTokens {
  style?: "classic" | "modern";
  orientation?: "horizontal" | "vertical";
  objectPosition?: (typeof objectPositions)[number];
  hideImage?: boolean;
  reverse?: boolean;
  expandImage?: boolean;
  extraBigTitle?: boolean;
  antetituloColor?: "auto" | "noticia" | "opiniao";
}

/** A geometry slot from the band structure, tagged with the reading position
 * the model claims it designed it for. */
export interface SlotPlacement extends PlacementDesign {
  position: number;
  x: number;
  y: number;
  width: number;
  height: number;
}

/** A resolved per-block decision: geometry + optional story design fields. */
export interface Placement extends PlacementDesign {
  uId: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Normalize a proposal into its own claimed reading order: blocks within a
 * column, columns within a band (by their smallest position) and the bands
 * themselves are sorted by position. The model often designs a good band but
 * puts the lower-priority block in the left rail; sorting keeps its sizes
 * and designs while making the derived geometry read in claim order.
 */
export function sortProposalByClaims(
  proposal: RedesignProposal
): RedesignProposal {
  const minPosition = (blocks: { position: number }[]) =>
    Math.min(...blocks.map((block) => block.position));
  const bands = proposal.bands
    .filter((band) => band.columns.some((column) => column.blocks.length > 0))
    .map((band) => ({
      columns: band.columns
        .filter((column) => column.blocks.length > 0)
        .map((column) => ({
          width: column.width,
          blocks: [...column.blocks].sort((a, b) => a.position - b.position),
        }))
        .sort((a, b) => minPosition(a.blocks) - minPosition(b.blocks)),
    }));
  return {
    bands: [...bands].sort(
      (a, b) =>
        minPosition(a.columns.flatMap((column) => column.blocks)) -
        minPosition(b.columns.flatMap((column) => column.blocks))
    ),
  };
}

/**
 * Drop repeated positions from a proposal, keeping the first occurrence in
 * band order. Duplicating one block is the model's most common counting slip;
 * removing the repeat and letting bandsToPlacements' stretching close the
 * freed space salvages the section without a regeneration.
 */
export function dedupeProposal(proposal: RedesignProposal): RedesignProposal {
  const seen = new Set<number>();
  return {
    bands: proposal.bands
      .map((band) => ({
        columns: band.columns
          .map((column) => ({
            width: column.width,
            blocks: column.blocks.filter((block) => {
              if (seen.has(block.position)) return false;
              seen.add(block.position);
              return true;
            }),
          }))
          .filter((column) => column.blocks.length > 0),
      }))
      .filter((band) => band.columns.length > 0),
  };
}

/**
 * Resolve a band/column proposal into concrete placements, with deterministic
 * repairs where the model's arithmetic slips: column widths are clamped and
 * the last column stretched so every band spans the full 10 columns, and the
 * last block of each column is stretched to the band's height (the tallest
 * column stack defines it). Anything these repairs distort (e.g. a squashed
 * column) still has to get past validateRedesign.
 */
export function bandsToPlacements(proposal: RedesignProposal): SlotPlacement[] {
  const placements: SlotPlacement[] = [];
  let y = 0;

  for (const band of proposal.bands) {
    const columns = band.columns.filter((column) => column.blocks.length > 0);
    if (columns.length === 0) continue;

    const bandHeight = Math.max(
      1,
      ...columns.map((column) =>
        column.blocks.reduce((sum, block) => sum + Math.max(block.height, 1), 0)
      )
    );

    let x = 0;
    columns.forEach((column, columnIndex) => {
      if (x >= GRID_COLUMNS) return; // no room left; validation flags the miss
      const isLast = columnIndex === columns.length - 1;
      const width = isLast
        ? GRID_COLUMNS - x
        : Math.max(Math.min(column.width, GRID_COLUMNS - x), 1);

      let blockY = y;
      column.blocks.forEach((block, blockIndex) => {
        const remaining = y + bandHeight - blockY;
        const blocksAfter = column.blocks.length - 1 - blockIndex;
        const height =
          blocksAfter === 0
            ? Math.max(remaining, 1) // stretch to close the band
            : Math.max(Math.min(block.height, remaining - blocksAfter), 1);
        const { position, height: _height, ...design } = block;
        placements.push({ position, x, y: blockY, width, height, ...design });
        blockY += height;
      });
      x += width;
    });

    y += bandHeight;
  }

  return placements;
}

// A hole the size of a full row reads as broken, not as breathing room.
const GAP_ERROR_CELLS = GRID_COLUMNS;

// Tailwind only generates lg:row-start-N up to 56 (tailwind.config.js). Grids
// taller than that already exist and render by implicit flow, but a redesign
// should not push a page past the cap when the original respected it.
const ROW_START_CAP = 56;

function minRowsFor(block: Block): number {
  return block.blockType === "static" ? 1 : BLOCK_MIN_ROWS;
}

/** Pure geometric reading order (no mobilePriority shift). */
function zigzagOrder(blocks: Block[]): string[] {
  return [...blocks]
    .sort((a, b) => zigZagSortingFunction(a, b, 6))
    .map((block) => block.uId);
}

// Same formula GridContext applies when the editor resizes a category block.
// Replicated here (5 lines) rather than imported: GridContext is "use client".
function postsPerPageForArea(width: number, height: number): number {
  const isLandscape = width * 1.5 > height;
  return isLandscape ? Math.floor(width / 2) : Math.floor(height / 1.5);
}

/**
 * Apply the model's placements onto the editors' blocks. Geometry is copied to
 * every block; design fields only to story blocks; category blocks get their
 * postsPerPage recomputed when the size changed, mirroring what the manual
 * resize handler does. Blocks without a matching placement pass through
 * untouched (validateRedesign reports them as hard errors).
 */
export function mergeRedesign(
  original: Block[],
  placements: Placement[]
): Block[] {
  const byUid = new Map(placements.map((placement) => [placement.uId, placement]));

  return original.map((block): Block => {
    const placement = byUid.get(block.uId);
    if (!placement) return block;

    const gridPosition = {
      x: placement.x,
      y: placement.y,
      width: placement.width,
      height: placement.height,
    };

    if (block.blockType === "story") {
      const styleTokens: StoryStyleTokens = { ...block.styleTokens };
      if (placement.titleScale) styleTokens.titleScale = placement.titleScale;
      if (placement.titleFont) styleTokens.titleFont = placement.titleFont;
      if (placement.titleAlign) styleTokens.titleAlign = placement.titleAlign;
      if (placement.showChamada !== undefined) {
        styleTokens.showChamada = placement.showChamada;
      }
      if (placement.density) styleTokens.density = placement.density;

      return {
        ...block,
        gridPosition,
        style: placement.style ?? block.style,
        orientation: placement.orientation ?? block.orientation,
        objectPosition: placement.objectPosition ?? block.objectPosition,
        hideImage: placement.hideImage ?? block.hideImage,
        reverse: placement.reverse ?? block.reverse,
        expandImage: placement.expandImage ?? block.expandImage,
        extraBigTitle: placement.extraBigTitle ?? block.extraBigTitle,
        antetituloColor: placement.antetituloColor ?? block.antetituloColor,
        styleTokens:
          Object.keys(styleTokens).length > 0 ? styleTokens : block.styleTokens,
      };
    }

    if (block.blockType === "category") {
      const sizeChanged =
        block.gridPosition.width !== gridPosition.width ||
        block.gridPosition.height !== gridPosition.height;
      return {
        ...block,
        gridPosition,
        postsPerPage: sizeChanged
          ? postsPerPageForArea(gridPosition.width, gridPosition.height)
          : block.postsPerPage,
      };
    }

    return { ...block, gridPosition };
  });
}

/**
 * Turn geometry slots (tagged with claimed reading positions) into concrete
 * per-block placements. The model never names blocks — the editors' reading
 * order does: position N means "the N-th block of the reading-order list".
 *
 * When the claimed positions are exactly the permutation 1..N, each slot gets
 * the block it was designed for, design fields included — even if the
 * geometry puts it in the wrong reading spot, which validateRedesign then
 * reports in terms the model can act on. Otherwise (duplicated or missing
 * positions) the slots are assigned by their geometric reading order, and a
 * slot only keeps its design fields where its claim agrees with that order.
 *
 * Returns null when the slot count differs from the block count — that can't
 * be repaired and needs a retry.
 */
export function resolvePlacements(
  original: Block[],
  slots: SlotPlacement[],
  forceGeometric = false
): Placement[] | null {
  if (slots.length !== original.length) return null;

  const readingUids = zigzagOrder(original);
  const toPlacement = (slot: SlotPlacement, uId: string, keepDesign: boolean): Placement => {
    const { position: _position, x, y, width, height, ...design } = slot;
    return keepDesign
      ? { uId, x, y, width, height, ...design }
      : { uId, x, y, width, height };
  };

  const claimed = slots.map((slot) => slot.position);
  const isPermutation =
    new Set(claimed).size === slots.length &&
    claimed.every((position) => position >= 1 && position <= slots.length);

  if (isPermutation && !forceGeometric) {
    return slots.map((slot) =>
      toPlacement(slot, readingUids[slot.position - 1], true)
    );
  }

  const byReadingOrder = slots
    .map((slot, index) => ({ slot, index }))
    .sort(
      (a, b) =>
        a.slot.y * 6 + a.slot.x - (b.slot.y * 6 + b.slot.x) ||
        a.index - b.index
    );
  const resolved: Placement[] = new Array(slots.length);
  byReadingOrder.forEach(({ slot, index }, readingIndex) => {
    resolved[index] = toPlacement(
      slot,
      readingUids[readingIndex],
      slot.position === readingIndex + 1
    );
  });
  return resolved;
}

export interface RedesignValidation {
  errors: string[];
  warnings: string[];
}

function overlaps(a: Block, b: Block): boolean {
  const p = a.gridPosition;
  const q = b.gridPosition;
  return (
    p.x < q.x + q.width &&
    q.x < p.x + p.width &&
    p.y < q.y + q.height &&
    q.y < p.y + p.height
  );
}

function totalHeight(blocks: Block[]): number {
  return blocks.length
    ? Math.max(...blocks.map((b) => b.gridPosition.y + b.gridPosition.height))
    : 0;
}

// Errors are fed back to the model, which knows blocks by their reading
// position ("#12"), never by uId.
function label(block: Block, posOf: Map<string, number>): string {
  const position = `#${posOf.get(block.uId) ?? "?"}`;
  if (block.blockType === "story") {
    return `a história ${position}${block.title ? ` (“${block.title}”)` : ""}`;
  }
  if (block.blockType === "category") {
    return `o bloco de categoria ${position} (${block.wpCategoryName})`;
  }
  return `o bloco estático ${position} (${block.type})`;
}

/**
 * Validate a proposal against the original layout. Errors mean the proposal
 * must not be applied (the route retries once with the error list, then gives
 * up); warnings are surfaced to the editor but do not block.
 */
export function validateRedesign(
  original: Block[],
  placements: Placement[]
): RedesignValidation {
  const errors: string[] = [];
  const warnings: string[] = [];
  const posOf = new Map(zigzagOrder(original).map((uId, i) => [uId, i + 1]));

  // uId bijection first: everything else assumes a 1:1 match. With
  // resolvePlacements in front of this the check cannot fail, but validate
  // stands on its own.
  const originalUids = new Set(original.map((block) => block.uId));
  const seen = new Set<string>();
  for (const placement of placements) {
    if (!originalUids.has(placement.uId)) {
      errors.push(`bloco desconhecido na proposta: ${placement.uId}`);
    } else if (seen.has(placement.uId)) {
      errors.push(`bloco repetido na proposta: #${posOf.get(placement.uId)}`);
    }
    seen.add(placement.uId);
  }
  originalUids.forEach((uId) => {
    if (!seen.has(uId)) {
      errors.push(`bloco em falta na proposta: #${posOf.get(uId)}`);
    }
  });
  if (errors.length > 0) return { errors, warnings };

  const merged = mergeRedesign(original, placements);

  const originalHeightOf = new Map(
    original.map((block) => [block.uId, block.gridPosition.height])
  );
  for (const block of merged) {
    const { x, y, width, height } = block.gridPosition;
    if (x < 0 || y < 0 || x + width > GRID_COLUMNS) {
      errors.push(
        `${label(block, posOf)} sai da grelha (x=${x}, largura=${width}, máx. ${GRID_COLUMNS} colunas)`
      );
    }
    // Grandfathered: an editor-made block already below the minimum keeps its
    // own height as the floor.
    const minRows = Math.min(
      minRowsFor(block),
      originalHeightOf.get(block.uId) ?? minRowsFor(block)
    );
    if (height < minRows) {
      errors.push(
        `${label(block, posOf)} tem altura ${height}, abaixo do mínimo de ${minRows} linhas`
      );
    }
    if (block.blockType === "story" && width < 2) {
      warnings.push(
        `${label(block, posOf)} tem largura 1 — provavelmente ilegível`
      );
    }
  }

  for (let i = 0; i < merged.length; i++) {
    for (let j = i + 1; j < merged.length; j++) {
      if (overlaps(merged[i], merged[j])) {
        errors.push(
          `${label(merged[i], posOf)} sobrepõe-se a ${label(merged[j], posOf)}`
        );
      }
    }
  }

  const holes = findEmptySpaces(merged);
  const emptyCells = holes.reduce((sum, hole) => sum + hole.width * hole.height, 0);
  if (emptyCells > GAP_ERROR_CELLS) {
    errors.push(
      `a grelha tem ${emptyCells} células vazias (máx. tolerado ${GAP_ERROR_CELLS}): ` +
        holes
          .map((h) => `${h.width}×${h.height} em (${h.x},${h.y})`)
          .join(", ")
    );
  } else if (emptyCells > 0) {
    warnings.push(
      `a grelha ficou com ${emptyCells} células vazias: ` +
        holes
          .map((h) => `${h.width}×${h.height} em (${h.x},${h.y})`)
          .join(", ")
    );
  }

  // The core editorial guarantee: the pure geometric reading order. Uses the
  // production sort key (factor 6 despite the 10-column grid — see
  // sortBlocksZigzagThenMobilePriority in NewsGrid) but deliberately WITHOUT
  // the mobilePriority shift: priorities are untouched by the merge, so equal
  // geometric order implies equal mobile order too, and the model cannot be
  // expected to reverse-engineer priority arithmetic into coordinates.
  const orderBefore = zigzagOrder(original);
  const orderAfter = zigzagOrder(merged);
  if (orderBefore.join("|") !== orderAfter.join("|")) {
    const firstDiff = orderBefore.findIndex((uId, i) => uId !== orderAfter[i]);
    errors.push(
      `a ordem de leitura foi alterada: na posição de leitura ` +
        `${firstDiff + 1} devia ficar o bloco #${firstDiff + 1}, mas a ` +
        `geometria põe lá o bloco #${posOf.get(orderAfter[firstDiff])}`
    );
  }

  // Prominence: a story the editors made bigger than another should stay at
  // least as big. Only the manchete's dominance is sacred: another story
  // outgrowing the rank-1 story by more than a 20% margin is an error.
  // Everything else is summarized as one warning per story that fell
  // noticeably in the area ranking — the editor reviews those in the admin
  // and can fix them in the preview. Demanding the exact pairwise ordering
  // of ~30 stories is stricter than the editorial intent and the model
  // cannot reliably satisfy it.
  const mergedArea = new Map(
    merged.map((block) => [
      block.uId,
      block.gridPosition.width * block.gridPosition.height,
    ])
  );
  const storiesByOriginalArea = original
    .filter((block) => block.blockType === "story")
    .map((block) => ({
      uId: block.uId,
      area: block.gridPosition.width * block.gridPosition.height,
      newArea: mergedArea.get(block.uId) ?? 0,
    }))
    .sort((a, b) => b.area - a.area);
  if (storiesByOriginalArea.length > 1) {
    const manchete = storiesByOriginalArea[0];
    const biggestNow = storiesByOriginalArea.reduce((best, story) =>
      story.newArea > best.newArea ? story : best
    );
    if (
      biggestNow.uId !== manchete.uId &&
      biggestNow.newArea > manchete.newArea * 1.2
    ) {
      errors.push(
        `hierarquia invertida: a história #${posOf.get(manchete.uId)} é a ` +
          `manchete mas a #${posOf.get(biggestNow.uId)} ficou claramente ` +
          `maior (${biggestNow.newArea} vs ${manchete.newArea} células)`
      );
    }

    const newRankOf = new Map(
      [...storiesByOriginalArea]
        .sort((a, b) => b.newArea - a.newArea)
        .map((story, i) => [story.uId, i])
    );
    storiesByOriginalArea.forEach((story, originalRank) => {
      const newRank = newRankOf.get(story.uId) ?? originalRank;
      if (newRank - originalRank >= 3) {
        warnings.push(
          `a história #${posOf.get(story.uId)} perdeu proeminência: era a ` +
            `${originalRank + 1}ª maior e passou a ${newRank + 1}ª`
        );
      }
    });
  }

  const heightBefore = totalHeight(original);
  const heightAfter = totalHeight(merged);
  if (heightBefore <= ROW_START_CAP && heightAfter > ROW_START_CAP) {
    warnings.push(
      `a página passou das ${ROW_START_CAP} linhas (${heightAfter}) — acima ` +
        `disso o Tailwind não gera classes lg:row-start e o posicionamento ` +
        `em desktop deixa de ser garantido`
    );
  }
  if (heightAfter > Math.ceil(heightBefore * 1.25)) {
    warnings.push(
      `a página cresceu de ${heightBefore} para ${heightAfter} linhas`
    );
  }

  return { errors, warnings };
}

// ---------------------------------------------------------------------------
// Prompt building
// ---------------------------------------------------------------------------

export interface StoryPromptMeta {
  title: string;
  antetitulo?: string;
  chamadaManchete?: string;
  chamadaDestaque?: string;
  excerpt?: string;
  author?: string;
  categories: string[];
  isOpinion: boolean;
  /** e.g. "1600×900 (apaisada, 16:9)"; undefined = sem imagem */
  imageDescription?: string;
}

export const REDESIGN_SYSTEM_PROMPT =
  "És o diretor de arte do PÁGINA UM, jornal digital independente português. " +
  "A primeira página foi montada à mão pelos editores numa grelha e está " +
  "funcional mas pouco harmoniosa: módulos desalinhados, tudo com o mesmo " +
  "peso, aspeto de caixas empilhadas. O teu trabalho é redesenhá-la — " +
  "manter as decisões editoriais intactas e melhorar apenas a composição " +
  "visual, como faria um diretor de arte de um grande diário europeu.\n\n" +
  "A GRELHA E O FORMATO DA RESPOSTA:\n" +
  "- A página tem 10 colunas de largura; a altura mede-se em linhas de " +
  "~48px. Uma coluna equivale a cerca de 2,5 linhas de altura, portanto um " +
  "bloco 4×10 (largura×altura) é aproximadamente quadrado.\n" +
  "- Descreves a página como BANDAS empilhadas de cima para baixo. Cada " +
  "banda tem COLUNAS da esquerda para a direita, cujas larguras somam " +
  "exatamente 10. Cada coluna tem um ou mais blocos empilhados; as alturas " +
  "dos blocos de cada coluna somam a altura da banda (a coluna mais alta " +
  "define-a). É isto que garante uma página sem buracos e com os topos " +
  "alinhados — o que faz uma página parecer desenhada.\n" +
  "- Blocos de história e de categoria: altura mínima de 4 linhas e largura " +
  "mínima de 2 colunas. Blocos estáticos podem ter 1 linha (uma banda " +
  "inteira de 1 linha é ótima para separadores).\n" +
  "- Usa bandas de alturas variadas (por exemplo 5 a 12 linhas) e mantém a " +
  "altura total próxima da original, nunca acima de 56 linhas se a " +
  "original o respeitar.\n\n" +
  "VOCABULÁRIO DE DESIGN (campos opcionais por bloco de história; omite um " +
  "campo para manter o valor atual):\n" +
  "- style: \"classic\" = cartão tradicional de broadsheet, título serifado " +
  "(Playfair Display), antetítulo em etiqueta; \"modern\" = imagem a sangrar " +
  "todo o bloco com gradiente e texto branco por cima — forte, para usar " +
  "com moderação (1 a 3 por página) e só com boas fotografias.\n" +
  "- orientation: \"horizontal\" = imagem ao lado do texto, pede blocos " +
  "largos (largura ≥ 5); \"vertical\" = imagem por cima do texto, pede " +
  "blocos altos e estreitos.\n" +
  "- reverse: troca o lado (ou a ordem vertical) da imagem — usa para " +
  "alternar o ritmo entre blocos vizinhos.\n" +
  "- hideImage: cartão só de texto. Bom para opinião e para aliviar zonas " +
  "com demasiadas fotografias.\n" +
  "- expandImage: a imagem preenche o bloco no estilo classic.\n" +
  "- extraBigTitle: título em corpo de manchete — reserva-o para a peça " +
  "dominante, no máximo duas.\n" +
  "- objectPosition (top/bottom/center/left/right): foco do recorte da " +
  "fotografia; escolhe segundo o formato da imagem indicado nos metadados.\n" +
  "- antetituloColor: \"auto\" salvo se quiseres forçar o azul de opinião " +
  "(\"opiniao\") ou o vermelho noticioso (\"noticia\", #cf2e2e).\n" +
  "- titleScale (s/m/l/xl): corpo do título. Constrói uma escala " +
  "tipográfica coerente com a hierarquia: xl só na manchete, l nos " +
  "destaques, m no corrente, s nos blocos pequenos ou densos.\n" +
  "- titleFont: \"playfair\" (serifa clássica, o corpo do jornal) ou " +
  "\"instrument\" (serifa mais elegante e contemporânea) — usa instrument " +
  "com parcimónia, para dar personalidade a opinião ou cultura.\n" +
  "- titleAlign: \"center\" só em módulos a toda a largura com vocação de " +
  "manchete; caso contrário omite.\n" +
  "- showChamada: false esconde o texto de apoio — bom para blocos " +
  "pequenos, para zonas densas e para arejar bandas com muitos títulos.\n" +
  "- density (compact/normal/airy): ritmo vertical interno do cartão.\n\n" +
  "COMPOSIÇÃO:\n" +
  "- Uma manchete dominante, claramente maior do que tudo o resto.\n" +
  "- Varia as larguras dos módulos entre bandas para quebrar o efeito de " +
  "tabuleiro de xadrez; dentro de cada banda, alinha os topos.\n" +
  "- Ajusta orientation ao formato do bloco e ao formato da fotografia.\n" +
  "- Usa cartões sem imagem para criar ritmo e marcar a opinião como " +
  "opinião.\n\n" +
  "REGRAS INVIOLÁVEIS (a proposta é rejeitada automaticamente se falhar " +
  "qualquer uma):\n" +
  "1. A ordem de leitura é uma decisão editorial. Cada bloco vem numerado " +
  "pela sua posição de leitura (#1 a #N) e o campo `position` de cada bloco " +
  "da tua resposta refere esse número. A geometria final tem de reproduzir " +
  "essa ordem: sobre as posições finais ela é calculada pela chave " +
  "(y×6 + x) — sim, 6, por razões históricas do código. Na prática: coloca " +
  "os blocos nas bandas por ordem crescente de `position` (banda a banda, " +
  "esquerda para a direita) e tem cuidado com colunas empilhadas — o bloco " +
  "de baixo de uma coluna lê-se DEPOIS dos blocos de topo das colunas à " +
  "direita, e um bloco que comece numa linha inferior lê-se depois de tudo " +
  "o que começa nas linhas acima.\n" +
  "2. A proeminência relativa é uma decisão editorial: uma história com " +
  "mais área do que outra tem de manter pelo menos a mesma área relativa. " +
  "Podes mudar o formato (mais largo, mais alto), não o ranking.\n" +
  "3. Blocos de categoria e estáticos: podes reposicioná-los e " +
  "redimensioná-los, nunca alterar os campos de design.\n" +
  "4. Usa cada `position` de 1 a N exatamente uma vez — nunca omitas, " +
  "repitas ou inventes posições.";

/**
 * Stage-0 system prompt: a vision pass over a screenshot of the current
 * page that produces an art-direction brief. The brief is prepended to every
 * section prompt, which is also what keeps separately-generated sections
 * stylistically coherent.
 */
export const ART_DIRECTION_SYSTEM_PROMPT =
  "És o diretor de arte do PÁGINA UM, jornal digital independente " +
  "português. Vais receber uma captura de ecrã da primeira página tal como " +
  "está neste momento, montada à mão pelos editores. Analisa-a como " +
  "analisarias uma prova de página: o que a torna monótona, caixista ou " +
  "desequilibrada — hierarquia tipográfica plana, módulos todos do mesmo " +
  "tamanho, fotografias mal aproveitadas, zonas demasiado densas ou " +
  "demasiado vazias.\n\n" +
  "Depois escreve diretrizes CONCRETAS de estilo para o redesenho, sabendo " +
  "que quem as vai executar controla: a geometria dos módulos numa grelha " +
  "de 10 colunas; style classic/modern por história; titleScale s/m/l/xl; " +
  "titleFont playfair/instrument; showChamada; density compact/normal/airy; " +
  "hideImage; expandImage; objectPosition. Não podes mudar textos, ordem de " +
  "leitura nem hierarquia editorial. Sê específico (por exemplo: 'manchete " +
  "em xl com chamada visível; segunda banda com três módulos iguais em m " +
  "sem chamadas; opinião sem imagem, título em instrument').";

const artDirectionSection = (artDirection?: string): string[] =>
  artDirection
    ? [
        "DIREÇÃO DE ARTE PARA ESTA PÁGINA (segue estas diretrizes em todas " +
          "as secções):",
        artDirection,
        "",
      ]
    : [];

function describeBlockForLegend(
  block: Block,
  position: number,
  meta: Map<number, StoryPromptMeta>,
  areaRankLabel?: string
): string {
  const { width, height } = block.gridPosition;
  const geometry = `${width}×${height}, área ${width * height}`;

  if (block.blockType === "story") {
    const storyMeta = meta.get(block.databaseId);
    const title = block.title ?? storyMeta?.title ?? "(sem título)";
    return (
      `#${position} HISTÓRIA “${title}” — ${geometry}` +
      `${areaRankLabel ? ` (${areaRankLabel})` : ""}, ` +
      `${block.style}/${block.orientation}` +
      `${block.hideImage ? ", sem imagem" : ""}` +
      `${block.extraBigTitle ? ", título de manchete" : ""}`
    );
  }
  if (block.blockType === "category") {
    return `#${position} CATEGORIA “${block.wpCategoryName}” — ${geometry}`;
  }
  return `#${position} ESTÁTICO ${block.type} — ${geometry}`;
}

function describeStoryMeta(
  block: Block,
  position: number,
  meta: Map<number, StoryPromptMeta>
): string | null {
  if (block.blockType !== "story") return null;
  const storyMeta = meta.get(block.databaseId);
  if (!storyMeta) {
    return `#${position} (metadados indisponíveis no WordPress)`;
  }
  const lines = [
    `#${position} “${block.title ?? storyMeta.title}”`,
    storyMeta.antetitulo && `  Antetítulo: ${storyMeta.antetitulo}`,
    storyMeta.chamadaManchete && `  Chamada de manchete: ${storyMeta.chamadaManchete}`,
    storyMeta.chamadaDestaque && `  Chamada: ${storyMeta.chamadaDestaque}`,
    storyMeta.excerpt && `  Resumo: ${storyMeta.excerpt.slice(0, 140)}`,
    storyMeta.author && `  Autor: ${storyMeta.author}`,
    storyMeta.categories.length > 0 &&
      `  Secção: ${storyMeta.categories.join(", ")}${storyMeta.isOpinion ? " [OPINIÃO]" : ""}`,
    `  Fotografia: ${storyMeta.imageDescription ?? "sem imagem"}`,
  ];
  return lines.filter(Boolean).join("\n");
}

/** Blocks in reading order — position #k of the prompts is index k-1 here. */
export function blocksInReadingOrder(blocks: Block[]): Block[] {
  const byUid = new Map(blocks.map((block) => [block.uId, block]));
  return zigzagOrder(blocks).map((uId) => byUid.get(uId)!);
}

/** Consecutive [from, to] 1-based ranges of at most `size` positions. */
export function chunkRanges(
  total: number,
  size: number
): { from: number; to: number }[] {
  const ranges: { from: number; to: number }[] = [];
  for (let from = 1; from <= total; from += size) {
    ranges.push({ from, to: Math.min(from + size - 1, total) });
  }
  return ranges;
}

/**
 * The user prompt for one section of the page (a consecutive reading-order
 * range). Every block is identified by its GLOBAL reading position (#1..#N) —
 * legend, prominence labels and metadata all use the same numbers, and the
 * schema's `position` field refers straight back to them. Big pages are
 * generated section by section because the model reliably stops designing
 * after ~20 blocks in a single pass; sections stack, so their bands
 * concatenate into one page.
 */
export function buildRedesignPrompt(
  blocks: Block[],
  meta: Map<number, StoryPromptMeta>,
  chunk?: { from: number; to: number },
  artDirection?: string
): string {
  const readingOrder = blocksInReadingOrder(blocks);
  const { from, to } = chunk ?? { from: 1, to: readingOrder.length };
  const section = readingOrder.slice(from - 1, to);

  const rankedStories = readingOrder
    .map((block, i) => ({ block, position: i + 1 }))
    .filter(({ block }) => block.blockType === "story")
    .map(({ block, position }) => ({
      position,
      area: block.gridPosition.width * block.gridPosition.height,
    }))
    .sort((a, b) => b.area - a.area);
  const rankByPosition = new Map(
    rankedStories.map((entry, i) => [
      entry.position,
      `${i + 1}ª maior história da página`,
    ])
  );

  // Gapless packing of the section's cells needs exactly area/10 rows.
  const sectionRows = Math.round(
    section.reduce(
      (sum, block) =>
        sum + block.gridPosition.width * block.gridPosition.height,
      0
    ) / GRID_COLUMNS
  );

  const isWholePage = from === 1 && to === readingOrder.length;
  const intro = isWholePage
    ? "Redesenha a página completa."
    : from === 1
      ? `Estás a desenhar o TOPO da página (blocos #1 a #${to}, de um total ` +
        `de ${readingOrder.length}). A manchete vive aqui.`
      : `Estás a desenhar uma secção do MEIO/FIM da página (blocos #${from} ` +
        `a #${to}, de um total de ${readingOrder.length}). As tuas bandas ` +
        "ficam por baixo das secções anteriores — não é o topo, não precisa " +
        "de manchete.";

  return [
    intro,
    "",
    ...artDirectionSection(artDirection),
    "BLOCOS DESTA SECÇÃO, PELA ORDEM DE LEITURA (o campo `position` de cada " +
      "bloco da tua resposta é o número desta lista, e a geometria tem de " +
      "reproduzir esta ordem). Para cada bloco, mantém a ÁREA " +
      "(largura×altura) perto do valor indicado, no máximo ±20% — é isso " +
      "que preserva a hierarquia editorial; a forma (mais largo, mais alto) " +
      "é toda tua:",
    ...section.map((block, i) =>
      describeBlockForLegend(
        block,
        from + i,
        meta,
        rankByPosition.get(from + i)
      )
    ),
    "",
    "METADADOS DAS HISTÓRIAS:",
    ...section
      .map((block, i) => describeStoryMeta(block, from + i, meta))
      .filter((line): line is string => line !== null),
    "",
    `Devolve um objeto com \`bands\` (de cima para baixo) contendo os ` +
      `${section.length} blocos desta secção — cada \`position\` de ` +
      `${from} a ${to} exatamente uma vez, sem omitir nem inventar ` +
      "nenhuma. Cada banda tem `columns` (esquerda para a direita, larguras " +
      "a somar 10), cada coluna tem `blocks` empilhados — cada bloco com a " +
      "sua `position`, a altura e, quando quiseres alterá-los, os campos de " +
      `design. As bandas desta secção devem somar cerca de ${sectionRows} ` +
      "linhas de altura. Lembra-te: histórias e categorias precisam de " +
      "altura ≥ 4 linhas. Antes de responderes, confere que usaste cada " +
      `position de ${from} a ${to} exatamente uma vez.`,
  ].join("\n");
}
