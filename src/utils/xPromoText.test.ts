import { cutAtSentence } from "./xPromoText";

const MAX = 240;

describe("cutAtSentence", () => {
  it("leaves text that already fits untouched", () => {
    const text =
      "O Tribunal da Relação decretou o fim da ocultação das contas da IURD.";
    expect(cutAtSentence(text, MAX)).toBe(text);
  });

  it("ends on the last complete sentence rather than mid-sentence", () => {
    const text =
      "O Tribunal da Relação de Lisboa decretou o fim da ocultação das contas " +
      "da IURD. A decisão contraria o entendimento do regulador dos media, que " +
      "durante quatro anos aceitou que a igreja não entregasse as contas " +
      "anuais a que estava obrigada por lei desde 2019.";

    const out = cutAtSentence(text, MAX);

    expect(out.length).toBeLessThanOrEqual(MAX);
    expect(out).toBe(
      "O Tribunal da Relação de Lisboa decretou o fim da ocultação das contas da IURD."
    );
    expect(out).not.toContain("…");
  });

  it("marks the cut with an ellipsis when there is no sentence boundary", () => {
    const text =
      "O Tribunal da Relação de Lisboa decretou o fim da ocultação das contas " +
      "da IURD numa decisão que contraria o entendimento do regulador dos " +
      "media e que obriga a igreja a entregar as contas anuais a que estava " +
      "obrigada por lei desde 2019 sem mais adiamentos possiveis";

    const out = cutAtSentence(text, MAX);

    expect(out.length).toBeLessThanOrEqual(MAX);
    expect(out.endsWith("…")).toBe(true);
    // The regression this guards: a cut that stops mid-word with no marker.
    expect(out).not.toMatch(/\w$/);
  });

  it("does not leave a dangling comma before the ellipsis", () => {
    const text =
      "Segundo o acórdão, a que o PÁGINA UM teve acesso, o regulador aceitou " +
      "durante quatro anos que a igreja não entregasse contas, uma omissão que " +
      "a lei da transparência dos media não permite e que agora terá de ser " +
      "corrigida no prazo fixado, sem excepcoes";

    const out = cutAtSentence(text, MAX);

    expect(out.length).toBeLessThanOrEqual(MAX);
    expect(out).not.toMatch(/[,;:]…$/);
  });

  it("stays within the limit when the first sentence alone overflows", () => {
    const out = cutAtSentence(`${"A".repeat(300)}. Segunda frase.`, MAX);
    expect(out.length).toBeLessThanOrEqual(MAX);
  });
});
