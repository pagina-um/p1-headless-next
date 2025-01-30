import { Block } from "@/types";
import {
  zigZagSortingFunction,
  sortBlocksZigzagThenMobilePriority,
} from "./sorting";

describe("zigZagSortingFunction", () => {
  it("sorts blocks by row-major order (y, x)", () => {
    const blocks: Block[] = [
      {
        uId: "c",
        type: "newsletter",
        gridPosition: { x: 2, y: 0, height: 1, width: 1 },
        mobilePriority: null,
        blockType: "static",
        content: "",
        title: "",
      },
      {
        uId: "b",
        gridPosition: { x: 1, y: 0, height: 1, width: 1 },
        mobilePriority: null,
        blockType: "static",
        content: "",
        title: "",
        type: "divider",
      },
      {
        uId: "a",
        gridPosition: { x: 0, y: 0, height: 1, width: 1 },
        mobilePriority: null,
        blockType: "static",
        content: "",
        title: "",
        type: "podcast",
      },
      {
        uId: "d",
        gridPosition: { x: 0, y: 1, height: 1, width: 1 },
        mobilePriority: null,
        blockType: "static",
        content: "",
        title: "",
        type: "newsletter",
      },
    ];

    const sorted = [...blocks].sort((a, b) =>
      zigZagSortingFunction(a, b, 3 /* gridWidth */)
    );
    // For y=0, x=0 => first; then x=1 => second; x=2 => third; then y=1 => next, etc.

    expect(sorted.map((b) => b.uId)).toEqual(["a", "b", "c", "d"]);
  });
});

describe("sortBlocksZigzagThenMobilePriority", () => {
  it("keeps normal zigzag order when mobilePriority is undefined or 0", () => {
    const blocks: Block[] = [
      {
        uId: "1",
        gridPosition: { x: 0, y: 0, width: 1, height: 1 },
        mobilePriority: null,
        blockType: "static",
        content: "",
        title: "",
        type: "newsletter",
      },
      {
        uId: "2",
        gridPosition: { x: 1, y: 0, width: 1, height: 1 },
        mobilePriority: null,
        blockType: "static",
        content: "",
        title: "",
        type: "newsletter",
      },
      {
        uId: "3",
        gridPosition: { x: 0, y: 1, width: 1, height: 1 },
        mobilePriority: null,
        blockType: "static",
        content: "",
        title: "",
        type: "newsletter",
      },
    ];

    const result = sortBlocksZigzagThenMobilePriority(blocks, 2);
    // In row-major order: "1", "2", then "3"
    expect(result.map((b) => b.uId)).toEqual(["1", "2", "3"]);
  });

  it("moves a block up by the amount of mobilePriority", () => {
    const blocks: Block[] = [
      {
        uId: "1",
        gridPosition: { x: 0, y: 0, width: 1, height: 1 },
        mobilePriority: null,
        blockType: "static",
        content: "",
        title: "",
        type: "newsletter",
      },
      {
        uId: "2",
        gridPosition: { x: 1, y: 0, width: 1, height: 1 },
        mobilePriority: null,
        blockType: "static",
        content: "",
        title: "",
        type: "newsletter",
      },
      {
        uId: "3",
        gridPosition: { x: 0, y: 1, width: 1, height: 1 },
        mobilePriority: null,
        blockType: "static",
        content: "",
        title: "",
        type: "newsletter",
      },
      {
        uId: "4",
        gridPosition: { x: 1, y: 1, width: 1, height: 1 },
        mobilePriority: 1,
        blockType: "static",
        content: "",
        title: "",
        type: "newsletter",
      },
    ];

    const result = sortBlocksZigzagThenMobilePriority(blocks, 2);

    expect(result.map((b) => b.uId)).toContain("4");

    console.log(
      "TEST result order:",
      result.map((b) => b.uId)
    );

    expect(result.findIndex((b) => b.uId === "4")).toBeLessThan(
      result.findIndex((b) => b.uId === "3")
    );
  });
});
