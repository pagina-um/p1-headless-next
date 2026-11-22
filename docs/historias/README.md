# Histórias

Uma **história** é uma notícia escrita directamente neste repositório, sem
passar pelo WordPress. Fica no mesmo endereço das outras notícias,
`/AAAA/MM/DD/<slug>`, com o mesmo cabeçalho, a mesma tipografia, a mesma
partilha e o mesmo rodapé. O leitor não a distingue de uma notícia do
WordPress.

Leia antes o `AGENTS.md` na raiz do repositório e o `docs/design.md`. Este
documento é o contrato para histórias; o revisor confere-o antes de aceitar
o PR.

## Onde vive

```
src/historias/<slug>/
├── Historia.tsx          o corpo, em JSX (export default)
├── _components/          componentes só desta história, se precisar
└── data/                 dados em JSON, se precisar
src/historias/registry.ts  uma entrada por história: título, antetítulo,
                           lede, autor, data, imagem de abertura
public/historias/<slug>/   as fotografias da história
docs/historias/template/   o modelo para copiar
```

O site consulta o registo antes de perguntar ao WordPress, por isso uma
história com o mesmo slug de uma notícia do WordPress ganha-lhe. Escolha
slugs específicos.

## Criar uma história, passo a passo

1. Escolha o `slug` (minúsculas sem acentos, números e hífens) e a data de
   publicação, `AAAA-MM-DD`. A data define o URL.
2. Copie `docs/historias/template/Historia.tsx` para
   `src/historias/<slug>/Historia.tsx` e escreva o corpo. Só o corpo: o
   título, o antetítulo, o autor, a data e a imagem de abertura vão no
   registo e o site põe-nos no sítio certo.
3. Acrescente a entrada em `src/historias/registry.ts`, com
   `load: () => import("./<slug>/Historia")`.
4. Fotografias em `public/historias/<slug>/`, com `alt` descritivo e
   crédito na legenda. Nada de fotografias de pessoas sem autorização
   confirmada. Imagens com menos de 300 KB cada; redimensione para 1600 px
   de largura no máximo.
5. Se a história tem uma peça interactiva, é uma infografia segundo
   `docs/infografias/README.md`; importe-a no corpo onde ela deve aparecer.
6. Verifique e abra o PR.

## O corpo

Escreva em JSX com os elementos de uma notícia: `p`, `h2`, `h3`, `a`,
`strong`, `em`, `blockquote`, `figure` com `next/image` e `figcaption`,
`ul`, `ol`, `table` dentro de `overflow-x-auto`. A tipografia vem de fora e
é a das notícias do WordPress; não ponha classes de tamanho, cor ou margem
nos elementos de texto.

Português europeu com a ortografia anterior ao acordo de 1990. Frases
curtas. Toda a afirmação de facto tem fonte, em ligação no texto. Nada de
texto inventado, de citações inventadas nem de fontes inventadas: se não
tem a informação, não escreve.

## Depois do PR

- A história fica no ar assim que o PR entra em `main` e a Vercel publica.
- Para a pôr na capa, quem tem acesso a `/admin` encontra-a na lista
  «Histórias do repositório», ao lado das notícias do WordPress, e
  acrescenta-a à grelha como qualquer outra: mesmas opções de estilo
  (clássico ou moderno), orientação, imagem, título e chamada alteráveis.
  Há também o bloco estático «Histórias do repositório», que lista as quatro
  mais recentes automaticamente. Nada disto vai no PR.
- Não aparece nas páginas de categoria, no feed RSS, na pesquisa nem no
  sitemap, que vêm do WordPress. Se a história precisar de estar aí, diga-o
  na descrição do PR.
- Corrigir uma história publicada é outro PR, no ramo
  `historia/<slug>-<o-que-muda>`.

## O que não fazer

- Não instalar dependências.
- Não tocar no WordPress, no GraphQL, no Redis, em `src/app/api/`, em
  variáveis de ambiente, em `src/middleware.ts`, em `src/styles/globals.css`
  nem no `tailwind.config.js`.
- Não editar ficheiros fora de `src/historias/<slug>/`,
  `public/historias/<slug>/` e `src/historias/registry.ts`.
- Não pôr HTML, CSS ou JavaScript em `public/`.

## Verificar antes do PR

```bash
npx tsc --noEmit
npm run lint
npm run build   # precisa do WordPress; sem ele, confie no preview da Vercel
```

Depois, `npm run dev` e abrir `/AAAA/MM/DD/<slug>` num ecrã largo e a
390 px: cabeçalho, imagem de abertura, corpo e partilha. A homepage e as
outras notícias não carregam sem o WordPress; a história carrega.

## O PR

Ramo `historia/<slug>` criado no repositório, PR para `main`, título
`História: <título>`. Descrição com: o lede; as fontes principais; as
fotografias e os seus créditos; verificação; o que fica de fora. Uma
história por PR.
