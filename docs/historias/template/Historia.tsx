import Image from "next/image";
// Uma infografia já registada pode entrar directamente no corpo:
// import Infografia from "@/app/infografias/<slug>/_components/Infografia";

/**
 * O corpo da história, em JSX. Só o texto e as figuras: o título, o
 * antetítulo, o autor, a data e a imagem de abertura vêm do registo
 * (src/historias/registry.ts) e são postos pelo site.
 *
 * Use só os elementos abaixo. A tipografia é a das notícias do WordPress e
 * vem de fora; não ponha classes de tamanho de letra nem de cor.
 */
export default function Historia() {
  return (
    <>
      <p>
        O primeiro parágrafo diz o essencial: o quê, quem, quando. Frases
        curtas, em português europeu com a ortografia anterior ao acordo.
        Cada afirmação de facto tem uma fonte, em ligação no próprio texto,
        como <a href="https://dre.pt/">este diploma</a>.
      </p>

      <p>
        Os parágrafos seguintes desenvolvem. Use <strong>negrito</strong> com
        parcimónia e <em>itálico</em> para títulos de obras e estrangeirismos.
      </p>

      <h2>Um subtítulo a cada três ou quatro parágrafos</h2>

      <p>
        Uma citação directa vai num bloco próprio, com a atribuição no fim.
      </p>

      <blockquote>
        <p>
          «O texto citado, entre aspas angulares, tal como foi dito.»
        </p>
        <footer>Nome do autor da citação, cargo, data</footer>
      </blockquote>

      <figure>
        <Image
          src="/historias/exemplo/foto.jpg"
          alt="O que se vê na fotografia, numa frase."
          width={1200}
          height={800}
          sizes="(max-width: 896px) 100vw, 896px"
          className="rounded-lg"
        />
        <figcaption>Legenda da fotografia. Crédito: Nome do fotógrafo.</figcaption>
      </figure>

      <ul>
        <li>Listas para enumerações curtas.</li>
        <li>Nunca para substituir parágrafos.</li>
      </ul>

      {/* <Infografia /> */}

      <p>
        O último parágrafo fecha. Não há assinatura aqui: o autor está no
        cabeçalho.
      </p>
    </>
  );
}
