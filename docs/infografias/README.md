# Infografias

Uma **infografia** é uma peça interactiva que pertence a uma notícia: um
mapa, uma cronologia, uma tabela explorável, um gráfico com filtros. Não é um
projecto especial (não aparece em `/projectos`) e não tem promoção própria. O
artigo mostra-a no meio do texto, como se fosse um parágrafo.

Leia antes o `AGENTS.md` na raiz do repositório e o `docs/design.md`. Este
documento é o contrato para infografias; o revisor confere-o antes de aceitar
o PR.

## Como funciona

1. A peça é um componente React, `src/app/infografias/<slug>/_components/Infografia.tsx`,
   com `export default`.
2. O componente é registado em `src/infografias/registry.ts`, com o slug, o
   título e uma importação preguiçosa.
3. No WordPress, quem edita o artigo acrescenta um bloco **HTML
   personalizado** com uma única linha:

   ```html
   <div data-infografia="<slug>"></div>
   ```

   O site substitui essa linha pelo componente, com a tipografia e a largura
   do artigo. Não há iframes, nem scripts no artigo, nem páginas de
   incorporação.
4. A mesma peça tem uma página própria em `/infografias/<slug>`, para se
   partilhar por si, construída em `src/app/infografias/<slug>/page.tsx`.

## Onde vive

```
src/app/infografias/<slug>/
├── page.tsx                    página própria: cabeçalho, a peça, rodapé
├── _components/Infografia.tsx  a peça (export default), componente de servidor
├── _components/*.client.tsx    a parte interactiva ("use client")
└── data/                       os dados, em JSON
src/infografias/registry.ts     uma entrada por infografia
public/infografias/<slug>/      só imagens estáticas, se houver
```

Nada mais entra em `public/`: nunca HTML, CSS ou JavaScript.

## Construir a peça

1. Escolha o `slug` (minúsculas sem acentos, números e hífens) e crie a pasta.
2. Ponha os dados em `data/*.json`, um ficheiro por tipo (registos,
   geografia, categorias). Campos iguais em todos os registos do mesmo
   ficheiro; datas `AAAA-MM-DD`; cada registo com fonte.
3. `Infografia.tsx` é um componente de servidor: importa os JSON, prepara o
   que for preciso e passa os dados por propriedade a um único componente
   `"use client"` que trata de pesquisa, filtros, cronologia e reprodução. O
   mapa é SVG gerado a partir do ficheiro de geografia.
4. A peça preenche a largura que lhe derem. Dentro de um artigo essa largura
   é a coluna de texto (cerca de 56 rem em ecrã largo, o ecrã inteiro em
   telemóvel); na página própria é o contentor do site. Nada de larguras
   fixas, nada de `100vh`.
5. `page.tsx` devolve `<Header />`, um `main` com
   `max-w-7xl mx-auto px-4 py-8 md:py-12` com a peça dentro, e
   `<PostFooter />`. Pode acrescentar uma linha a dizer a que notícia
   pertence, com ligação.
6. Registe a peça em `src/infografias/registry.ts`.
7. Aspecto: `docs/design.md`. Classes Tailwind, tipografia e cores do site,
   ícones `lucide-react`. Sem CSS próprio, sem cabeçalho ou marca próprios:
   a peça vive dentro do jornal.
8. Telemóvel primeiro. A peça tem de funcionar a 390 px de largura sem fazer
   a página deslizar na horizontal; tabelas largas dentro de
   `overflow-x-auto`.

Peso: o código e os dados da peça carregam com o artigo. Mantenha o que vai
para o browser abaixo de 1 MB; simplifique a geografia (os concelhos não
precisam de precisão de metros) e pré-calcule no servidor o que puder.

## O que não fazer

- Não instalar dependências. Se parecer indispensável, pergunte no PR antes.
- Não tocar no WordPress, no GraphQL, no Redis, em `src/app/api/`, em
  variáveis de ambiente, em `src/middleware.ts`, em `src/styles/globals.css`
  nem no `tailwind.config.js`.
- Não editar ficheiros fora de `src/app/infografias/<slug>/`,
  `public/infografias/<slug>/` e `src/infografias/registry.ts`.
- Não inventar dados, nomes nem fontes. Nada de fotografias de pessoas sem
  autorização confirmada.

## Verificar antes do PR

```bash
npx tsc --noEmit
npm run lint
npm run build   # precisa do WordPress; sem ele, confie no preview da Vercel
```

Depois, `npm run dev` e abrir `/infografias/<slug>` num ecrã largo e a
390 px. Para ver a peça dentro de um artigo sem WordPress, crie uma página
temporária que use `<PostContent content={'<div data-infografia="<slug>"></div>'} />`
e apague-a antes do PR.

## O PR

Ramo `infografia/<slug>` criado no próprio repositório (ver `AGENTS.md`), PR
para `main`, título `Infografia: <nome da peça>`. Descrição com: o que é e
a que notícia pertence; dados (origem, data de corte, número de registos, o
que falta); verificação; o que fica fora do PR. Uma infografia por PR. O PR
não publica nada: o artigo só mostra a peça quando a redacção acrescentar o
bloco HTML no WordPress.
