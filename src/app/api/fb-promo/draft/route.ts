import { NextResponse } from "next/server";
import { generateObject } from "ai";
import { z } from "zod";
import { getClient, GET_POST_BY_ID } from "@/services/wp-graphql";
import { facebookConfigured } from "@/services/facebook";
import { verifyAdminToken } from "@/services/admin-token";
import { htmlToTtsText } from "@/utils/htmlToText";
import {
  fitToLimit,
  plainErrorMessage,
  stripTags,
} from "@/utils/promoDraft";
import type { CustomPostFields } from "@/types";
import { FB_MAIN_MAX_CHARS } from "@/constants/fbPromo";
import { SITE_ORIGIN } from "@/constants/xPromo";

export const maxDuration = 60;

// Routed through the Vercel AI Gateway, same as Corpus. Needs
// AI_GATEWAY_API_KEY locally; on Vercel the OIDC token covers it.
const MODEL = process.env.AI_MODEL ?? "anthropic/claude-sonnet-4.6";

// The brief. Same newsroom voice as the X one, but Facebook's mechanics are
// different: the link travels with the post as a preview card (no reach
// penalty, no reply trick), and the feed folds long posts behind «Ver mais» —
// so the fact has to land in the first line.
const BRIEF =
  "És editor de redes sociais do PÁGINA UM, jornal digital independente " +
  "português, e escreves a publicação com que uma peça acabada de publicar " +
  "vai ser promovida na página do jornal no Facebook.\n\n" +
  "A REGRA PRINCIPAL: dá a notícia, não anuncies o artigo.\n" +
  "A publicação é a notícia, escrita em duas a quatro frases. Quem passar os " +
  "olhos e não clicar em nada fica a saber o que aconteceu. Escreve como " +
  "quem conta a alguém o que se passou, não como quem divulga um link.\n\n" +
  "Mecânica do Facebook:\n" +
  "- O link da peça é anexado automaticamente como cartão de " +
  "pré-visualização, com imagem e título — nunca o escrevas no texto, nem " +
  "convides a clicar nele.\n" +
  "- O feed esconde o que passa das primeiras linhas atrás de «Ver mais»: a " +
  "primeira frase tem de conter o facto principal e aguentar-se sozinha.\n\n" +
  "Como abrir:\n" +
  "- Começa pelo facto novo e concreto: quem fez o quê, o que foi decidido, " +
  "o que foi revelado, quanto custou, quem ficou a perder.\n" +
  "- Nomes próprios ao de cima — pessoas, empresas, ministérios, tribunais. " +
  "São eles que fazem parar o scroll e que geram partilhas.\n" +
  "- Se a peça é uma investigação do PÁGINA UM, lidera com o que ela " +
  "apurou; nunca com o facto de existir uma investigação.\n" +
  "- Não repitas o título à letra: o cartão do link já o mostra por baixo " +
  "da publicação. Usa um ângulo do corpo do texto.\n\n" +
  "Nunca escrevas:\n" +
  "- Fórmulas de divulgação: 'novo artigo', 'já disponível', 'acabámos de " +
  "publicar', 'saiba mais', 'leia aqui', 'não perca', 'em exclusivo', " +
  "'fique a saber'.\n" +
  "- Perguntas de isco ('Sabia que...?'), reticências de suspense, promessas " +
  "do que o leitor vai encontrar no artigo.\n" +
  "- Emojis, hashtags, pontos de exclamação, MAIÚSCULAS de ênfase, links, " +
  "@menções, ou o nome do jornal (o cartão do link já o identifica).\n\n" +
  "Registo:\n" +
  "- Português europeu, sóbrio, factual e direto. Frases curtas.\n" +
  "- Os leitores reconhecem texto de IA pelos seus tiques, e é preciso " +
  "evitá-los todos: " +
  "nunca uses travessões nem hífenes para apartes (usa vírgulas, ou faz duas " +
  "frases); nada de construções 'não é X, é Y' ou 'mais do que X, Y'; nada " +
  "de enumerações de três elementos em série; nada de frase final a resumir " +
  "ou a dar significado ao que já foi dito. Varia o ritmo: uma frase longa e " +
  "uma curta valem mais do que duas do mesmo tamanho.\n" +
  "- Nunca afirmes nada que não esteja na peça. Se a peça atribui uma " +
  "acusação a alguém, a publicação atribui também — não a transforma em " +
  "facto assente.\n" +
  "- Números e datas em formato pt-PT (36,2%, 12 500 euros, 3 de março).\n" +
  `- Comprimento: aponta para 200 a 350 caracteres e nunca passes de ` +
  `${FB_MAIN_MAX_CHARS}. Conta os caracteres antes de responderes.\n\n` +
  "Ajusta ao género da peça (vem indicado na secção e no corpo):\n" +
  "- Notícia, investigação ou reportagem: dá o facto, com o seu contexto. " +
  "Não menciones o autor quando for Pedro Almeida Vieira.\n" +
  "- Editorial, crónica ou opinião: menciona sempre o autor, seja ele quem " +
  "for — dá a tese dele e atribui-lha explicitamente ('Para [autor], ...'), " +
  "porque é a opinião dele e não do jornal.\n" +
  "- Entrevista: cita ou parafraseia a afirmação mais forte do " +
  "entrevistado, dizendo quem é.\n" +
  "- Cultura, artes ou desporto: dá o juízo ou o acontecimento concreto, " +
  "sem promoção nem tom de agenda.";

const Draft = z.object({
  text: z
    .string()
    .describe(
      "A notícia em duas a quatro frases, tal como sai no Facebook: sem " +
        "link, sem hashtags, sem o nome do jornal, com o facto principal na " +
        `primeira frase, máx. ${FB_MAIN_MAX_CHARS} caracteres.`
    ),
});

/**
 * Admin-only: draft the Facebook post for a published WordPress story. The
 * editor reviews and edits the text in the dialog before anything reaches
 * Facebook; the link card is Facebook's own rendering of the article URL.
 */
export async function POST(req: Request) {
  if (!verifyAdminToken(req.headers.get("x-admin-token"))) {
    return NextResponse.json({ error: "não autorizado" }, { status: 401 });
  }

  const { postId } = (await req.json().catch(() => ({}))) as {
    postId?: number | string;
  };
  if (!postId) {
    return NextResponse.json({ error: "postId em falta" }, { status: 400 });
  }

  const { data, error } = await getClient()
    .query(GET_POST_BY_ID, { id: String(postId) })
    .toPromise();
  const post = data?.post;
  if (error || !post) {
    return NextResponse.json(
      { error: "não foi possível carregar a peça no WordPress" },
      { status: error ? 502 : 404 }
    );
  }

  // The generated schema types the ACF group as {} — same cast the rest of the
  // codebase uses (see utils/categoryUtils.ts).
  const fields = (post.postFields ?? {}) as CustomPostFields;
  const linkUrl = `${SITE_ORIGIN}${post.uri ?? `/${post.slug}`}`;
  const title = stripTags(post.title ?? "");
  const body = htmlToTtsText(post.content ?? "", title);
  // What the link card will most likely show — Facebook reads it from the
  // article's Open Graph tags, which use the featured image.
  const cardImage = post.featuredImage?.node?.sourceUrl ?? null;
  // The section tells the model which genre it is writing about — a chronicle
  // and an investigation want very different posts.
  const sections = (post.categories?.nodes ?? [])
    .map((category) => category?.name)
    .filter(Boolean)
    .join(", ");

  try {
    const { object: draft } = await generateObject({
      model: MODEL,
      schema: Draft,
      system: BRIEF,
      prompt:
        `Título: ${title}\n` +
        (fields.antetitulo ? `Antetítulo: ${stripTags(fields.antetitulo)}\n` : "") +
        (fields.chamadaManchete
          ? `Chamada de manchete: ${stripTags(fields.chamadaManchete)}\n`
          : "") +
        (fields.chamadaDestaque
          ? `Chamada: ${stripTags(fields.chamadaDestaque)}\n`
          : "") +
        (sections ? `Secção: ${sections}\n` : "") +
        (post.author?.node?.name ? `Autor: ${post.author.node.name}\n` : "") +
        (post.date
          ? `Publicada a: ${new Date(post.date).toLocaleDateString("pt-PT")}\n`
          : "") +
        `\nCorpo (excerto):\n${body.slice(0, 6000)}`,
    });

    const text = await fitToLimit(
      MODEL,
      draft.text.trim(),
      FB_MAIN_MAX_CHARS,
      "publicação"
    );

    return NextResponse.json({
      title,
      text: text.text,
      linkUrl,
      cardImage,
      configured: facebookConfigured(),
      warning: text.cut
        ? "O texto excedia o limite e foi cortado na última frase completa — reveja antes de publicar."
        : undefined,
    });
  } catch (e) {
    console.error("[fb-promo] draft failed", e);
    // The editor can still write the post by hand — return everything else.
    return NextResponse.json({
      title,
      text: "",
      linkUrl,
      cardImage,
      configured: facebookConfigured(),
      warning:
        e instanceof Error
          ? `A IA não gerou texto (${plainErrorMessage(e.message)}). Escreva a publicação manualmente.`
          : "A IA não gerou texto. Escreva a publicação manualmente.",
    });
  }
}
