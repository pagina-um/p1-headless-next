# Infografias

Uma **infografia** é uma peça interactiva que pertence a uma notícia: um
mapa, uma cronologia, uma tabela explorável, um gráfico com filtros. Não é um
projecto especial (não aparece em `/projectos`) e não tem promoção própria; é
o artigo que a mostra, incorporada no texto.

Leia antes o `AGENTS.md` na raiz do repositório e o `docs/design.md`. Este
documento é o contrato para infografias; o revisor confere-o antes de aceitar
o PR.

## Onde vive

```
src/app/infografias/<slug>/
├── page.tsx              versão autónoma, com cabeçalho e rodapé do site
├── embed/page.tsx        a mesma peça sem cabeçalho nem rodapé, para o artigo
├── _components/          componentes só desta peça
└── data/                 os dados, em JSON
```

- `/infografias/<slug>` é a página que se pode partilhar por si.
- `/infografias/<slug>/embed` é o que o artigo incorpora.
- Imagens estáticas, se houver, em `public/infografias/<slug>/`. Nada mais
  entra em `public/`: nunca HTML, CSS ou JavaScript.

## Como se incorpora no artigo

No WordPress, quem edita o artigo cola um iframe com o endereço da rota de
incorporação:

```html
<iframe src="https://paginaum.pt/infografias/<slug>/embed" title="<título da peça>" height="1200"></iframe>
```

O site reconhece iframes para `/infografias/<slug>/embed` e substitui-os por
um componente que ocupa a largura da coluna e acompanha a altura do conteúdo.
Para isso, a página `embed/page.tsx` envolve o conteúdo em
`<EmbedHeightReporter>` (de `src/components/embeds/`), que comunica a altura
ao artigo sempre que ela muda. O atributo `height` do iframe é só a altura
inicial, antes da primeira medição. Não é preciso, nem possível, pôr scripts
no artigo.

## Construir a peça

1. Escolha o `slug` (minúsculas sem acentos, números e hífens) e crie a pasta.
2. Ponha os dados em `data/*.json`, um ficheiro por tipo (registos,
   geografia, categorias). Campos iguais em todos os registos do mesmo
   ficheiro; datas `AAAA-MM-DD`; cada registo com fonte.
3. Escreva a peça como componentes React em `_components/`. O mapa é SVG
   gerado a partir do ficheiro de geografia. Pesquisa, filtros, cronologia e
   reprodução ficam num único componente `"use client"` que recebe os dados
   por propriedade. O resto são componentes de servidor.
4. `embed/page.tsx` devolve `<EmbedHeightReporter>` com a peça lá dentro, e
   nada mais: sem `Header`, sem `PostFooter`, sem título de página além do
   que a peça já tem.
5. `page.tsx` devolve `<Header />`, um `main` com `max-w-7xl mx-auto px-4
   py-8 md:py-12` com a mesma peça, e `<PostFooter />`. Pode acrescentar
   uma linha de contexto a dizer a que notícia pertence, com ligação.
6. Aspecto: `docs/design.md`. Classes Tailwind, tipografia e cores do site,
   ícones `lucide-react`. Sem CSS próprio, sem cabeçalho ou marca próprios:
   a peça vive dentro do jornal.
7. Telemóvel primeiro. A peça tem de funcionar a 390 px de largura sem fazer
   a página deslizar na horizontal; tabelas largas dentro de
   `overflow-x-auto`.

## O que não fazer

- Não instalar dependências. Se parecer indispensável, pergunte no PR antes.
- Não tocar no WordPress, no GraphQL, no Redis, em `src/app/api/`, em
  variáveis de ambiente, em `src/middleware.ts`, em `src/styles/globals.css`
  nem no `tailwind.config.js`.
- Não editar ficheiros fora de `src/app/infografias/<slug>/` e
  `public/infografias/<slug>/`.
- Não passar mais de 1 MB de dados a um componente `"use client"`; simplifique
  a geografia ou pré-filtre no servidor.
- Não inventar dados, nomes nem fontes. Nada de fotografias de pessoas sem
  autorização confirmada.

## Verificar antes do PR

```bash
npx tsc --noEmit
npm run lint
npm run build   # precisa do WordPress; sem ele, confie no preview da Vercel
```

Depois, `npm run dev` e abrir `/infografias/<slug>` e
`/infografias/<slug>/embed` num ecrã largo e a 390 px.

## O PR

Ramo `infografia/<slug>` no fork, PR para `pagina-um/p1-headless-next:main`,
título `Infografia: <nome da peça>`. Descrição com: o que é e a que notícia
pertence; dados (origem, data de corte, número de registos, o que falta);
verificação; o que fica fora do PR. Uma infografia por PR.
