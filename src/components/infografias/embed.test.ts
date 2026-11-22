import {
  INFOGRAPHIC_HEIGHT_REQUEST_TYPE,
  INFOGRAPHIC_HEIGHT_TYPE,
  MAX_INFOGRAPHIC_HEIGHT,
  isInfographicHeightRequest,
  normaliseInfographicSrc,
  readInfographicHeight,
} from "./embed";

describe("native infographic source recognition", () => {
  test.each([
    [
      "/infografias/patrimonio-religioso/embed",
      "/infografias/patrimonio-religioso/embed",
    ],
    ["/infografias/mapa-2027/embed/", "/infografias/mapa-2027/embed"],
    ["https://paginaum.pt/infografias/mapa/embed", "/infografias/mapa/embed"],
    [
      "https://www.paginaum.pt/infografias/mapa/embed?ano=2024#modo=acumulado",
      "/infografias/mapa/embed?ano=2024#modo=acumulado",
    ],
    [
      "https://PAGINAUM.PT:443/infografias/mapa/embed",
      "/infografias/mapa/embed",
    ],
  ])("normalises %s to the current origin", (input, expected) => {
    expect(normaliseInfographicSrc(input)).toBe(expected);
  });

  test.each([
    undefined,
    null,
    "",
    "/projectos/patrimonio-religioso/infografia.html",
    "/infografias/embed",
    "/infografias/Mapa/embed",
    "/infografias/mapa/embed/outro",
    "/infografias/mapa/embed-outro",
    "/infografias/mapa%2Foutro/embed",
    "/outro/../infografias/mapa/embed",
    "/infografias/outro/../mapa/embed",
    "//paginaum.pt/infografias/mapa/embed",
    "http://paginaum.pt/infografias/mapa/embed",
    "https://externo.example/infografias/mapa/embed",
    "https://paginaum.pt.externo.example/infografias/mapa/embed",
    "https://externo.example@paginaum.pt/infografias/mapa/embed",
    "https://paginaum.pt@externo.example/infografias/mapa/embed",
    "https://paginaum.pt:8443/infografias/mapa/embed",
    "https://paginaum.pt/outro/../infografias/mapa/embed",
    "https://paginaum.pt/infografias/mapa\\embed",
    "https://paginaum.pt/infografias/mapa/\nembed",
    "javascript:/infografias/mapa/embed",
  ])("does not give native handling to %s", (input) => {
    expect(normaliseInfographicSrc(input)).toBeNull();
  });
});

describe("iframe height protocol", () => {
  const source = {} as Window;
  const otherWindow = {} as Window;
  const origin = "https://preview.example";
  const event = (height: unknown) => ({
    source,
    origin,
    data: { type: INFOGRAPHIC_HEIGHT_TYPE, height },
  });

  test("accepts content growth and shrink without a piece-specific ID", () => {
    expect(readInfographicHeight(event(800), source, origin)).toBe(800);
    expect(readInfographicHeight(event(1430.25), source, origin)).toBe(1431);
    expect(readInfographicHeight(event(800), source, origin)).toBe(800);
    expect(
      readInfographicHeight(event(MAX_INFOGRAPHIC_HEIGHT), source, origin)
    ).toBe(MAX_INFOGRAPHIC_HEIGHT);
  });

  test.each([
    "1200",
    null,
    undefined,
    0,
    -1,
    NaN,
    Infinity,
    MAX_INFOGRAPHIC_HEIGHT + 1,
  ])("rejects a malformed or out-of-range height: %s", (height) =>
    expect(readInfographicHeight(event(height), source, origin)).toBeNull()
  );

  test("rejects other frames, other origins and other message types", () => {
    expect(
      readInfographicHeight(
        { ...event(800), source: otherWindow },
        source,
        origin
      )
    ).toBeNull();
    expect(
      readInfographicHeight(
        { ...event(800), origin: "https://externo.example" },
        source,
        origin
      )
    ).toBeNull();
    expect(
      readInfographicHeight(
        { ...event(800), data: { type: "other", height: 800 } },
        source,
        origin
      )
    ).toBeNull();
    expect(
      readInfographicHeight({ ...event(800), data: null }, source, origin)
    ).toBeNull();
    expect(
      readInfographicHeight({ ...event(800), source: null }, null, origin)
    ).toBeNull();
  });

  test("identifies the height request independently of infographic subject", () => {
    expect(
      isInfographicHeightRequest({ type: INFOGRAPHIC_HEIGHT_REQUEST_TYPE })
    ).toBe(true);
    expect(isInfographicHeightRequest({ type: INFOGRAPHIC_HEIGHT_TYPE })).toBe(
      false
    );
    expect(isInfographicHeightRequest(null)).toBe(false);
    expect(isInfographicHeightRequest(INFOGRAPHIC_HEIGHT_REQUEST_TYPE)).toBe(
      false
    );
  });
});
