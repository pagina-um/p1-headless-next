import { NextResponse } from "next/server";
import { generateObject } from "ai";
import { z } from "zod";
import { getClient, GET_POST_BY_ID } from "@/services/wp-graphql";
import { twitterConfigured } from "@/services/twitter";
import { verifyAdminToken } from "@/services/admin-token";
import { extractPostImages } from "@/utils/postImages";
import { htmlToTtsText } from "@/utils/htmlToText";
import { cutAtSentence } from "@/utils/xPromoText";
import type { CustomPostFields } from "@/types";
import {
  DEFAULT_REPLY_TEXT,
  MAIN_MAX_CHARS,
  REPLY_MAX_CHARS,
  SITE_ORIGIN,
} from "@/constants/xPromo";

export const maxDuration = 60;

// Routed through the Vercel AI Gateway, same as Corpus. Needs
// AI_GATEWAY_API_KEY locally; on Vercel the OIDC token covers it.
const MODEL = process.env.AI_MODEL ?? "anthropic/claude-sonnet-4.6";

// The brief. Two things it has to get right: the post must read like the
// newsroom telling the news (not like a CMS announcing that an article
// exists), and it must obey X's mechanics — the link never enters the main
// post, because X suppresses posts that carry one. The link goes in the first
// reply instead, where the penalty doesn't apply.
const BRIEF =
  "És editor de redes sociais do PÁGINA UM, jornal digital independente " +
  "português, e escreves a publicação com que uma peça acabada de publicar " +
  "vai ser promovida no X.\n\n" +
  "A REGRA PRINCIPAL: dá a notícia, não anuncies o artigo.\n" +
  "A publicação é a notícia, escrita em duas ou três linhas. Quem passar os " +
  "olhos e não clicar em nada fica a saber o que aconteceu. Escreve como " +
  "quem conta a alguém o que se passou, não como quem divulga um link.\n\n" +
  "Como abrir:\n" +
  "- Começa pelo facto novo e concreto: quem fez o quê, o que foi decidido, " +
  "o que foi revelado, quanto custou, quem ficou a perder.\n" +
  "- Nomes próprios ao de cima — pessoas, empresas, ministérios, tribunais. " +
  "São eles que fazem parar o scroll e que geram partilhas.\n" +
  "- Se a peça é uma investigação do PÁGINA UM, lidera com o que ela " +
  "apurou; nunca com o facto de existir uma investigação.\n" +
  "- Não repitas o título à letra. Podes usar um ângulo do corpo do texto " +
  "que seja mais forte do que o título.\n\n" +
  "Nunca escrevas:\n" +
  "- Fórmulas de divulgação: 'novo artigo', 'já disponível', 'acabámos de " +
  "publicar', 'saiba mais', 'leia aqui', 'não perca', 'em exclusivo', " +
  "'fique a saber'.\n" +
  "- Perguntas de isco ('Sabia que...?'), reticências de suspense, promessas " +
  "do que o leitor vai encontrar no artigo.\n" +
  "- Emojis, hashtags, pontos de exclamação, MAIÚSCULAS de ênfase, links, " +
  "@menções, ou o nome do jornal (o link na resposta já o identifica).\n\n" +
  "Registo:\n" +
  "- Português europeu, sóbrio, factual e direto. Frases curtas.\n" +
  "- Nunca afirmes nada que não esteja na peça. Se a peça atribui uma " +
  "acusação a alguém, a publicação atribui também — não a transforma em " +
  "facto assente.\n" +
  "- Números e datas em formato pt-PT (36,2%, 12 500 euros, 3 de março).\n" +
  `- Comprimento: aponta para 150 a 200 caracteres e nunca passes de ` +
  `${MAIN_MAX_CHARS}. Posts curtos rendem mais no X do que posts que enchem ` +
  "o limite. Conta os caracteres antes de responderes.\n\n" +
  "Ajusta ao género da peça (vem indicado na secção e no corpo):\n" +
  "- Notícia, investigação ou reportagem: dá o facto, com o seu contexto.\n" +
  "- Crónica ou opinião: dá a tese do autor e atribui-lha explicitamente " +
  "('Para [autor], ...'), porque é a opinião dele e não do jornal.\n" +
  "- Entrevista: cita ou parafraseia a afirmação mais forte do " +
  "entrevistado, dizendo quem é.\n" +
  "- Cultura, artes ou desporto: dá o juízo ou o acontecimento concreto, " +
  "sem promoção nem tom de agenda.\n\n" +
  "Escreve também o texto da primeira resposta, que é onde o link vai " +
  "aparecer: uma frase curta que acrescente algo — o ângulo que não coube na " +
  "publicação, o que a peça mostra em detalhe, quem assina a investigação — " +
  "e que termine de forma a que o link surja naturalmente a seguir. Não " +
  "escrevas o link nem repitas a publicação por outras palavras.";

const Draft = z.object({
  text: z
    .string()
    .describe(
      "A notícia em duas ou três linhas, tal como sai no X: sem link, sem " +
        `hashtags, sem o nome do jornal, máx. ${MAIN_MAX_CHARS} caracteres.`
    ),
  replyText: z
    .string()
    .describe(
      "O texto da primeira resposta, que antecede o link. Sem link, máx. " +
        `${REPLY_MAX_CHARS} caracteres.`
    ),
});

/**
 * Admin-only: draft the X post for a published WordPress story and hand back
 * the pictures available for it. The editor reviews and edits everything in
 * the dialog before anything reaches X.
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
  const images = extractPostImages(post.content, post.featuredImage?.node);
  const linkUrl = `${SITE_ORIGIN}${post.uri ?? `/${post.slug}`}`;
  const title = stripTags(post.title ?? "");
  const body = htmlToTtsText(post.content ?? "", title);
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

    const text = await fitToLimit(draft.text.trim(), MAIN_MAX_CHARS, "publicação");
    const reply = draft.replyText?.trim()
      ? await fitToLimit(draft.replyText.trim(), REPLY_MAX_CHARS, "resposta")
      : { text: DEFAULT_REPLY_TEXT, cut: false };

    return NextResponse.json({
      title,
      text: text.text,
      replyText: reply.text,
      images,
      linkUrl,
      configured: twitterConfigured(),
      warning:
        text.cut || reply.cut
          ? "O texto excedia o limite e foi cortado na última frase completa — reveja antes de publicar."
          : undefined,
    });
  } catch (e) {
    console.error("[x-promo] draft failed", e);
    // The editor can still write the post by hand — return everything else.
    return NextResponse.json({
      title,
      text: "",
      replyText: DEFAULT_REPLY_TEXT,
      images,
      linkUrl,
      configured: twitterConfigured(),
      warning:
        e instanceof Error
          ? `A IA não gerou texto (${plain(e.message)}). Escreva a publicação manualmente.`
          : "A IA não gerou texto. Escreva a publicação manualmente.",
    });
  }
}

/** AI SDK errors arrive colourised for a terminal; the dialog is not one. */
function plain(message: string): string {
  return message.replace(/\u001b\[[0-9;]*m/g, "").replace(/\s+/g, " ").trim();
}

function stripTags(html: string): string {
  return html
    .replace(/<[^>]+>/g, "")
    .replace(/&#8217;|&rsquo;/g, "’")
    .replace(/&#8211;|&ndash;/g, "–")
    .replace(/&amp;/g, "&")
    .replace(/&nbsp;/g, " ")
    .trim();
}

/**
 * Bring an over-long draft under the limit. Models can't count characters, so
 * an overshoot is routine — but cutting the text leaves the editor with a post
 * that stops mid-sentence, so ask for a rewrite first and only cut as a last
 * resort, at a sentence boundary and with the editor told it happened.
 */
async function fitToLimit(
  text: string,
  max: number,
  kind: string
): Promise<{ text: string; cut: boolean }> {
  if (text.length <= max) return { text, cut: false };

  try {
    const { object } = await generateObject({
      model: MODEL,
      schema: z.object({ text: z.string() }),
      system:
        "Reescreves textos jornalísticos para caberem num limite de " +
        "caracteres, sem os empobrecer.",
      prompt:
        `Este texto de ${kind} tem ${text.length} caracteres e o limite é ` +
        `${max}. Reescreve-o com ${max} caracteres ou menos.\n\n` +
        "Regras: mantém o facto principal e os nomes próprios; corta o que " +
        "for acessório em vez de encurtar as frases até ficarem telegráficas; " +
        "devolve frases completas e pontuadas; mesmo registo, português " +
        "europeu; sem link, sem hashtags, sem emojis.\n\n" +
        `Texto:\n${text}`,
    });
    const rewritten = object.text.trim();
    if (rewritten && rewritten.length <= max) return { text: rewritten, cut: false };
    return { text: cutAtSentence(rewritten || text, max), cut: true };
  } catch (e) {
    console.error("[x-promo] rewrite to fit failed", e);
    return { text: cutAtSentence(text, max), cut: true };
  }
}

