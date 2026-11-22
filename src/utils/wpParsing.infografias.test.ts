import { renderToStaticMarkup } from "react-dom/server";
import parse from "html-react-parser";
import { parserOptions } from "./wpParsing";
import { DEFAULT_INFOGRAPHIC_HEIGHT } from "@/components/infografias/embed";

jest.mock("@/services/config", () => ({ WP_URL: "https://backend.example" }));
// Exercise the parser boundary without loading registered server-only data.
jest.mock("@/components/infografias/InfografiaInline", () => {
  const React = jest.requireActual<typeof import("react")>("react");
  return {
    InfografiaInline: ({ slug }: { slug: string }) =>
      React.createElement("figure", { "data-inline-slug": slug }),
  };
});

function rendered(html: string): string {
  return renderToStaticMarkup(parse(html, parserOptions));
}

describe("article infographic and iframe parsing", () => {
  test("the inline marker coexists with native frames and preserves the article", () => {
    const html = rendered(
      '<p>Antes da infografia.</p><div data-infografia=" patrimonio-religioso "><p>Placeholder do editor.</p></div><iframe src="/infografias/patrimonio-religioso/embed"></iframe><p>Depois da infografia.</p>'
    );
    expect(html).toContain('<p>Antes da infografia.</p>');
    expect(html).toContain('<figure data-inline-slug="patrimonio-religioso"></figure>');
    expect(html).toContain('src="/infografias/patrimonio-religioso/embed"');
    expect(html).toContain(`height="${DEFAULT_INFOGRAPHIC_HEIGHT}"`);
    expect(html).toContain('<p>Depois da infografia.</p>');
    expect(html).not.toContain("Placeholder do editor.");
    expect(html).not.toContain("aspect-ratio");
  });

  test("native infographic URLs get automatic-height frames, not video sizing", () => {
    const html = rendered('<iframe src="https://www.paginaum.pt/infografias/patrimonio-religioso/embed" title="Mapa documentado" width="500" height="281"></iframe>');
    expect(html).toContain('src="/infografias/patrimonio-religioso/embed"');
    expect(html).toContain('title="Mapa documentado"');
    expect(html).toContain(`height="${DEFAULT_INFOGRAPHIC_HEIGHT}"`);
    expect(html).toContain('class="block w-full max-w-full border-0"');
    expect(html).not.toContain("aspect-ratio");
    expect(html).not.toContain("<script");
  });

  test("future native slugs and relative URLs use the same component", () => {
    const html = rendered('<iframe src="/infografias/mapa-2027/embed?ano=2024#modo=acumulado"></iframe>');
    expect(html).toContain('src="/infografias/mapa-2027/embed?ano=2024#modo=acumulado"');
    expect(html).toContain("Infografia interactiva do PÁGINA UM");
    expect(html).not.toContain("aspect-ratio");
  });

  test("existing video dimensions retain the existing responsive ratio", () => {
    const html = rendered('<iframe src="https://www.youtube.com/embed/example" width="500" height="281"></iframe>');
    expect(html).toContain("width:100%");
    expect(html).toContain("height:auto");
    expect(html).toContain("aspect-ratio:500 / 281");
  });

  test("external lookalikes remain ordinary embeds and never get proxied", () => {
    const html = rendered('<iframe src="https://externo.example/infografias/mapa/embed"></iframe>');
    expect(html).toContain('src="https://externo.example/infografias/mapa/embed"');
    expect(html).toContain('style="max-width:100%"');
    expect(html).not.toContain("aspect-ratio");
    expect(html).not.toContain("height:auto");
    expect(html).not.toContain('class="block w-full');
  });

  test.each([
    'width="500"',
    'height="600"',
    'width="0" height="300"',
    'width="500" height="-1"',
    'width="auto" height="300"',
  ])("external frames retain their styles without two positive dimensions (%s)", (dimensions) => {
    const html = rendered(
      `<iframe src="https://externo.example/widget" ${dimensions} style="height:640px;border:0"></iframe>`
    );
    expect(html).toContain('style="max-width:100%;height:640px;border:0"');
    expect(html).not.toContain("aspect-ratio");
    expect(html).not.toContain("height:auto");
  });
});
