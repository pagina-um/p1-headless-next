# Notícias

Como uma notícia normal chega ao site, e o que um PR pode e não pode fazer
com ela. Leia antes o `AGENTS.md` na raiz do repositório.

## O caminho de uma notícia

1. A redacção escreve e publica a notícia no WordPress: título, antetítulo,
   imagem de destaque, categorias, autor e corpo. O corpo é feito com os
   blocos normais do editor (parágrafos, títulos, imagens, citações,
   listas, vídeos do YouTube, áudios do Spotify) e, quando é preciso, um
   bloco **HTML personalizado**.
2. Ao publicar, o WordPress avisa o site, que refaz a página da notícia, a
   homepage e as páginas de categoria.
3. O site vai buscar a notícia por GraphQL e mostra-a em
   `/AAAA/MM/DD/<slug>`, com o cabeçalho do site, o cabeçalho da notícia, o
   leitor de áudio se existir, o corpo, a partilha e o rodapé.
4. O corpo vem como HTML e é convertido em React pelo parser
   (`src/utils/wpParsing.ts`): as imagens passam a `next/image`, as ligações
   externas abrem em nova janela, os vídeos e áudios ganham tamanho
   responsivo, e um bloco HTML com `<div data-infografia="<slug>"></div>`
   passa a ser a infografia registada com esse slug.
5. A notícia só aparece na homepage quando alguém a coloca na grelha em
   `/admin`.

Portanto: **o texto, as imagens e a publicação de uma notícia vivem no
WordPress e nunca passam por este repositório.** Não se abre um PR para
publicar, corrigir ou formatar uma notícia.

## O que um PR pode fazer por uma notícia

- **Dar-lhe uma peça interactiva.** Um mapa, uma cronologia, uma tabela
  explorável: é uma infografia, construída segundo
  `docs/infografias/README.md` e registada em `src/infografias/registry.ts`.
  Depois de o PR entrar, a redacção acrescenta ao artigo o bloco HTML com o
  marcador e a peça aparece no sítio certo do texto.
- **Fazer da peça a notícia inteira.** Quando a história *é* o mapa ou a
  cronologia, o artigo no WordPress fica com o título, o antetítulo, um ou
  dois parágrafos de contexto e o marcador. O resto é a infografia. Isto não
  precisa de nada diferente: é o mesmo contrato das infografias.
- **Ensinar o site a mostrar algo novo em todas as notícias.** Um tipo de
  bloco que o parser ainda não trata, um elemento novo no cabeçalho da
  notícia, uma mudança na tipografia do corpo. Isso muda-se em
  `src/components/post/` e em `src/utils/wpParsing.ts`, uma vez, para todas
  as notícias, nunca com excepções para uma notícia em particular. É um PR
  pequeno, com a notícia que o motivou indicada na descrição, e deve ser
  testado contra notícias existentes (`npm run dev` com a URL do WordPress,
  ou o preview da Vercel).
- **Pôr a notícia num sítio de destaque.** O bloco da homepage e a faixa do
  topo são escolhidos em `src/config/destaques.ts` e em `/admin`, não no
  código da notícia.

## O que não fazer

- Não copiar o texto de uma notícia para o repositório, nem como JSON nem
  como componente. Se uma peça precisa de dados que vêm de uma notícia,
  esses dados vão em JSON na pasta da peça, com a notícia como fonte.
- Não criar rotas por notícia (`src/app/<alguma-coisa>/page.tsx` para uma
  só notícia). A notícia já tem o seu endereço.
- Não tocar no WordPress, no GraphQL, no Redis, em `src/app/api/`, em
  variáveis de ambiente nem em `src/middleware.ts`.
- Não pôr HTML, CSS ou JavaScript em `public/`.

## Verificar e abrir o PR

As mesmas verificações e o mesmo formato de PR do `AGENTS.md`: ramo criado
no repositório (`feature/<o-que-muda>` para alterações ao renderizador,
`infografia/<slug>` para peças), `tsc`, `lint` e `build`, descrição com o
que é, a notícia que o motivou, como foi verificado e o que fica de fora.
