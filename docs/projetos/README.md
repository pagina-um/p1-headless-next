# Projetos especiais

Um **projeto especial** é uma secção autónoma do paginaum.pt: um arquivo, um
observatório, uma base de dados com pesquisa. Vive dentro do site, com o
cabeçalho, o rodapé e a tipografia do Página UM, em vez de ser um site à parte.
O [Corpus](https://corpus.paginaum.pt) é o exemplo externo; o Arquivo Político
é o primeiro feito por este caminho.

Este documento é o contrato. Quem (pessoa ou modelo) cria um projeto segue-o
à letra; o revisor confere-o antes de aceitar o PR.

## Onde vive cada coisa

| O quê | Onde |
| --- | --- |
| As páginas do projeto | `src/app/projetos/<slug>/` |
| O registo do projeto (nome, lema, cor, ícone, data) | `src/projetos/registry.ts`, lista `PROJETOS` |
| Onde o projeto é promovido (faixa do topo, bloco da homepage) | `src/config/destaques.ts` |
| A moldura comum (cabeçalho do projeto, navegação, rodapé) | `src/components/projetos/ProjetoShell.tsx` |
| O cartão usado em `/projetos` e na homepage | `src/components/projetos/ProjetoCard.tsx` |
| O modelo para copiar | `docs/projetos/template/` |

O URL público é `https://paginaum.pt/projetos/<slug>`. A lista de todos os
projetos está em `https://paginaum.pt/projetos` e é gerada a partir do registo.

Dentro da pasta do projeto:

```
src/app/projetos/<slug>/
├── page.tsx              página principal (Síntese)
├── casos/page.tsx        uma pasta por secção, cada uma com page.tsx
├── metodo/page.tsx
├── _components/          componentes só deste projeto
└── data/                 os dados, em JSON
```

## Criar um projeto, passo a passo

1. Escolha o `slug`: só letras minúsculas sem acentos, números e hífens
   (`arquivo-politico`). É o nome da pasta, o segmento do URL e a chave no
   registo. Tem de ser igual nos três sítios.
2. Copie `docs/projetos/template/` para `src/app/projetos/<slug>/` e mude a
   constante `SLUG` no `page.tsx`.
3. Acrescente o projeto à lista `PROJETOS` em `src/projetos/registry.ts`. Os
   campos estão comentados no ficheiro. A cor é a identidade do projeto: uma
   cor saturada e a sua variante escura (por exemplo `#1e3a8a` e `#172554`).
   Evite o vermelho do Página UM (`#cf2e2e`), que é da marca, e o verde do
   Corpus (`#009588`).
4. Ponha os dados em `data/*.json`, um ficheiro por tipo de entidade
   (`casos.json`, `partidos.json`, `pessoas.json`). Todos os registos do mesmo
   ficheiro têm os mesmos campos. Datas em `AAAA-MM-DD`. Cada registo com
   fonte (`{ "label": "...", "href": "..." }`).
5. Construa as secções. Cada secção é uma pasta com `page.tsx` que usa
   `<ProjetoShell slug={SLUG} nav={NAV}>` e devolve só o conteúdo. A lista
   `NAV` é a mesma em todas as páginas do projeto.
6. Para promover o projeto, edite `src/config/destaques.ts`:
   - `banner` é a faixa colorida por baixo do cabeçalho, em todas as páginas.
   - `blocoHomepage` é o projeto que o bloco "Projeto em destaque" mostra na
     grelha da homepage. O bloco em si é adicionado à grelha por quem tem
     acesso a `/admin`; o PR só escolhe o projeto.
7. Verifique (secção abaixo) e abra o PR.

## Linguagem de design

O site é sóbrio, tipográfico e sem decoração gratuita. Um projeto deve parecer
uma secção do Página UM, não um site de terceiros.

- **Tipografia.** Títulos em `font-serif` (Playfair Display), `font-bold`.
  Texto corrido sem serifa, a do sistema, que é o que o resto do site usa.
  `font-instrument` (Instrument Serif) só para um título gigante de abertura,
  como no banner da Cultura, nunca em texto. Rótulos pequenos em maiúsculas
  com espaçamento: `text-[11px] uppercase tracking-wider text-stone-500`.
- **Cor.** Fundo da página `bg-gray-100` (já vem do layout). Cartões brancos:
  `bg-white border border-gray-200 rounded-md shadow-sm`. A cor do projeto
  entra em pormenores (barra, ícone, link ativo, números-chave) e nos fundos
  dos cartões promocionais, não em fundos de texto corrido. Texto principal
  `text-stone-900`, secundário `text-stone-600`, terciário `text-stone-500`.
- **Largura.** Contentor `max-w-7xl mx-auto px-4` (a moldura já o dá). Texto
  corrido dentro de `max-w-3xl`. Listas e tabelas podem usar a largura toda.
- **Texto corrido.** Dentro da moldura, `h2`, `h3`, `p`, `ul`, `ol` e `table`
  simples já ficam formatados pela classe `projeto-content`. Não lhes ponha
  classes de tamanho de letra.
- **Números-chave.** Três ou quatro, nunca mais, no formato do modelo.
- **Tabelas largas** ficam dentro de `<div className="overflow-x-auto">`.
  Nada pode fazer a página deslizar na horizontal num telemóvel.
- **Ícones** só da biblioteca `lucide-react`, já instalada.
- **Imagens** em `public/projetos/<slug>/`, servidas com `next/image` e com
  `alt`. Nada de fotografias de pessoas sem autorização confirmada.
- **Telemóvel primeiro.** Escreva as classes para o ecrã pequeno e acrescente
  `md:` e `lg:` para os maiores. Teste a 390 px de largura.
- **Tom.** Português europeu, sem anglicismos, frases curtas. Toda a afirmação
  factual tem fonte. Um projeto que cataloga processos judiciais lembra, na
  Síntese e no Método, que uma acusação não é prova de culpa.

## O que não fazer

- Não instalar dependências. Se parecer indispensável, pergunte no PR antes.
- Não tocar no WordPress, no GraphQL, no Redis, em `src/app/api/`, em
  variáveis de ambiente nem em `src/middleware.ts`.
- Não editar ficheiros fora de `src/app/projetos/<slug>/`,
  `public/projetos/<slug>/`, `src/projetos/registry.ts` e
  `src/config/destaques.ts`. Se o projeto precisar de outra coisa, explique no
  PR e deixe o revisor decidir.
- Não alterar `src/styles/globals.css` nem o `tailwind.config.js`.
- Não usar `"use client"` a não ser no componente que precisa de reagir ao
  leitor (pesquisa, filtros, ordenação). Esse componente recebe os dados por
  propriedade; não vai buscá-los à rede.
- Não passar ficheiros de dados grandes (mais de 1 MB) a um componente
  `"use client"`: tudo o que ele recebe vai para o browser do leitor. Pagine
  ou pré-filtre no servidor.
- Não inventar dados, nomes nem fontes. Falta um dado? Fica em branco.

## Verificar antes do PR

Na raiz do repositório:

```bash
npm install
npx tsc --noEmit
npm run lint
npm run build
```

Os três comandos têm de terminar sem erros. Depois, `npm run dev` e abrir
`http://localhost:3000/projetos/<slug>` num ecrã largo e a 390 px de largura.
Confirme que `/projetos` lista o projeto e que a faixa e o bloco mostram o que
`destaques.ts` manda.

## O PR

- Ramo `projeto/<slug>` a partir de `main`.
- Um projeto por PR. Alterações a um projeto existente vão em PRs próprios.
- Título: `Projeto: <nome do projeto>`.
- Descrição, neste modelo:

```
## O que é
Uma frase sobre o projeto e o que o leitor pode fazer nele.

## Secções
- /projetos/<slug> (Síntese): ...
- /projetos/<slug>/casos: ...

## Dados
Origem, data de extração, número de registos por ficheiro, o que falta.

## Promoção
Faixa do topo: sim/não. Bloco da homepage: sim/não.

## Verificação
tsc, lint e build sem erros; testado a 390 px e em ecrã largo.

## Fora deste PR
O que fica para depois, ou o que precisa de decisão do revisor.
```

Depois do merge, a Vercel publica sozinha. O bloco da homepage só aparece
quando alguém com acesso a `/admin` o adiciona à grelha e grava.
