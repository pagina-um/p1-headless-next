import {
  bandsToPlacements,
  mergeRedesign,
  resolvePlacements,
  validateRedesign,
  Placement,
  RedesignProposal,
} from "./redesign";
import { Block, CategoryBlock, StaticBlock, StoryBlock } from "@/types";

let nextId = 1;

function story(
  x: number,
  y: number,
  width: number,
  height: number,
  overrides: Partial<StoryBlock> = {}
): StoryBlock {
  return {
    uId: overrides.uId ?? `s${nextId++}`,
    blockType: "story",
    databaseId: 100 + nextId,
    postId: `post-${nextId}`,
    mobilePriority: null,
    gridPosition: { x, y, width, height },
    style: "classic",
    orientation: "horizontal",
    objectPosition: "center",
    hideImage: false,
    reverse: false,
    expandImage: false,
    extraBigTitle: false,
    antetituloColor: "auto",
    ...overrides,
  };
}

function category(
  x: number,
  y: number,
  width: number,
  height: number,
  overrides: Partial<CategoryBlock> = {}
): CategoryBlock {
  return {
    uId: overrides.uId ?? `c${nextId++}`,
    blockType: "category",
    wpCategoryId: 22,
    wpCategoryName: "Opinião",
    postsPerPage: 3,
    mobilePriority: null,
    gridPosition: { x, y, width, height },
    ...overrides,
  };
}

function staticBlock(
  x: number,
  y: number,
  width: number,
  height: number,
  overrides: Partial<StaticBlock> = {}
): StaticBlock {
  return {
    uId: overrides.uId ?? `t${nextId++}`,
    blockType: "static",
    title: "Newsletter",
    content: "Static content",
    type: "newsletter",
    mobilePriority: null,
    gridPosition: { x, y, width, height },
    ...overrides,
  };
}

/** Identity placement: same geometry, no design changes. */
function keep(block: Block): Placement {
  const { x, y, width, height } = block.gridPosition;
  return { uId: block.uId, x, y, width, height };
}

// A gapless 10-column layout: two stories on top, story + category below,
// full-width static strip at the bottom.
function baseLayout(): Block[] {
  return [
    story(0, 0, 6, 6, { uId: "lead", extraBigTitle: true }),
    story(6, 0, 4, 6, { uId: "second" }),
    story(0, 6, 5, 4, { uId: "third" }),
    category(5, 6, 5, 4, { uId: "cat" }),
    staticBlock(0, 10, 10, 1, { uId: "strip" }),
  ];
}

describe("mergeRedesign", () => {
  it("keeps identity fields and applies only the provided design fields", () => {
    const blocks = baseLayout();
    const merged = mergeRedesign(blocks, [
      { ...keep(blocks[0]), style: "modern", hideImage: true },
      ...blocks.slice(1).map(keep),
    ]);

    const lead = merged[0] as StoryBlock;
    expect(lead.databaseId).toBe((blocks[0] as StoryBlock).databaseId);
    expect(lead.postId).toBe((blocks[0] as StoryBlock).postId);
    expect(lead.uId).toBe("lead");
    expect(lead.style).toBe("modern");
    expect(lead.hideImage).toBe(true);
    // Fields the placement omitted keep their editor-chosen values.
    expect(lead.extraBigTitle).toBe(true);
    expect(lead.orientation).toBe("horizontal");
  });

  it("merges style tokens into styleTokens, preserving existing ones", () => {
    const blocks = [
      story(0, 0, 10, 4, {
        uId: "lead",
        styleTokens: { titleFont: "instrument" },
      }),
    ];
    const merged = mergeRedesign(blocks, [
      {
        ...keep(blocks[0]),
        titleScale: "xl",
        showChamada: false,
        density: "airy",
      },
    ]);
    expect((merged[0] as StoryBlock).styleTokens).toEqual({
      titleFont: "instrument",
      titleScale: "xl",
      showChamada: false,
      density: "airy",
    });

    // No tokens in the placement and none on the block -> stays undefined.
    const untouched = mergeRedesign(
      [story(0, 0, 10, 4, { uId: "plain" })],
      [{ uId: "plain", x: 0, y: 0, width: 10, height: 4 }]
    );
    expect((untouched[0] as StoryBlock).styleTokens).toBeUndefined();
  });

  it("never applies design fields to category or static blocks", () => {
    const blocks = baseLayout();
    const merged = mergeRedesign(blocks, [
      ...blocks.slice(0, 3).map(keep),
      { ...keep(blocks[3]), style: "modern", hideImage: true },
      { ...keep(blocks[4]), style: "modern" },
    ]);

    expect(merged[3]).not.toHaveProperty("style");
    expect(merged[3]).not.toHaveProperty("hideImage");
    expect(merged[4]).not.toHaveProperty("style");
  });

  it("recomputes category postsPerPage only when the size changes", () => {
    const blocks = baseLayout();
    const sameSize = mergeRedesign(blocks, [
      ...blocks.slice(0, 3).map(keep),
      { ...keep(blocks[3]), x: 0, y: 20 }, // moved, same size
      keep(blocks[4]),
    ]);
    expect((sameSize[3] as CategoryBlock).postsPerPage).toBe(3);

    const resized = mergeRedesign(blocks, [
      ...blocks.slice(0, 3).map(keep),
      { ...keep(blocks[3]), width: 10, height: 4 }, // landscape: floor(10/2)
      keep(blocks[4]),
    ]);
    expect((resized[3] as CategoryBlock).postsPerPage).toBe(5);

    const portrait = mergeRedesign(blocks, [
      ...blocks.slice(0, 3).map(keep),
      { ...keep(blocks[3]), width: 3, height: 6 }, // portrait: floor(6/1.5)
      keep(blocks[4]),
    ]);
    expect((portrait[3] as CategoryBlock).postsPerPage).toBe(4);
  });
});

describe("bandsToPlacements", () => {
  it("derives gapless coordinates from bands, columns and stacks", () => {
    const proposal: RedesignProposal = {
      bands: [
        {
          columns: [
            { width: 6, blocks: [{ position: 1, height: 8 }] },
            {
              width: 4,
              blocks: [
                { position: 2, height: 4 },
                { position: 3, height: 4 },
              ],
            },
          ],
        },
        { columns: [{ width: 10, blocks: [{ position: 4, height: 1 }] }] },
      ],
    };
    expect(bandsToPlacements(proposal)).toEqual([
      { position: 1, x: 0, y: 0, width: 6, height: 8 },
      { position: 2, x: 6, y: 0, width: 4, height: 4 },
      { position: 3, x: 6, y: 4, width: 4, height: 4 },
      { position: 4, x: 0, y: 8, width: 10, height: 1 },
    ]);
  });

  it("stretches the last column and last block to close each band", () => {
    const proposal: RedesignProposal = {
      bands: [
        {
          columns: [
            { width: 6, blocks: [{ position: 1, height: 10 }] },
            {
              // Declared width 3 (should be 4) and stack summing 8 (should
              // be 10): both get stretched to close the band.
              width: 3,
              blocks: [
                { position: 2, height: 4 },
                { position: 3, height: 4 },
              ],
            },
          ],
        },
      ],
    };
    const placements = bandsToPlacements(proposal);
    expect(placements[1]).toMatchObject({ x: 6, width: 4, height: 4 });
    expect(placements[2]).toMatchObject({ x: 6, y: 4, width: 4, height: 6 });
  });

  it("clamps an over-tall stack so a non-last block cannot swallow the band", () => {
    const proposal: RedesignProposal = {
      bands: [
        {
          columns: [
            { width: 5, blocks: [{ position: 1, height: 8 }] },
            {
              width: 5,
              blocks: [
                { position: 2, height: 12 },
                { position: 3, height: 4 },
              ],
            },
          ],
        },
      ],
    };
    const placements = bandsToPlacements(proposal);
    // Band height comes from the tallest declared stack (16), but every
    // block still lands inside its band with at least 1 row.
    const greedy = placements.find((p) => p.position === 2)!;
    const squeezed = placements.find((p) => p.position === 3)!;
    expect(greedy.y + greedy.height).toBe(squeezed.y);
    expect(squeezed.height).toBeGreaterThanOrEqual(1);
  });

  it("carries design fields through to the placement", () => {
    const proposal: RedesignProposal = {
      bands: [
        {
          columns: [
            {
              width: 10,
              blocks: [
                { position: 1, height: 8, style: "modern", hideImage: true },
              ],
            },
          ],
        },
      ],
    };
    const [placement] = bandsToPlacements(proposal);
    expect(placement.style).toBe("modern");
    expect(placement.hideImage).toBe(true);
  });
});

describe("resolvePlacements", () => {
  it("maps a clean position permutation onto reading-order uIds with design kept", () => {
    const blocks = [
      story(0, 0, 10, 4, { uId: "first" }),
      story(0, 4, 10, 4, { uId: "second" }),
      story(0, 8, 10, 4, { uId: "third" }),
    ];
    const resolved = resolvePlacements(blocks, [
      { position: 1, x: 0, y: 0, width: 10, height: 4, style: "modern" },
      { position: 3, x: 0, y: 8, width: 10, height: 4, reverse: true },
      { position: 2, x: 0, y: 4, width: 10, height: 4, hideImage: true },
    ])!;
    expect(resolved.map((p) => p.uId)).toEqual(["first", "third", "second"]);
    expect(resolved[0].style).toBe("modern");
    expect(resolved[1].reverse).toBe(true);
    expect(resolved[2].hideImage).toBe(true);
    expect(validateRedesign(blocks, resolved).errors).toEqual([]);
  });

  it("falls back to geometric order on duplicated positions, keeping design only where the claim matches", () => {
    const blocks = [
      story(0, 0, 10, 4, { uId: "first" }),
      story(0, 4, 10, 4, { uId: "second" }),
      story(0, 8, 10, 4, { uId: "third" }),
    ];
    // Positions 1, 1, 3 — not a permutation. Geometric order assigns
    // first/second/third top to bottom; the middle slot claimed 1 but sits
    // at rank 2, so its design is dropped.
    const resolved = resolvePlacements(blocks, [
      { position: 1, x: 0, y: 0, width: 10, height: 4, style: "modern" },
      { position: 1, x: 0, y: 4, width: 10, height: 4, hideImage: true },
      { position: 3, x: 0, y: 8, width: 10, height: 4, reverse: true },
    ])!;
    expect(resolved.map((p) => p.uId)).toEqual(["first", "second", "third"]);
    expect(resolved[0].style).toBe("modern");
    expect(resolved[1].hideImage).toBeUndefined();
    expect(resolved[2].reverse).toBe(true);
    expect(validateRedesign(blocks, resolved).errors).toEqual([]);
  });

  it("returns null when the slot count is wrong", () => {
    const blocks = [
      story(0, 0, 10, 4, { uId: "first" }),
      story(0, 4, 10, 4, { uId: "second" }),
    ];
    expect(
      resolvePlacements(blocks, [
        { position: 1, x: 0, y: 0, width: 10, height: 8 },
      ])
    ).toBeNull();
  });
});

describe("validateRedesign", () => {
  it("accepts the identity proposal with no errors", () => {
    const blocks = baseLayout();
    const { errors } = validateRedesign(blocks, blocks.map(keep));
    expect(errors).toEqual([]);
  });

  it("rejects missing, unknown and duplicated uIds", () => {
    const blocks = baseLayout();
    const placements = blocks.map(keep);

    const missing = validateRedesign(blocks, placements.slice(1));
    expect(missing.errors.some((e) => e.includes("em falta"))).toBe(true);

    const unknown = validateRedesign(blocks, [
      ...placements,
      { uId: "ghost", x: 0, y: 50, width: 5, height: 4 },
    ]);
    expect(unknown.errors.some((e) => e.includes("ghost"))).toBe(true);

    const duplicated = validateRedesign(blocks, [...placements, placements[0]]);
    expect(duplicated.errors.some((e) => e.includes("repetido"))).toBe(true);
  });

  it("rejects overlaps", () => {
    const blocks = baseLayout();
    const placements = blocks.map(keep);
    placements[1] = { ...placements[1], x: 4 }; // now overlaps the lead
    const { errors } = validateRedesign(blocks, placements);
    expect(errors.some((e) => e.includes("sobrepõe"))).toBe(true);
  });

  it("errors on big holes, warns on small ones", () => {
    const blocks = baseLayout();

    // Shrink the bottom strip: 3 empty cells -> warning only.
    const small = blocks.map(keep);
    small[4] = { ...small[4], width: 7 };
    const smallResult = validateRedesign(blocks, small);
    expect(smallResult.errors).toEqual([]);
    expect(smallResult.warnings.some((w) => w.includes("vazias"))).toBe(true);

    // Shrink the third story too: 3 + 10 empty cells -> hard error.
    const big = blocks.map(keep);
    big[4] = { ...big[4], width: 7 };
    big[2] = { ...big[2], y: 16 };
    const bigResult = validateRedesign(blocks, big);
    expect(bigResult.errors.some((e) => e.includes("vazias"))).toBe(true);
  });

  it("rejects a proposal that swaps two blocks' reading positions", () => {
    const blocks = [
      story(0, 0, 7, 4, { uId: "wide" }),
      story(7, 0, 3, 8, { uId: "tall" }),
      story(0, 4, 7, 4, { uId: "low" }),
    ];
    expect(validateRedesign(blocks, blocks.map(keep)).errors).toEqual([]);

    // Geometrically identical layout, but the two equal-area blocks (wide and
    // low) trade places — a pure reading-order violation, with no hierarchy
    // side effect since their areas are tied.
    const swapped: Placement[] = [
      { uId: "wide", x: 0, y: 4, width: 7, height: 4 },
      { uId: "tall", x: 7, y: 0, width: 3, height: 8 },
      { uId: "low", x: 0, y: 0, width: 7, height: 4 },
    ];
    const { errors } = validateRedesign(blocks, swapped);
    expect(errors).toHaveLength(1);
    expect(errors[0]).toContain("ordem de leitura");
  });

  it("uses the production factor-6 sort key, not a 10-column row-major", () => {
    // Under the production key (y*6 + x) a block at (7,0) reads AFTER one at
    // (0,1) — keys 7 vs 6 — while a naive 10-column key would order them the
    // other way. Original reading order (factor 6): A, C, B, D.
    const blocks = [
      staticBlock(0, 0, 7, 1, { uId: "A" }),
      staticBlock(0, 1, 7, 1, { uId: "C" }),
      story(7, 0, 3, 8, { uId: "B" }),
      story(0, 2, 7, 6, { uId: "D" }),
    ];
    expect(validateRedesign(blocks, blocks.map(keep)).errors).toEqual([]);

    // This proposal keeps the factor-6 order [A, C, B, D] but under a
    // factor-10 key its order differs from the original's — so a validator
    // regressed to row-major-by-10 would wrongly reject it.
    const proposal: Placement[] = [
      { uId: "A", x: 0, y: 0, width: 10, height: 1 },
      { uId: "C", x: 0, y: 1, width: 10, height: 1 },
      { uId: "B", x: 0, y: 2, width: 4, height: 8 },
      { uId: "D", x: 4, y: 2, width: 6, height: 8 },
    ];
    const { errors } = validateRedesign(blocks, proposal);
    expect(errors).toEqual([]);
  });

  it("rejects prominence inversions among the top stories", () => {
    const blocks = baseLayout(); // lead 36 cells, second 24, third 20
    const placements = blocks.map(keep);
    // Make "second" bigger than "lead".
    placements[0] = { ...placements[0], width: 4, height: 6 }; // lead: 24
    placements[1] = { ...placements[1], x: 4, width: 6, height: 6 }; // second: 36
    const { errors } = validateRedesign(blocks, placements);
    expect(errors.some((e) => e.includes("hierarquia"))).toBe(true);
  });

  it("treats equal-area stories as interchangeable", () => {
    const blocks = [
      story(0, 0, 5, 4, { uId: "a" }),
      story(5, 0, 5, 4, { uId: "b" }),
    ];
    // Reshape both (a wider, b taller) keeping order; areas end up different
    // but they started tied, so no hierarchy complaint.
    const placements: Placement[] = [
      { uId: "a", x: 0, y: 0, width: 6, height: 4 },
      { uId: "b", x: 6, y: 0, width: 4, height: 6 },
    ];
    const { errors } = validateRedesign(blocks, placements);
    expect(errors.filter((e) => e.includes("hierarquia"))).toEqual([]);
  });

  it("warns when the redesign pushes the page past the Tailwind row cap", () => {
    const blocks = [
      story(0, 0, 10, 50, { uId: "a" }),
      story(0, 50, 10, 5, { uId: "b" }),
    ];
    const placements: Placement[] = [
      { uId: "a", x: 0, y: 0, width: 10, height: 50 },
      { uId: "b", x: 0, y: 50, width: 10, height: 10 },
    ];
    const { warnings } = validateRedesign(blocks, placements);
    expect(warnings.some((w) => w.includes("56"))).toBe(true);
  });
});
