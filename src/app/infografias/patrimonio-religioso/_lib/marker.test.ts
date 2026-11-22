import { renderToStaticMarkup } from "react-dom/server";
import parse from "html-react-parser";
import { parserOptions } from "@/utils/wpParsing";

jest.mock("@/services/config", () => ({ WP_URL: "https://backend.example" }));
// Keep the real parser and renderer without loading the registered server data.
jest.mock("@/components/infografias/InfografiaInline", () => {
  const React = jest.requireActual<typeof import("react")>("react");
  return {
    InfografiaInline: ({ slug }: { slug: string }) =>
      React.createElement(
        "figure",
        { "data-infografia": slug },
        "Infografia de património"
      ),
  };
});

test("replaces the article marker in place without consuming surrounding content", () => {
  const article = [
    "<p>Antes da infografia.</p>",
    '<div class="contexto"><p>Contexto do artigo.</p></div>',
    '<div data-infografia=" patrimonio-religioso "><p>Texto provisório do bloco.</p></div>',
    "<p>Depois da infografia.</p>",
  ].join("");

  expect(renderToStaticMarkup(parse(article, parserOptions))).toBe(
    [
      "<p>Antes da infografia.</p>",
      '<div class="contexto"><p>Contexto do artigo.</p></div>',
      '<figure data-infografia="patrimonio-religioso">Infografia de património</figure>',
      "<p>Depois da infografia.</p>",
    ].join("")
  );
});
